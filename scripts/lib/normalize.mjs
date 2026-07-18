/**
 * 规范化与隐私过滤（BLUEPRINT 4.2 / 4.3）
 * - 统一输出 schema：{ id, module, title:{en,zh}, summary:{en,zh}, date, tags, cover, links, extra }
 * - 默认私有显式公开：*.public.json 来源整体放行（源头已筛选）；其余条目要求 public === true / visibility === "public"
 * - 剥离 schema 白名单之外的一切字段
 * - 展品编号（NO. 047）全站连续，跨模块累加
 */

const CJK = /[一-鿿぀-ヿ]/;

/** 单语字符串 → {en, zh} 双语字段（按字符集落入对应键，另一键 null） */
export function bilingual(value) {
  if (value == null || value === "") return { en: null, zh: null };
  if (typeof value === "object") {
    return { en: value.en ?? null, zh: value.zh ?? null };
  }
  const s = String(value);
  return CJK.test(s) ? { en: null, zh: s } : { en: s, zh: null };
}

function asDate(v) {
  if (!v) return null;
  const s = String(v).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

function asTags(v) {
  if (!Array.isArray(v)) return [];
  return v
    .filter((t) => typeof t === "string" && t.trim())
    .map((t) => t.trim())
    .slice(0, 12);
}

function asLinks(v) {
  if (!Array.isArray(v)) return [];
  return v
    .filter((l) => l && typeof l.url === "string" && /^https?:\/\//.test(l.url))
    .map((l) => ({ label: String(l.label ?? "link"), url: l.url }))
    .slice(0, 8);
}

/** extra 白名单：模块专属字段只放行这些键（防私密字段意外泄漏） */
const EXTRA_WHITELIST = new Set([
  "content", // 正文（双语包装）
  "category", // 分类显示名
  "section", // 来源 section type（书架分层/档案抽屉分类等）
  "sectionLabel",
  "artist", // music-wall
  "year",
  "tier",
  "tracks",
  "lat", // life
  "lng",
  "status",
  "stars", // projects
  "forks",
  "language",
  "topics",
  "featured",
  "platform", // social
  "audio", // my-music 试听文件 URL
  "demo", // my-music 内置音色演示标记
  "badge", // special 徽章图路径（public/badges/ 下，非证书原件）
  "issuer", // special 颁发机构名
  "location", // photography 拍摄地
  "no", // 展品编号（规范化阶段分配）
  "sourceDb", // 来源数据库 dbId（writing 模块区分两个源）
  "origLang", // 原文语言标记
]);

function pickExtra(extra) {
  const out = {};
  for (const [k, v] of Object.entries(extra ?? {})) {
    if (EXTRA_WHITELIST.has(k) && v !== undefined && v !== null && v !== "") out[k] = v;
  }
  return out;
}

/**
 * 校验 + 规范化一条条目。candidate 字段超出 schema 的一律丢弃。
 * 返回 null 表示该条目不合格（调用方记日志后跳过，不弄垮构建）。
 */
export function normalizeEntry(candidate, module) {
  if (!candidate || typeof candidate !== "object") return null;
  const id = candidate.id != null ? String(candidate.id) : null;
  const title = bilingual(candidate.title);
  if (!id || (!title.en && !title.zh)) return null; // id 与标题是底线

  const summary = bilingual(candidate.summary);
  const entry = {
    id,
    module,
    title,
    summary,
    date: asDate(candidate.date),
    tags: asTags(candidate.tags),
    cover:
      typeof candidate.cover === "string" && /^(https?:\/\/|\/)/.test(candidate.cover)
        ? candidate.cover
        : null,
    links: asLinks(candidate.links),
    extra: pickExtra(candidate.extra),
  };
  const lang = title.zh && !title.en ? "zh" : "en";
  entry.extra.origLang = lang;
  return entry;
}

/**
 * 把应用导出的标准 payload（{dbId,title,sections:[{type,label,items}]}）摊平为候选条目数组。
 * 来源是 *.public.json：源头已显式筛选，整体放行（仍走白名单剥离）。
 */
export function flattenPublicPayload(payload, module) {
  if (!payload || !Array.isArray(payload.sections)) {
    throw new Error("payload 缺少 sections 数组（不是合法的 *.public.json 导出）");
  }
  const out = [];
  for (const sec of payload.sections) {
    for (const it of sec.items ?? []) {
      out.push({
        id: it.id,
        title: it.name,
        summary: it.summary,
        date: asDate(it.updatedAt),
        tags: it.tags,
        cover: null,
        links: Array.isArray(it.links) ? it.links : [],
        extra: {
          content: it.content || null,
          category: it.category || null,
          section: sec.type ?? null,
          sectionLabel: sec.label ?? null,
          sourceDb: payload.dbId ?? null,
          // 模块专属字段直接从 item 透传，白名单兜底
          lat: it.lat,
          lng: it.lng,
        },
      });
    }
  }
  return out;
}

/** 非 public.json 来源的隐私闸门：默认私有，显式公开 */
export function isExplicitlyPublic(item) {
  return item?.public === true || item?.visibility === "public";
}

/** 展品编号：全站连续、跨模块累加（按模块顺序 → 条目顺序） */
export function assignExhibitNumbers(byModule, moduleOrder) {
  let no = 0;
  for (const m of moduleOrder) {
    for (const e of byModule[m] ?? []) {
      no += 1;
      e.extra.no = no;
    }
  }
  return no;
}
