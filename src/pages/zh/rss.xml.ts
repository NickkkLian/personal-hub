/**
 * 中文 RSS（双语 feed 之二）：/zh/rss.xml
 */
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { entries } from "../../lib/data";
import { pickLang } from "../../i18n";
import { siteConfig } from "../../config/site";

export async function GET(context: APIContext) {
  const site = (context.site ?? new URL(siteConfig.site.url)).href.replace(/\/$/, "");
  return rss({
    title: `${siteConfig.site.title.zh} — 文字`,
    description: siteConfig.site.tagline.zh,
    site: `${site}/zh/`,
    customData: `<language>zh-CN</language>`,
    items: entries("writing").map((e) => ({
      title: pickLang(e.title, "zh").value,
      description: pickLang(e.summary, "zh").value || String(e.extra.content ?? "").slice(0, 280),
      link: e.links[0]?.url ?? `${site}/zh/writing/`,
      guid: `${site}/zh/writing/#${e.id}`,
      ...(e.date ? { pubDate: new Date(e.date) } : {}),
    })),
  });
}
