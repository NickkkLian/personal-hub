/**
 * robots.txt：从 site 配置生成，域名变更时自动跟随。
 */
import type { APIContext } from "astro";
import { siteConfig } from "../config/site";

export function GET(context: APIContext) {
  const site = (context.site ?? new URL(siteConfig.site.url)).href.replace(/\/$/, "");
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap-index.xml\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
