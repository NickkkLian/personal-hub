// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Site URL: placeholder until the custom domain is registered (P5).
// Keep in sync with site.config.json → site.url
export default defineConfig({
  site: "https://personal-hub.pages.dev",
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
