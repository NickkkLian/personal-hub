// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Site URL: live Cloudflare Pages domain (bare `personal-hub` was taken → `-7uc`).
// Update here + site.config.json → site.url if a custom domain is later registered.
export default defineConfig({
  site: "https://personal-hub-7uc.pages.dev",
  trailingSlash: "ignore",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: { en: "en", zh: "zh-CN" },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // 字体绝不内联进 CSS（CJK 小子集内联会让渲染阻塞的 CSS 暴涨）
      assetsInlineLimit: 0,
    },
  },
});
