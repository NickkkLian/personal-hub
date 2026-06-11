import type { ModuleId } from "../config/site";
import ProjectsPage from "./projects/Page.astro";
import WritingPage from "./writing/Page.astro";
import MusicWallPage from "./music-wall/Page.astro";
import MyMusicPage from "./my-music/Page.astro";
import KnowledgePage from "./knowledge/Page.astro";
import LifePage from "./life/Page.astro";
import MenuPage from "./menu/Page.astro";
import MysteryPage from "./mystery/Page.astro";
import SocialPage from "./social/Page.astro";
import AboutPage from "./about/Page.astro";

/**
 * 模块 → 页面组件映射。
 * P2+ 各模块换上差异化布局时只改各自的 Page.astro，路由层零改动。
 */
export const MODULE_PAGES: Record<Exclude<ModuleId, never>, (props: Record<string, unknown>) => unknown> = {
  projects: ProjectsPage,
  writing: WritingPage,
  "music-wall": MusicWallPage,
  "my-music": MyMusicPage,
  knowledge: KnowledgePage,
  life: LifePage,
  menu: MenuPage,
  mystery: MysteryPage,
  social: SocialPage,
  about: AboutPage,
};
