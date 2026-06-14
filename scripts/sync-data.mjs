#!/usr/bin/env node
/**
 * Personal Hub 数据同步（BLUEPRINT 第 4/6 章）
 *
 * 流程：sources.config.json 注册表 → 各 adapter 拉取 → 隐私过滤 →
 *       schema 校验/规范化（白名单剥离）→ 展品编号 → src/data/<module>.normalized.json
 *
 * 数据模式（环境变量 HUB_DATA_MODE）：
 *   auto（默认）：尝试真实源；源不存在/失败时落回该源的 mock 并告警 ——
 *                 站长在应用里点过「发布公开」后，无需任何改动自动切换为真实数据
 *   live：只用真实源；缺失时该源产出空集并告警（不弄垮构建）
 *   mock：全部强制用 mock（离线开发）
 *
 * 失败语义：单个源失败绝不让整次构建失败；逐源记录 ok/mock/empty 状态。
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  normalizeEntry,
  isExplicitlyPublic,
  assignExhibitNumbers,
  flattenPublicPayload,
} from "./lib/normalize.mjs";
import * as publicJson from "./adapters/public-json.mjs";
import * as githubApi from "./adapters/github-api.mjs";
import * as localJson from "./adapters/local-json.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// 本地开发时从 .env 读取可选环境变量（GH_READONLY_PAT 等）；CI 中由 Secrets 注入，无 .env 也不报错
try {
  const env = await readFile(path.join(ROOT, ".env"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
} catch {
  /* 无 .env，跳过 */
}

const MODE = process.env.HUB_DATA_MODE ?? "auto";
const ADAPTERS = { "public-json": publicJson, "github-api": githubApi, "local-json": localJson };
/** 与 src/config/site.ts 的 MODULE_REGISTRY 顺序一致（展品编号据此累加） */
const MODULE_ORDER = [
  "projects",
  "writing",
  "music-wall",
  "my-music",
  "knowledge",
  "life",
  "menu",
  "mystery",
  "social",
  "special",
  "about", // 无数据源，输出空集（home 门厅统一取数不告警）
];

const log = (s) => console.log(s);
const report = [];

async function loadMock(source) {
  if (!source.mock) return null;
  const raw = await readFile(path.join(ROOT, source.mock), "utf8");
  const data = JSON.parse(raw);
  // public-json 的 mock 与真实导出同构（{dbId,sections}），其余 mock 直接是条目数组
  return Array.isArray(data) ? data : flattenPublicPayload(data, source.module);
}

async function runSource(source, ctx) {
  const name = `${source.module} ← ${source.adapter}${source.file ? `(${source.file})` : ""}`;
  const adapter = ADAPTERS[source.adapter];
  if (!adapter) {
    report.push({ name, status: "error", detail: `未知 adapter: ${source.adapter}` });
    return [];
  }

  if (MODE !== "mock") {
    try {
      const items = await adapter.fetchSource(source, ctx);
      if (items !== null) {
        report.push({ name, status: "live", detail: `${items.length} 条原始条目` });
        return items;
      }
      // null = 真实源尚不存在（未发布）
    } catch (e) {
      report.push({ name, status: "live-error", detail: e.message });
      if (MODE === "live") return [];
      // auto 模式继续落回 mock
    }
  }

  if (MODE === "live") {
    report.push({ name, status: "empty", detail: "真实源不存在（live 模式不使用 mock）" });
    return [];
  }
  const mock = await loadMock(source);
  if (mock === null) {
    report.push({ name, status: "empty", detail: "无真实源也无 mock" });
    return [];
  }
  report.push({ name, status: "mock", detail: `${mock.length} 条模拟条目（真实源发布后自动切换）` });
  return mock;
}

async function main() {
  const cfg = JSON.parse(await readFile(path.join(ROOT, "sources.config.json"), "utf8"));
  const ctx = { publicRepo: cfg.publicRepo, warn: (m) => log(`  ⚠️  ${m}`) };

  const byModule = {};
  for (const source of cfg.sources) {
    const rawItems = await runSource(source, ctx);

    // 隐私闸门：public-json 来源整体放行（源头已显式筛选）；其余要求显式公开
    const gated = source.adapter === "public-json" ? rawItems : rawItems.filter(isExplicitlyPublic);
    const dropped = rawItems.length - gated.length;
    if (dropped > 0) log(`  🔒 ${source.module}: ${dropped} 条未显式公开，已拦截`);

    // 规范化 + 校验（不合格条目跳过并告警）
    const normalized = [];
    for (const item of gated) {
      const entry = normalizeEntry(item, source.module);
      if (entry) normalized.push(entry);
      else log(`  ⚠️  ${source.module}: 条目校验失败已跳过 (id=${item?.id ?? "?"})`);
    }
    (byModule[source.module] ??= []).push(...normalized);
  }

  // 模块内排序：featured 优先（projects），再按日期倒序
  for (const m of Object.keys(byModule)) {
    byModule[m].sort((a, b) => {
      const f = (b.extra.featured === true) - (a.extra.featured === true);
      if (f) return f;
      return (b.date ?? "").localeCompare(a.date ?? "");
    });
  }

  const total = assignExhibitNumbers(byModule, MODULE_ORDER);

  const outDir = path.join(ROOT, "src", "data");
  await mkdir(outDir, { recursive: true });
  for (const m of MODULE_ORDER) {
    const entries = byModule[m] ?? [];
    const out = {
      module: m,
      generatedAt: new Date().toISOString(),
      mode: MODE,
      count: entries.length,
      entries,
    };
    await writeFile(path.join(outDir, `${m}.normalized.json`), JSON.stringify(out, null, 2) + "\n");
  }

  log(`\n━━ 同步报告（模式: ${MODE}）━━`);
  for (const r of report) {
    const icon = { live: "✅", mock: "🟡", "live-error": "❌", empty: "⚪", error: "❌" }[r.status];
    log(`${icon} ${r.status.padEnd(10)} ${r.name} — ${r.detail}`);
  }
  log(`━━ 共 ${total} 条展品，输出 ${MODULE_ORDER.length} 个 normalized.json → src/data/`);

  // 真实源全部缺失且处于 live 模式时仍返回 0（保留上次数据由 CI 层处理）
  process.exit(0);
}

main().catch((e) => {
  console.error("同步失败:", e);
  process.exit(1);
});
