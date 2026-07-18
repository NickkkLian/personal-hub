# Personal Hub — 项目记忆

多领域个人网站（NickkkLian）。**唯一需求来源：`BLUEPRINT.md` v1.7**，遇到冲突以它为准；变更需求先改 BLUEPRINT 并提版本号。

**⚠️ 动 `~/Desktop/Dev/hub-apps/` 下任何应用（devlog/生活地图/情报终端/门户…共 17 个）之前，必读 `HUB-APPS.md`**——全家生态地图、共同约定（pha-config/双语/保存冲突/隐私）、各 app 数据结构要点（哪些保存时会剥未知键）、部署凭据路径、devlog 纪律、常见坑。改动生态后同步更新它。

## 技术栈与硬约束

- Astro 5（SSG）+ React 19 islands（按需水合，能不用 React 就不用）+ Tailwind CSS 4（经 `@tailwindcss/vite`，无 Astro integration）
- 设计令牌唯一来源：`src/styles/tokens.css`；Tailwind 语义工具类映射在 `src/styles/global.css` 的 `@theme inline`
- i18n：默认英文 `/`，中文 `/zh/`；UI 文案只能来自 `src/i18n/{en,zh}.json`（禁止硬编码文案）；内容字段为 `{en, zh}`，经 `pickLang()` 回退
- 模块开关：`site.config.json`（站长唯一会碰的文件）。路由经 `src/pages/[module]/index.astro` 的 `getStaticPaths` ← `enabledModules()`；新增模块 = 注册到 `src/config/site.ts` 的 `MODULE_REGISTRY` + `src/modules/<id>/Page.astro` + `src/modules/registry.ts`
- 部署目标 Cloudflare Pages；Node ≥ 20

## 隐私铁律（不可妥协）

- **默认私有，显式公开**：同步层只放行 `visibility === "public"` / `public === true` / `*.public.json` 来源的条目
- **永不公开的 app 名单 → 唯一权威在 `HUB-APPS.md` §2「隐私铁律」**（现为 5 个：Investment-Info / Job-Tracker / People-Atlas / Media-Ops / Polaris）。此处曾自抄一份并漏掉 People-Atlas，已改为指针——**别再在这里复制名单**
- 任何 token/PAT 只存 GitHub Actions Secrets / Cloudflare 环境变量，**绝不进前端代码或仓库**
- 规范化输出剥离 schema 白名单之外的所有字段

## 质量门槛（每阶段验收）

- Lighthouse 移动端：Perf ≥ 90 / A11y ≥ 95 / SEO = 100
- 首页初始 JS ≤ 120KB gzip；重模块（图谱/地图/专辑墙交互）懒加载
- 所有动画尊重 `prefers-reduced-motion`；键盘可达、对比度 WCAG AA
- 两语言 × 两主题 × 三断点全组合走查

## 空间艺术层（方案 B+ 已补齐，2026-06-12）

- 七层背景视差(`Backdrop.astro` + `--sy` rAF 节流)、建筑暗示层③、失焦前景⑦、超大幽灵字水印
- 景深 DOF + hover 射灯(`ExhibitFrame`，DOF 仅签名级浮框触发避免网格全屏 blur 抖动)
- 镜头转场(`global.css` `::view-transition-old/new` dolly 透视推移)
- 沉浸时刻(`ImmersiveFrame.astro`，Projects/Writing/My Music 各一处全幅大圆角取景框)
- 图形批注层(虚线引导线 + Fraunces 斜体雕刻题注延迟浮现)、Home 卡片 hover 微缩预览(唱片转/书脊起/黄铜点/流光)
- 全部 reduced-motion 退化、移动端减量；Lighthouse 移动端仍 Perf 98 / A11y 100 / SEO 100
- **z-index 铁律**：背景 `Backdrop` 必须 z-0 且内容层(main/footer)显式 z-10——曾用 z-index:-1 导致整个纵深层被压到 body 背景色后、肉眼只见颜料雾(已修)
- **唯一未做：古典馆藏层(4 处石膏像) → BACKLOG 第 4 项**（需下载处理博物馆 CC0 素材）

## 设计基准（方案 B+ Galerie Vivante，已定稿）

- 详见 `.claude/skills/hub-design/SKILL.md` 与 BLUEPRINT 附录 A 方案 B+
- 禁止：手写体/手绘涂鸦、紫色渐变模板脸、通用 SaaS 卡片、≥2px 深色粗边框、戏剧化古典元素
- 左上统一定向光；装裱默认无框画布、featured 用发丝浮框；黄铜是唯一金属

## 阶段状态

- [x] P0 脚手架（双语路由 / 令牌 / 主题 / 模块开关 / logo / 组件库雏形）
- [x] P1 数据层（sync-data.mjs + adapters + schema 校验 + mock↔真实 auto 切换；GitHub Actions 接入在 P5）
- [x] P2 核心模块（Home 流场+门厅 / Projects 档案网格 / Writing 书架 / About+表单；表单等 web3formsKey 填入后生效）
- [x] P3 My Music 录音室（黑胶卡+播放器+音波可视化）。**已填真实作品**：content/my-music.json 里 4 首（繁花/当灯光熄灭时/夏日重现/泡沫天使）带网易云链接、线上 `/music` 展出中；只差试听音频文件（无 `audio` 字段 → 页内放不了，只跳外链）
- [x] P4 SEO 全套/双语 RSS/Umami 槽位/性能（Lighthouse 移动端六页实测：Perf 90–98 / A11y 100 / SEO 100）
- [x] P5 部署上线 —— **网站早已在线**：https://personal-hub-7uc.pages.dev （Cloudflare Pages）。`sync.yml` 每 6 小时 cron 兜底刷新公开数据 + `workflow_dispatch` 可手动立即刷（`gh workflow run sync.yml` 或 API `POST /actions/workflows/sync.yml/dispatches {"ref":"main"}`）。**改了 Database-Public 的数据后，不跑一次 sync 就不会上站。**

## 常用命令

- `npm run dev` 本地预览 · `npm run build` 构建 · `npm run check` 类型检查 · `npm run format` 格式化
- `npm run sync` 数据同步（auto：真实源缺失自动落 mock）· `sync:mock` / `sync:live` 强制模式

## 当前交接状态（每次推进后更新此节）

- 已对齐站长概念参考图（2026-06-13）：流场笔触封面 / 双层背景(雾+可见色场圆) / 圆形 NL logo / 幽灵字精简换 Fraunces opsz / 编辑式拼版首页(masthead + 「NICK / LIAN.」两行错开 Playfair + featured 浮框 + 古典石柱 ColumnPiece 精致石膏色作右侧背景配角) / 全画幅封面卡(文字在图下) / Writing 去书架改详情卡网格 / 字体可切换(site.config.fonts)
- 本网站项目已归档进 Database/develop.json（"个人网站（Galerie Vivante）"，20 条更新，含上线后改动；devlog 记录随每次推进补录）
- Projects 展厅读 devlog 精选公开数据 develop.public.json（name/summary 为 {zh,en} 双语对象 + links；sync-data 按 site.config.featured 把选中条目置顶=NO.001）；devlog App 已支持 nameEn/descEn 双语编辑并已推送上线；develop.json 全部 19 个项目已补齐中英文（2026-07-01）
- ⚠️ Astro 样式作用域坑：父页 `.foo` 规则匹配不到子组件根元素——给子组件定位要用父作用域 div 包裹（见 home `.hero-column`）；同坑变体：父页样式选不中子组件渲染的元素（如 Cover 的 img），要 `:global()` 包裹（2026-07-18 摄影页 aspect-ratio 因此没生效、图未加载时按钮高度 0 不可点）
- ⚠️ ClientRouter 坑：站内换页**不重跑页面 `<script>`**，元素级监听随 DOM 替换丢失（表现＝直接输网址正常、站内导航进来交互全失灵）——页面交互一律 document 级委托 + 每次现查元素，或挂 `astro:page-load`/`astro:after-swap`（参考 BaseLayout 的 wireEnterRise 与 photography Page 的视频弹窗）
- **文本后台 `public/admin.html`**：PAT+GitHub API 编辑 i18n(en/zh，含幽灵字/批注)+ site.config(标题/简介/时间线/字体/模块开关)，写回网站仓库；上线(网站仓库存在)后即可用
- Development-Log 补录与顺序修复 ✅ 均已推送；Database-Public ✅ 已创建（尚无数据文件）
- **站长待办统一收口在 `LAUNCH-CHECKLIST.md`**（上线前一次性做）；搁置功能在 `BACKLOG.md`
- v1.8 变更：专辑墙搁置（music-wall 关闭）→ BACKLOG；My Music 录音室已上线（**已是真实作品数据，非 mock**）
- 字体策略（性能关键，勿回退）：英文页零 CJK；中文页正文=系统字体（苹方/雅黑），网络字体仅思源宋 600 标题；CJK @font-face 独立 chunk 只挂中文路由；assetsInlineLimit=0
- 数据读取以 process.cwd() 定位 src/data（import.meta.url 在打包后失效——曾致全站空数据，已修复并加告警）
- ✅ 已上线并在跑：https://personal-hub-7uc.pages.dev （Cloudflare Pages，deploy.yml/sync.yml + Secrets 均已配好；sync 定时跑成功中）。**别再照旧文档说「还没部署」——2026-07-14 就是这么误导过站长的。**

## 工作方式（站长要求）

- 站长不写代码：需要站长操作的事项给逐步图文指引，决策一次性列清单
- 每阶段结束：自行构建+测试，输出非技术语言验收说明与预览方法
- 缺真实数据时用与真实 schema 一致的 mock，sync 脚本留真实源切换开关
