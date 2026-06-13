/**
 * 数据消费层：构建时读取 scripts/sync-data.mjs 产出的 normalized.json。
 * 用 fs 读取（而非 import）以容忍文件由 predev/prebuild 钩子即时生成。
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import type { LocalizedField } from "../i18n";
import type { ModuleId } from "../config/site";

// 构建打包后 import.meta.url 指向 chunk 而非源码目录——必须以项目根（process.cwd()）定位数据
const DATA_DIR = path.resolve(process.cwd(), "src/data");

export interface NormalizedEntry {
  id: string;
  module: string;
  title: LocalizedField;
  summary: LocalizedField;
  date: string | null;
  tags: string[];
  cover: string | null;
  links: { label: string; url: string }[];
  extra: {
    no?: number;
    content?: string | null;
    category?: string | null;
    section?: string | null;
    sectionLabel?: string | null;
    sourceDb?: string | null;
    origLang?: "en" | "zh";
    stars?: number;
    forks?: number;
    language?: string | null;
    topics?: string[];
    featured?: boolean;
    artist?: string;
    year?: number;
    lat?: number;
    lng?: number;
    status?: string;
    platform?: string;
    [k: string]: unknown;
  };
}

interface ModuleData {
  module: string;
  generatedAt: string;
  mode: string;
  count: number;
  entries: NormalizedEntry[];
}

const cache = new Map<string, ModuleData>();

export function moduleData(module: ModuleId | string): ModuleData {
  if (!cache.has(module)) {
    try {
      const raw = readFileSync(path.join(DATA_DIR, `${module}.normalized.json`), "utf8");
      cache.set(module, JSON.parse(raw) as ModuleData);
    } catch (e) {
      // 数据缺失时给空集且大声告警（绝不静默——曾因路径解析吞错导致整站空数据）
      console.warn(
        `⚠️ [data] ${module}.normalized.json 读取失败（先跑 npm run sync？）:`,
        (e as Error).message,
      );
      cache.set(module, { module, generatedAt: "", mode: "missing", count: 0, entries: [] });
    }
  }
  return cache.get(module)!;
}

export function entries(module: ModuleId | string): NormalizedEntry[] {
  return moduleData(module).entries;
}

/** 展品编号格式化：NO. 047 */
export function exhibitNo(e: NormalizedEntry): string {
  return `NO. ${String(e.extra.no ?? 0).padStart(3, "0")}`;
}

/** 条目是否"新"（30 天内），书架 NEW 书腰用 */
export function isNew(e: NormalizedEntry, days = 30): boolean {
  if (!e.date) return false;
  return Date.now() - new Date(e.date).getTime() < days * 86400_000;
}
