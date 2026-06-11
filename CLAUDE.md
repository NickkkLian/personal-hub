# Personal Hub — 项目记忆

多领域个人网站（NickkkLian）。**唯一需求来源：`BLUEPRINT.md` v1.7**，遇到冲突以它为准；变更需求先改 BLUEPRINT 并提版本号。

## 技术栈与硬约束

- Astro 5（SSG）+ React 19 islands（按需水合，能不用 React 就不用）+ Tailwind CSS 4（经 `@tailwindcss/vite`，无 Astro integration）
- 设计令牌唯一来源：`src/styles/tokens.css`；Tailwind 语义工具类映射在 `src/styles/global.css` 的 `@theme inline`
- i18n：默认英文 `/`，中文 `/zh/`；UI 文案只能来自 `src/i18n/{en,zh}.json`（禁止硬编码文案）；内容字段为 `{en, zh}`，经 `pickLang()` 回退
- 模块开关：`site.config.json`（站长唯一会碰的文件）。路由经 `src/pages/[module]/index.astro` 的 `getStaticPaths` ← `enabledModules()`；新增模块 = 注册到 `src/config/site.ts` 的 `MODULE_REGISTRY` + `src/modules/<id>/Page.astro` + `src/modules/registry.ts`
- 部署目标 Cloudflare Pages；Node ≥ 20

## 隐私铁律（不可妥协）

- **默认私有，显式公开**：同步层只放行 `visibility === "public"` / `public === true` / `*.public.json` 来源的条目
- Investment-Info、Job-Tracker 不进同步清单
- 任何 token/PAT 只存 GitHub Actions Secrets / Cloudflare 环境变量，**绝不进前端代码或仓库**
- 规范化输出剥离 schema 白名单之外的所有字段

## 质量门槛（每阶段验收）

- Lighthouse 移动端：Perf ≥ 90 / A11y ≥ 95 / SEO = 100
- 首页初始 JS ≤ 120KB gzip；重模块（图谱/地图/专辑墙交互）懒加载
- 所有动画尊重 `prefers-reduced-motion`；键盘可达、对比度 WCAG AA
- 两语言 × 两主题 × 三断点全组合走查

## 设计基准（方案 B+ Galerie Vivante，已定稿）

- 详见 `.claude/skills/hub-design/SKILL.md` 与 BLUEPRINT 附录 A 方案 B+
- 禁止：手写体/手绘涂鸦、紫色渐变模板脸、通用 SaaS 卡片、≥2px 深色粗边框、戏剧化古典元素
- 左上统一定向光；装裱默认无框画布、featured 用发丝浮框；黄铜是唯一金属

## 阶段状态

- [x] P0 脚手架（双语路由 / 令牌 / 主题 / 模块开关 / logo / 组件库雏形）
- [ ] P1 数据层（sync-data.mjs + adapters + schema 校验 + mock↔真实切换）
- [ ] P2 核心模块（Home 完整版 / Projects / Writing 书架 / About+表单）
- [ ] P3 音乐（专辑墙 + Spotify now-playing Function）
- [ ] P4 SEO/RSS/Umami/性能调优
- [ ] P5 部署上线（Cloudflare Pages + sync.yml）

## 常用命令

- `npm run dev` 本地预览 · `npm run build` 构建 · `npm run check` 类型检查 · `npm run format` 格式化

## 工作方式（站长要求）

- 站长不写代码：需要站长操作的事项给逐步图文指引，决策一次性列清单
- 每阶段结束：自行构建+测试，输出非技术语言验收说明与预览方法
- 缺真实数据时用与真实 schema 一致的 mock，sync 脚本留真实源切换开关
