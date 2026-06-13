import config from "../../site.config.json";

export type ModuleId =
  | "projects"
  | "writing"
  | "music-wall"
  | "my-music"
  | "knowledge"
  | "life"
  | "menu"
  | "mystery"
  | "social"
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
  knowledge: { id: "knowledge", slug: "knowledge", room: "--room-knowledge", roomNo: "V", order: 5 },
  life: { id: "life", slug: "life", room: "--room-life", roomNo: "VI", order: 6 },
  menu: { id: "menu", slug: "menu", room: "--room-menu", roomNo: "VII", order: 7 },
  mystery: { id: "mystery", slug: "mystery", room: "--room-mystery", roomNo: "VIII", order: 8 },
  social: { id: "social", slug: "channels", room: "--room-social", roomNo: "IX", order: 9 },
  about: { id: "about", slug: "about", room: "--room-about", roomNo: "X", order: 10 },
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
  about: {
    bio: { en: string; zh: string };
    timeline: { year: string; en: string; zh: string }[];
  };
  modules: Record<ModuleId, { enabled: boolean; nav?: boolean }>;
}

export const siteConfig = config as unknown as SiteConfig;

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
