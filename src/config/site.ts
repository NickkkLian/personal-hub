import config from "../../site.config.json";

export type ModuleId =
  | "projects"
  | "writing"
  | "music-wall"
  | "my-music"
  | "photography"
  | "knowledge"
  | "life"
  | "menu"
  | "mystery"
  | "social"
  | "special"
  | "about";

export interface ModuleMeta {
  id: ModuleId;
  /** URL slug，英文根路径与 /zh/ 前缀共用 */
  slug: string;
  /** tokens.css 中的房间色变量名（--room-*） */
  room: string;
  /** 展厅编号（凸版标签体系，全站连续） */
  roomNo: string;
  /** 导航与门厅排序 */
  order: number;
}

/**
 * 模块注册表：slug / 房间色 / 展厅编号。
 * 开关状态在 site.config.json，站长不需要碰这个文件。
 */
export const MODULE_REGISTRY: Record<ModuleId, ModuleMeta> = {
  projects: { id: "projects", slug: "projects", room: "--room-projects", roomNo: "I", order: 1 },
  writing: { id: "writing", slug: "writing", room: "--room-writing", roomNo: "II", order: 2 },
  "music-wall": { id: "music-wall", slug: "albums", room: "--room-music-wall", roomNo: "III", order: 3 },
  "my-music": { id: "my-music", slug: "music", room: "--room-my-music", roomNo: "IV", order: 4 },
  photography: { id: "photography", slug: "photography", room: "--room-photography", roomNo: "V", order: 5 },
  knowledge: { id: "knowledge", slug: "knowledge", room: "--room-knowledge", roomNo: "VI", order: 6 },
  life: { id: "life", slug: "life", room: "--room-life", roomNo: "VII", order: 7 },
  menu: { id: "menu", slug: "menu", room: "--room-menu", roomNo: "VIII", order: 8 },
  mystery: { id: "mystery", slug: "mystery", room: "--room-mystery", roomNo: "IX", order: 9 },
  social: { id: "social", slug: "channels", room: "--room-social", roomNo: "X", order: 10 },
  special: { id: "special", slug: "special", room: "--room-special", roomNo: "XI", order: 11 },
  about: { id: "about", slug: "about", room: "--room-about", roomNo: "XII", order: 12 },
};

export interface SiteConfig {
  site: {
    owner: string;
    url: string;
    title: { en: string; zh: string };
    tagline: { en: string; zh: string };
    email: string;
    socials: { label: string; url: string }[];
    web3formsKey: string;
    umamiWebsiteId: string;
  };
  fonts?: { display?: string; mono?: string };
  /** 各模块 feature 卡选中的条目 id（站长在 admin 后台填；留空 = 自动选置顶/最新一条） */
  featured?: Record<string, string>;
  /** 写作卡片体裁标注（admin 后台可编辑；替代原来源自动抓取的 sectionLabel，留空不显示） */
  writingLabel?: { en?: string; zh?: string };
  about: {
    bio: { en: string; zh: string };
    timeline: { year: string; en: string; zh: string }[];
  };
  modules: Record<ModuleId, { enabled: boolean; nav?: boolean }>;
}

export const siteConfig = config as unknown as SiteConfig;

/** 字体键 → CSS 家族名（admin 可改 site.config.fonts；BaseLayout 据此覆盖 --font-*） */
export const FONT_FAMILIES: { display: Record<string, string>; mono: Record<string, string> } = {
  display: {
    fraunces: '"Fraunces Variable"',
    playfair: '"Playfair Display Variable"',
    cormorant: '"Cormorant Variable"',
    marcellus: '"Marcellus"', // 古典罗马碑刻风（单一字重 400，站长 2026-07-21 选定为主字体）
  },
  // "mono" 槽位现作「小字标签字体」——含等宽与精致无衬线两类，值自带兜底栈
  mono: {
    manrope: '"Manrope Variable", system-ui, sans-serif',
    "space-mono": '"Space Mono", monospace',
    "ibm-plex-mono": '"IBM Plex Mono", monospace',
  },
};

/** 解析当前选定字体的 CSS 栈（含中文与兜底） */
export function fontStacks() {
  const d = siteConfig.fonts?.display ?? "fraunces";
  const m = siteConfig.fonts?.mono ?? "manrope";
  const display = `${FONT_FAMILIES.display[d] ?? FONT_FAMILIES.display.fraunces}, "Noto Serif SC", serif`;
  const mono = FONT_FAMILIES.mono[m] ?? FONT_FAMILIES.mono.manrope;
  return { display, mono };
}

/** 所有启用的模块（决定路由、首页门厅、sitemap） */
export function enabledModules(): ModuleMeta[] {
  return (Object.keys(MODULE_REGISTRY) as ModuleId[])
    .filter((id) => siteConfig.modules[id]?.enabled)
    .map((id) => MODULE_REGISTRY[id])
    .sort((a, b) => a.order - b.order);
}

/** 出现在导航栏的模块（enabled && nav） */
export function navModules(): ModuleMeta[] {
  return enabledModules().filter((m) => siteConfig.modules[m.id]?.nav);
}

/** 由 URL slug 反查模块（用于动态路由） */
export function moduleBySlug(slug: string): ModuleMeta | undefined {
  return enabledModules().find((m) => m.slug === slug);
}
