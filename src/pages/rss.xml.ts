/**
 * 英文 RSS（BLUEPRINT 2.1 / 7：writing 模块双语 feed 之一）。
 * 条目链接优先外部发布平台，否则指向书架页。
 */
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { entries } from "../lib/data";
import { pickLang } from "../i18n";
import { siteConfig } from "../config/site";

export async function GET(context: APIContext) {
  const site = (context.site ?? new URL(siteConfig.site.url)).href.replace(/\/$/, "");
  return rss({
    title: `${siteConfig.site.title.en} — Writing`,
    description: siteConfig.site.tagline.en,
    site: `${site}/`,
    customData: `<language>en</language>`,
    items: entries("writing").map((e) => ({
      title: pickLang(e.title, "en").value,
      description: pickLang(e.summary, "en").value || String(e.extra.content ?? "").slice(0, 280),
      link: e.links[0]?.url ?? `${site}/writing/`,
      guid: `${site}/writing/#${e.id}`,
      ...(e.date ? { pubDate: new Date(e.date) } : {}),
    })),
  });
}
