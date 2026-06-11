import en from "./en.json";
import zh from "./zh.json";

export type Locale = "en" | "zh";

export const LOCALES: Locale[] = ["en", "zh"];
export const DEFAULT_LOCALE: Locale = "en";

const dictionaries: Record<Locale, Record<string, unknown>> = { en, zh };

function lookup(dict: Record<string, unknown>, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

/**
 * UI 文案查询：按点路径取词条，缺失时回退英文，再缺失返回键名本身
 * （键名直接露出便于在走查时发现漏译）。
 */
export function t(locale: Locale, key: string): string {
  return lookup(dictionaries[locale], key) ?? lookup(dictionaries[DEFAULT_LOCALE], key) ?? key;
}

/** 内容双语字段：{ en, zh }，允许部分缺失 */
export interface LocalizedField {
  en?: string | null;
  zh?: string | null;
}

export interface PickedLang {
  value: string;
  /** 实际采用的语言 */
  lang: Locale;
  /** 是否发生了回退（用于条目角标注"原文：中文"） */
  fellBack: boolean;
}

/**
 * 内容字段双语回退：优先当前语言，缺失时回退另一语言并标记。
 * 数据层（P1）规范化输出的所有 {en, zh} 字段统一经过这里。
 */
export function pickLang(field: LocalizedField | string | null | undefined, locale: Locale): PickedLang {
  if (field == null) return { value: "", lang: locale, fellBack: false };
  if (typeof field === "string") return { value: field, lang: locale, fellBack: false };
  const preferred = field[locale];
  if (preferred) return { value: preferred, lang: locale, fellBack: false };
  const other: Locale = locale === "en" ? "zh" : "en";
  const fallback = field[other];
  if (fallback) return { value: fallback, lang: other, fellBack: true };
  return { value: "", lang: locale, fellBack: false };
}

/** 给路径加语言前缀：en 在根路径，zh 在 /zh/ 下 */
export function localizePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return locale === "zh" ? `/zh${clean === "/" ? "" : clean}` || "/zh" : clean;
}

/** 从 URL 判断当前语言 */
export function localeFromUrl(url: URL): Locale {
  return url.pathname === "/zh" || url.pathname.startsWith("/zh/") ? "zh" : "en";
}

export function altLocale(locale: Locale): Locale {
  return locale === "en" ? "zh" : "en";
}

/** 当前路径在另一语言下的对应路径（语言切换器用，保持页面不变） */
export function switchLocalePath(pathname: string): string {
  if (pathname === "/zh" || pathname.startsWith("/zh/")) {
    const stripped = pathname.replace(/^\/zh/, "");
    return stripped === "" ? "/" : stripped;
  }
  return pathname === "/" ? "/zh" : `/zh${pathname}`;
}
