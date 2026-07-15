# Personal Hub — 多领域个人网站开发蓝图

> **状态：✅ v1.8（2026-06-12）。** 开发期间如需变更设计或架构，修改本文档并提升版本号，Claude Code 以本文档为唯一需求来源。
> **v1.8 变更**：站长决定——专辑墙（Album Wall/music-wall）暂时搁置（连带 Spotify 元数据补全与 now-playing，详见仓库 `BACKLOG.md`）；音乐板块以原创音乐（my-music）为先，P3 范围相应调整。
> **文档定位**：本文档是交给 Claude Code 执行的完整开发蓝图，同时可作为项目规划档案。
> **使用方式**：见第 9 章「Claude Code 执行指南」。核心 Prompt 在第 8 章，可直接粘贴使用。
> **作者数据现状**（事实更新 2026-07-14，非需求变更故不提版本号）：**17 个**自建 app + 门户 = 18 张导航卡（原文写「10 个」，早已长大；准确清单见 `HUB-APPS.md` §1，以 `personal-hub-admin/src/lib/registry.ts` 为准），多为单文件 HTML、少数多文件（收藏整理库 / 求职追踪），GitHub Pages 托管，数据以 JSON 形式通过 GitHub API 同步到私有 `Database` 仓库；另有 GitHub 开源项目、网易云 + Spotify 音乐、原创音乐作品，未来将扩展至 bilibili / 抖音 / 小红书 / YouTube / Instagram 等自媒体账号。

---

## 1. 项目概述

### 1.1 目标

构建一个高完成度、双语（默认英文 / 支持简体中文）、动画丰富的多领域个人网站（Personal Hub），作为所有领域作品与数据的统一展示门户。

### 1.2 核心设计原则

1. **零代码、低维护**：站长不写代码。所有开发由 Claude Code 完成；日常内容更新发生在现有数据库（源头），网站自动同步。
2. **单一数据源（Single Source of Truth）**：网站不存储内容副本。所有内容来自源头仓库的 JSON / 外部 API，定时自动拉取并重新构建。
3. **统一而不雷同**：全站共享一套设计系统（色彩、字体、间距、动效语言），但每个领域模块拥有适配其内容气质的差异化布局。
4. **模块可开关**：每个模块可通过一个配置文件一键开启/隐藏，无需改代码。
5. **隐私分级**：源头数据库包含私人内容（求职、投资等），网站只展示被显式标记为公开的条目。**默认私有，显式公开**。

### 1.3 现有资产盘点

| 数据库 | 仓库 / 页面 | 内容 | 建议公开度 |
|---|---|---|---|
| Business-Lab | nickkklian.github.io/Business-Lab | 选题与商业项目实验室 | 部分公开（已有 `.public.json` 导出机制） |
| Investment-Info | …/Investment-Info | 投资信息 | 默认隐藏（敏感） |
| Job-Tracker | …/Job-Tracker | 求职追踪 | 默认隐藏（敏感） |
| Mind-Archive | …/Mind-Archive | 思想 / 观点档案 | 部分公开 → **THOUGHT 模块** |
| Knowledge-Atlas | …/Knowledge-Atlas | 知识图谱（vis-network） | 部分公开 → **KNOWLEDGE 模块** |
| Creation-Ideas | …/Creation-Ideas | 写作 / 创作选题 | 部分公开 → **WRITING 模块** |
| Album-Journal | …/Album-Journal | 专辑笔记 | 公开 → **MUSIC · 专辑墙模块** |
| Mystery-Trick-Archive | …/Mystery-Trick-Archive | 谜题 / 技法档案 | 部分公开 → **MYSTERY 模块** |
| Life-Atlas | …/Life-Atlas | 生活地图（Leaflet） | 部分公开 → **LIFE 模块** |
| My-Menu | …/My-Menu | 菜谱 / 菜单 | 可公开 → **MENU 模块** |

> 技术事实（已验证）：这些应用均为单文件 `index.html`，数据通过 `api.github.com/repos/{owner}/{repo}/contents/{path}` 读写 JSON，本地用 localStorage 缓存。即：**权威数据已经以 JSON 形式存在于 GitHub 仓库中**，新网站只需读取这些 JSON。

### 1.4 站点模块规划（v1）

| # | 模块 ID | 名称 (EN / 中文) | 数据源 | 布局隐喻 |
|---|---|---|---|---|
| 1 | `home` | Home / 首页 | site config | 全屏 Hero + 模块导航星图 |
| 2 | `projects` | Projects / 开源项目 | GitHub REST API | 科技感卡片 / 终端风格 |
| 3 | `writing` | Writing / 文章与观点 | Creation-Ideas + Mind-Archive JSON | 书架 / 图书馆 |
| 4 | `music-wall` | Album Wall / 专辑墙 | Album-Journal JSON (+ Spotify/网易云元数据补全) | 挂墙专辑展示架 |
| 5 | `my-music` | My Music / 原创音乐 | 自建 JSON（含各平台外链与试听） | 录音室 / 黑胶唱机 |
| 6 | `knowledge` | Knowledge / 知识图谱 | Knowledge-Atlas JSON | 交互式星座图谱 |
| 7 | `life` | Life / 生活地图 | Life-Atlas JSON | 交互地图 + 足迹动画 |
| 8 | `menu` | Kitchen / 私房菜单 | My-Menu JSON | 菜单卡 / 餐厅板式 |
| 9 | `mystery` | Mystery / 谜题档案 | Mystery-Trick-Archive JSON | 档案柜 / 卷宗抽屉 |
| 10 | `social` | Channels / 自媒体矩阵 | 自建 JSON（账号 + 精选内容外链） | 电视墙 / 频道网格 |
| 11 | `about` | About / 关于 + 联系 | site config | 极简单页 + 联系表单 |

所有模块默认 `enabled: false`，由站长在配置中逐个打开（见 4.4）。v1 建议先开启：home、projects、writing、music-wall、about，其余随数据成熟逐步开启。

---

## 2. 功能需求规格

### 2.1 必备功能

- **i18n**：默认英文（`/`），简体中文（`/zh/`）。UI 文案全部走字典文件；内容字段支持 `{ "en": "...", "zh": "..." }` 双语结构，缺失语言时回退另一语言并显示小标记。
- **深色 / 浅色模式**：跟随系统 + 手动切换，状态持久化；两套主题均为正式设计（非简单反色）。
- **模块开关**：`site.config.json` 中每模块 `enabled: true/false`，关闭后导航、首页入口、路由、sitemap 全部消失。
- **自动数据同步**：GitHub Actions 定时（默认每 6 小时）拉取所有数据源 → 重新构建 → 自动部署。源头仓库可配置 webhook（`repository_dispatch`）实现"源头一更新，网站几分钟内同步"。
- **动画体系**：页面过渡、滚动入场、微交互、模块专属动效（见第 5 章），且全局尊重 `prefers-reduced-motion`。
- **SEO**：每页独立 meta / OpenGraph / Twitter Card、`hreflang` 双语标注、sitemap.xml、robots.txt、结构化数据（Person、CreativeWork）。
- **RSS**：至少为 writing 模块输出 RSS/Atom（双语两条 feed）。
- **访问统计**：默认 Umami Cloud（免费层、无 Cookie、GDPR 友好）或 Cloudflare Web Analytics；不使用需要 Cookie 横幅的方案。
- **联系入口**：联系表单（Web3Forms 或 Formspree 免费层，无需自建后端）+ 邮箱 / 社交图标。
- **响应式**：移动端为一等公民；专辑墙、图谱、地图等复杂布局必须有移动端降级方案。

### 2.2 明确不做（v1）

- 不做评论系统、不做用户登录、不做后台数据库（Supabase 等）——全部静态化以保证零维护。
- 不在网站内重新编辑内容——编辑永远发生在源头数据库。
- 不做网站内全文搜索（v2 可用 Pagefind 纯静态方案补上）。

---

## 3. 技术架构

### 3.1 选型结论

| 层 | 选择 | 理由 |
|---|---|---|
| 框架 | **Astro 5 + React islands** | 静态优先、性能极佳；交互模块（图谱/地图/专辑墙）按需水合；内置 i18n 路由与 RSS；对低维护最友好 |
| 样式 | **Tailwind CSS 4 + CSS 设计令牌** | 设计系统易统一；深浅色用 CSS variables 一处定义 |
| 动画 | **Motion (Framer Motion) + GSAP(ScrollTrigger，仅复杂场景) + View Transitions API** | 覆盖微交互到叙事级滚动动画 |
| 特殊可视化 | Leaflet（life）、自研 SVG/Canvas 图谱或 sigma.js（knowledge） | 沿用你现有数据库的可视化语言 |
| 托管 | **Cloudflare Pages**（首选）或 Vercel | 免费层足够、全球 CDN、自定义域名免费 SSL |
| CI / 数据同步 | **GitHub Actions**（cron + repository_dispatch） | 免费额度内完全够用 |
| 表单 | Web3Forms / Formspree 免费层 | 零后端 |
| 统计 | Umami Cloud 免费层 / Cloudflare Analytics | 零维护、无 Cookie |
| 动态接口（可选） | Cloudflare Pages Functions | 仅用于 Spotify "正在播放" 等实时小功能 |

### 3.2 架构图（数据流）

```
┌─ 源头（你日常更新的地方）─────────────────────────────┐
│ 10 个数据库仓库 JSON │ GitHub Repos │ Spotify │ 网易云 │ 社媒账号 JSON │
└──────┬───────────────┴──────┬───────┴────┬────┴───────┬──────────────┘
       │  raw / contents API  │ REST API   │ API/手动   │
       ▼                      ▼            ▼            ▼
┌─ GitHub Actions（每 6h cron + 源头 webhook 触发）────────────────┐
│ scripts/sync-data.mjs：拉取 → 校验 schema → 过滤 visibility     │
│ → 规范化为 /src/data/*.normalized.json → 提交或直接构建         │
└──────────────────────────────┬───────────────────────────────────┘
                               ▼
                    Astro build（SSG, 双语路由）
                               ▼
                    Cloudflare Pages（CDN 全球分发）
                               ▼
            访客 ←—— 静态页面 + 按需水合的交互岛屿
```

### 3.3 仓库结构

```
personal-hub/
├── CLAUDE.md                  # Claude Code 项目记忆（第 9 章生成）
├── site.config.json           # ★ 站长唯一需要碰的文件：模块开关/个人信息
├── src/
│   ├── data/                  # 同步脚本产出的规范化 JSON（构建输入）
│   ├── i18n/{en,zh}.json      # UI 文案字典
│   ├── styles/tokens.css      # 设计令牌（色彩/字体/间距/动效时长）
│   ├── layouts/               # 全局布局、页面过渡
│   ├── components/            # 共享组件（导航/页脚/主题切换/语言切换）
│   ├── modules/               # ★ 每个领域模块一个目录，自包含
│   │   ├── projects/  writing/  music-wall/  my-music/
│   │   ├── knowledge/ life/  menu/  mystery/  social/
│   └── pages/                 # 路由（根据 site.config 条件生成）
├── scripts/
│   ├── sync-data.mjs          # 数据拉取与规范化
│   └── validate-schemas.mjs   # JSON Schema 校验（脏数据不进站）
├── public/                    # 静态资源、favicon、OG 图模板
└── .github/workflows/
    ├── deploy.yml             # push → 构建部署
    └── sync.yml               # cron + repository_dispatch → 同步重建
```

---

## 4. 数据层设计

### 4.1 数据源与同步策略

| 数据源 | 读取方式 | 频率 | 备注 |
|---|---|---|---|
| 10 个数据库仓库的 JSON | `raw.githubusercontent.com`（公开）或 GitHub Contents API + 只读 PAT（私有） | 每 6h + webhook | 沿用你现有同步格式，零迁移成本 |
| GitHub 项目 | GitHub REST API `/users/NickkkLian/repos` + 置顶配置 | 每 6h | 取 stars、语言、描述、topics；支持手动 `featured` 列表与自定义双语简介覆盖 |
| Spotify（常听/正在播放） | Spotify Web API（一次性 OAuth 换取 refresh token，存为 Secret） | 构建时取 Top/Recently Played；"正在播放"走 Pages Function 实时 | 免费，官方稳定 |
| 网易云 | 无官方公开 API；社区方案（NeteaseCloudMusicApi 自建）不稳定且有合规风险 | — | **建议**：网易云内容写入 Album-Journal（你已有此习惯），由专辑墙统一展示；不直接对接网易云 API |
| 原创音乐 | 自建 `my-music.json`（曲目、封面、各平台外链、可选音频文件） | 随仓库更新 | 试听文件放 R2/仓库；外链到流媒体平台 |
| 自媒体矩阵 | 自建 `channels.json`（平台、账号链接、头像、精选作品外链） | 手动维护 | 各平台 API 门槛高且多变，v1 用外链卡片最稳；v2 可对接 YouTube Data API（免费）自动拉视频 |

### 4.2 隐私过滤（强制规则）

- 同步脚本只保留满足以下任一条件的条目：`visibility === "public"`、`public === true`、或来自 `*.public.json` 导出文件。
- Investment-Info、Job-Tracker 默认不进入同步清单；即使将来开启，也必须走同样的白名单过滤。
- 同步产物中**剥离**所有未在 schema 白名单中的字段，防止私密字段意外泄露。
- 私有仓库访问使用 **fine-grained PAT，只读、只授权指定仓库**，存于 GitHub Actions Secrets，永不进入前端代码。

### 4.3 规范化 Schema（节选）

所有模块条目统一规范化为：

```jsonc
{
  "id": "string",
  "module": "writing",
  "title": { "en": "…", "zh": "…" },      // 单语数据自动落入对应键
  "summary": { "en": "…", "zh": "…" },
  "date": "2026-05-01",
  "tags": ["…"],
  "cover": "url | null",
  "links": [{ "label": "…", "url": "…" }],
  "extra": { }                              // 模块专属字段（如专辑的 artist/year，地点的坐标）
}
```

校验失败的条目跳过并在 Actions 日志中告警，不会弄垮整次构建。

### 4.4 模块开关（"后端一键开启/隐藏"的零代码实现）

`site.config.json`：

```jsonc
{
  "modules": {
    "projects":   { "enabled": true,  "nav": true },
    "writing":    { "enabled": true,  "nav": true },
    "music-wall": { "enabled": true,  "nav": true },
    "my-music":   { "enabled": false, "nav": false },
    "knowledge":  { "enabled": false }, "life": { "enabled": false },
    "menu":       { "enabled": false }, "mystery": { "enabled": false },
    "social":     { "enabled": false }
  }
}
```

操作方式（任选其一，均无需本地环境）：
1. **GitHub 网页直接编辑该文件** → 提交 → 自动重新部署（约 1–2 分钟生效）。
2. **可选加分项**：让 Claude Code 顺手生成一个私有 `admin.html`（复用你现有数据库的「PAT + contents API」模式），开关做成拨杆，一键写回 `site.config.json`。与你已有工具的使用习惯完全一致。

### 4.5 数据源适配器架构（应对"数据库会增加、形式会变"）★

**设计约束**：数据库数量会增长，GitHub JSON 形式是暂时的。因此同步层必须做成**可插拔适配器**：

```
sources.config.json（数据源注册表）
[
  { "module": "writing",  "adapter": "github-json", "repo": "NickkkLian/xxx", "path": "data.json" },
  { "module": "menu",     "adapter": "github-json", "repo": "...", "path": "..." },
  { "module": "projects", "adapter": "github-api" },
  { "module": "music-wall", "adapter": "github-json", "...": "...",
    "enrich": "spotify-metadata" }
  // 未来：{ "module": "new-domain", "adapter": "notion", "databaseId": "..." }
]
```

- 每个 adapter 是 `scripts/adapters/` 下一个独立小文件，统一输出 4.3 的规范化 schema。**新增数据库 = 注册表加一行；换数据库形式 = 换 adapter 名**，网站其余部分零改动。
- v1 实现的 adapters：`github-json`、`github-api`（仓库列表）、`spotify`、`local-json`（仓库内自建数据）。`notion`、`airtable`、`feishu-bitable` 作为预留接口，需要时让 Claude Code 一次会话补上。

### 4.6 数据库形式迁移建议

| 候选 | 适合度 | 说明 |
|---|---|---|
| **Notion（推荐迁移目标）** | ★★★★★ | 免费个人版够用；官方 API 稳定；编辑体验远好于 JSON；database 属性天然映射规范化 schema（含 `public` 勾选、双语字段、标签、封面）；每个新领域开一个 database 即可，与"数据库会增加"的预期完美匹配 |
| 飞书多维表格 | ★★★★ | 国内访问快、API 正规、表格视图顺手；国际访客无影响（网站只在构建时取数） |
| Airtable | ★★★ | 体验好，但免费层每 base 1000 条记录，长期可能撞限 |
| 单一 content 仓库（JSON/MD 集中制） | ★★★ | 零新依赖，但编辑体验没有质变 |
| Supabase / 自建数据库 | ★ | 对零代码站长维护成本过高，不建议 |

**迁移策略**：v1 维持现状（GitHub JSON 已验证可用）；任何时候想迁，按模块逐个迁——同一时间不同模块可以用不同 adapter，没有"一次性大迁移"风险。建议从更新最频繁的 1 个模块（如 writing）先试点 Notion。

### 4.7 数据演进路线

- **现在（v1）**：源头 = 各数据库仓库 JSON + GitHub/Spotify API，经适配器统一规范化，网站只读。
- **v1.5**：为各数据库导出 JSON 约定统一 `visibility` 与双语字段（Claude Code 可批量为现有 10 个 index.html 加"公开开关"）。
- **v2（按需）**：按 4.6 逐模块迁移 Notion / 飞书；或新领域直接生在 Notion，老领域留在原处。

---

## 5. UI / 设计系统

### 5.1 全局设计语言

- **气质**：简约大气的欧洲高级设计 + 艺术设计感。当前选定方向为**附录 A 之方案 B+「Galerie Vivante 空间版」**（北欧美术馆基底 + 印象派油画质感 + 三维展厅空间感，无手写/手绘元素），其 logo、字体、颜料系统、版式与动效语言为全站基准；方案 A / C 保留备查。共同底线：避免一切模板感（默认紫色渐变、通用 SaaS 卡片、AI 味插画一律禁止），宁可少而精。
- **字体**：由所选方案决定（见附录 A），全部使用 Google Fonts / Fontshare 免费授权字体；中文按方案搭配 Noto Sans SC 或思源宋体。`font-display: swap` + 子集化保证性能。
- **色彩令牌**：`tokens.css` 定义 `--bg / --surface / --text / --muted / --accent / --accent-2`，深浅两套完整取值；每个模块允许一个**模块主色**（在统一明度/饱和度体系内取值），形成"同一家族、不同房间"的感受。
- **动效原则**：进入动画 ≤ 600ms、缓动统一（自定义 cubic-bezier 一处定义）、滚动叙事只用于模块首屏、所有动画尊重 `prefers-reduced-motion`、移动端减量。

### 5.2 各模块布局与动效规格

| 模块 | 布局隐喻 | 关键交互 / 动效 |
|---|---|---|
| Home | 全屏 Hero：姓名 + 一句话身份 + 动态背景（低多边形粒子或噪点流场，Canvas，惰性加载）；下方为"模块星图/门厅"，每个开启的模块一个入口卡 | 入口卡 hover 时预览该模块的微缩动效；首屏文字逐词浮现 |
| Projects | 终端/科技卡片网格：等宽字体点缀、语言色条、stars/forks 徽标；置顶项目大卡 | 卡片 3D tilt + 边缘流光；筛选 chips（语言/topic）带 FLIP 重排动画 |
| Writing | **书架**：条目即书脊，按年份分层；点击书脊"抽出"翻开为详情卡（标题/摘要/外链到发布平台） | 书脊抽出的 3D 翻转；书架横向滚动惯性；新文章贴 "NEW" 书腰 |
| Album Wall | **挂墙专辑架**：方形封面瀑布挂墙，木质/磨砂墙面纹理随主题切换；点击放大为"唱片详情"（你的短评、年份、流媒体外链） | 封面 hover 微倾斜出墙 + 投影；点击后封面飞出放大（shared element transition）；可选黑胶滑出动画 |
| My Music | 录音室桌面：黑胶/磁带造型的作品卡 + 内嵌播放器（试听 30s 或全曲） | 播放时唱片旋转、音波可视化（Web Audio API） |
| Knowledge | 星座式知识图谱：暗色天幕上节点为星，连线为星座；侧栏显示节点详情 | 入场时星点渐次点亮；拖拽/缩放；移动端降级为可折叠主题列表 |
| Life | 全屏 Leaflet 地图 + 自定义暗色瓦片样式；足迹点按时间线播放 | "播放足迹"按钮：镜头沿时间飞行；点位弹出卡片 |
| Menu | 餐厅菜单卡版式：分栏、手写体点缀、菜品配图圆角拍立得 | 翻页动画（像翻菜单）；"今日推荐"印章盖落动效 |
| Mystery | 档案柜：抽屉式分类，卷宗封面盖"CLASSIFIED/SOLVED"章 | 抽屉拉出、卷宗展开；解锁感微动效 |
| Channels | 电视墙/频道网格：每个平台一块"屏幕"，内播精选封面轮播 | 屏幕开机闪烁入场；hover 出现平台色描边 |
| About | 极简编辑页：照片、双语简介、时间线、联系表单 | 时间线滚动逐点亮起 |

### 5.3 性能与质量门槛（验收标准）

- Lighthouse（移动端）：Performance ≥ 90、Accessibility ≥ 95、SEO = 100。
- 首页 JS 初始负载 ≤ 120KB gzip；重型模块（图谱/地图）全部按需懒加载。
- 所有图片走 Astro `<Image>` 优化（AVIF/WebP + 占位模糊）；专辑封面在同步阶段缓存到本仓库或 R2，避免热链失效。
- 键盘可达、焦点可见、对比度达 WCAG AA；两种语言、两种主题、三档断点全组合人工过检。

---

## 6. 后端逻辑

本项目的"后端"刻意做到最薄，以满足零维护：

1. **构建时后端（主体）**：`scripts/sync-data.mjs` 在 GitHub Actions 中运行——拉取所有数据源 → schema 校验 → 隐私过滤 → 双语规范化 → 封面图缓存 → 输出 `/src/data/*.json` → Astro 构建。失败时保留上一次成功数据并发告警（Actions 邮件通知）。
2. **运行时后端（仅 2 个微功能，均为 Cloudflare Pages Functions 免费层）**：
   - `GET /api/now-playing`：用 Spotify refresh token 换 access token，返回正在播放/最近播放（带 60s 缓存）。前端在 Album Wall 角落显示一张"正在旋转的唱片"。可整体关闭。
   - 联系表单直接提交到 Web3Forms/Formspree，**不自建**接收端；如未来想要自定义，再加一个转发 Function 即可。
3. **触发机制**：
   - `deploy.yml`：push 到 main → 构建部署。
   - `sync.yml`：`schedule: cron('0 */6 * * *')` + `repository_dispatch`。在各源头数据库仓库加一个 3 行的 workflow，数据 JSON 一变就向本仓库发 dispatch → 网站几分钟内更新。
4. **密钥清单（全部存 GitHub Secrets / Cloudflare 环境变量）**：`GH_READONLY_PAT`、`SPOTIFY_CLIENT_ID/SECRET/REFRESH_TOKEN`、`WEB3FORMS_KEY`、`UMAMI_WEBSITE_ID`。

---

## 7. i18n 方案

- 路由：英文在根路径 `/projects`，中文 `/zh/projects`；Astro 内置 i18n 配置 `defaultLocale: "en", locales: ["en", "zh"]`。
- UI 文案：`src/i18n/en.json`、`zh.json`，键名按模块分组；切换器在导航栏，记忆选择。
- 内容双语：规范化阶段将单语字段包装为 `{ en, zh }`；缺译时回退并在条目角标注原文语言（"原文：中文"）。
- 你的源头数据多为中文：v1 接受"中文内容 + 英文 UI"的混排；v1.5 可在同步脚本中加 **AI 辅助翻译缓存**（首次出现的条目自动生成英文摘要，写入 `translations-cache.json` 人工可改，之后不再重译）。
- SEO：`hreflang` 互链、双语 sitemap、双语 RSS（`/rss.xml` 与 `/zh/rss.xml`）。

---

## 8. 完整 Claude Code 总 Prompt（可直接粘贴）

> 用法：在新目录中启动 `claude`，先粘贴下方 Prompt 总纲，再按第 9.4 节的阶段顺序推进。本文档整体放入项目根目录（如 `BLUEPRINT.md`），Prompt 中已要求 Claude Code 通读它。

```text
你是本项目的全栈工程师。请先完整阅读项目根目录的 BLUEPRINT.md（多领域个人网站开发蓝图），它是唯一需求来源，遇到冲突以它为准。

项目：为 GitHub 用户 NickkkLian 构建一个静态优先的多领域个人网站。
技术栈：Astro 5 + React islands + Tailwind CSS 4 + Motion（复杂滚动叙事可用 GSAP）。部署目标 Cloudflare Pages。Node 20+。

硬性要求（逐条对照 BLUEPRINT.md 实现，不得简化）：
1. 双语：默认英文，/zh/ 简体中文，UI 文案全部走 i18n 字典，内容字段为 {en, zh} 结构，带回退。
2. 模块化：site.config.json 控制每个模块 enabled/nav，关闭的模块在导航、首页、路由、sitemap 中完全消失。
3. 数据层：实现 scripts/sync-data.mjs，按 BLUEPRINT.md 第 4 章从各 GitHub 仓库 JSON、GitHub REST API、Spotify API 拉取数据，做 schema 校验、visibility 隐私过滤（默认私有，显式公开）、双语规范化、封面缓存。绝不在前端暴露任何 token。
4. UI：按第 5 章逐模块实现差异化布局（书架、专辑墙、科技卡片、星座图谱、地图、菜单卡、档案柜、电视墙），统一设计令牌，深浅双主题，动画尊重 prefers-reduced-motion。
5. 功能：深浅色切换、SEO 全套（meta/OG/hreflang/sitemap/结构化数据）、双语 RSS、Umami 统计接入、Web3Forms 联系表单。
6. CI：.github/workflows/deploy.yml 与 sync.yml（6 小时 cron + repository_dispatch）。
7. 质量门槛：Lighthouse 移动端 Perf ≥ 90 / A11y ≥ 95 / SEO = 100；首页初始 JS ≤ 120KB gzip；重模块懒加载。

工作方式：
- 使用 Plan Mode 先给出实施计划，经我确认后再写代码。
- 每完成一个阶段（见 BLUEPRINT.md 9.4）自行运行构建与测试，给我一段非技术语言的验收说明和预览方法。
- 我不写代码：所有需要我做的操作（注册服务、获取 token、点按钮）请给出逐步图文级指引，并把需要我决定的事项一次性列清单问我。
- 缺少真实数据时先用与真实 schema 一致的 mock 数据开发，并在 sync 脚本中留好真实源切换开关。
```

---

## 9. Claude Code 执行指南（含 Skills 安装）

### 9.1 安装 Claude Code

- **macOS / Linux**：`curl -fsSL https://claude.ai/install.sh | bash`
- **Windows**：PowerShell 运行官方安装命令（或先装 Git for Windows 提供 bash）。
- 不想用终端：可使用 **Claude Desktop 应用内的 Claude Code**（图形界面）。
- 验证：`claude --version`；首次运行 `claude` 按提示用你的 Claude 账号（Pro/Max 订阅）或 API Key 登录。
- 官方文档（安装与系统要求）：https://code.claude.com/docs/en/setup ；总览：https://docs.claude.com/en/docs/claude-code/overview

### 9.2 项目初始化

```bash
mkdir personal-hub && cd personal-hub
# 把本文档保存为 BLUEPRINT.md 放进来
claude        # 启动后先输入 /init 生成 CLAUDE.md，再粘贴第 8 章总 Prompt
```

`CLAUDE.md` 中应固化：技术栈、目录结构、设计令牌位置、"默认私有"隐私规则、验收门槛——Claude Code 每次会话都会读取它，保证多次会话风格一致。

### 9.3 推荐安装的 Skills

Skills 是放在 `.claude/skills/<name>/SKILL.md` 的可复用指令包（项目级）或 `~/.claude/skills/`（全局）。建议：

| Skill | 用途 | 来源 |
|---|---|---|
| `frontend-design`（网页美学/反模板感设计） | 让 UI 产出有设计主见、避免 AI 模板脸 | Anthropic 官方 skills 仓库 github.com/anthropics/skills（按其 README 安装；Claude Code 中也可用 /plugin 浏览市场） |
| `canvas-design`（海报级视觉/排版艺术） | 用于 logo SVG、OG 分享图模板、艺术化版式细节 | 同上官方仓库 |
| `webapp-testing` 或等效浏览器测试 skill | 让 Claude Code 自测页面交互与响应式 | 同上官方仓库 |
| **自建 `hub-data` skill** | 固化本项目数据规范：10 个源仓库清单、visibility 过滤规则、规范化 schema、双语字段约定 | 让 Claude Code 第一阶段顺手生成 |
| **自建 `hub-design` skill** | 固化设计令牌、各模块布局隐喻与动效规格（第 5 章浓缩版） | 同上 |

> 安装方式：把 skill 目录拷入 `.claude/skills/`，Claude Code 会按需自动调用；用 `claude doctor` 可检查环境。另可考虑 MCP：GitHub 官方 MCP server（便于 Claude Code 直接读你的各数据仓库结构）。

### 9.4 分阶段实施路线（每阶段一次会话即可）

| 阶段 | 内容 | 验收 |
|---|---|---|
| P0 | 脚手架：Astro + Tailwind + i18n 路由 + 设计令牌 + 深浅主题 + site.config 模块开关骨架 | 双语空站可跑，开关生效 |
| P1 | 数据层：sync 脚本 + schema 校验 + 隐私过滤 + mock→真实源切换 | Actions 跑通，产出规范化 JSON |
| P2 | 核心模块：Home、Projects、Writing（书架）、About+表单 | 四模块完整含动效 |
| P3 | 音乐：My Music 原创音乐完整版（录音室布局 + 播放器）；~~Album Wall + Spotify~~ 已搁置 → BACKLOG | 原创音乐展厅可用 |
| P4 | SEO/RSS/统计 + 性能调优 + 全组合走查 | 达到 5.3 质量门槛 |
| P5 | 部署：Cloudflare Pages + 域名 + sync.yml 定时与 webhook | 正式上线、自动同步 |
| P6+ | 渐进开启：Knowledge、Life、Menu、Mystery、My Music、Channels；admin.html 开关面板 | 按需逐个 |

---

## 10. 成本与维护

### 10.1 一次性 / 年度成本

| 项 | 方案 | 费用 |
|---|---|---|
| 域名 | Cloudflare Registrar 或 Porkbun 注册 `.com`（按成本价、含隐私保护；长期最稳） | ≈ US$10–12 / 年（唯一必要现金支出） |
| 托管 | Cloudflare Pages 免费层（无限带宽、500 次构建/月） | $0 |
| CI | GitHub Actions 免费额度（公共仓库不计费） | $0 |
| 统计 | Umami Cloud 免费层 / Cloudflare Analytics | $0 |
| 表单 | Web3Forms / Formspree 免费层 | $0 |
| Spotify API | 免费 | $0 |
| 图片存储（可选） | Cloudflare R2 免费层 10GB | $0 |
| AI 开发 | 你现有的 Claude 订阅（Claude Code 含于 Pro/Max）或按量 API | 已有 / 视用量 |

**结论：除域名外可做到 $0/年。**

### 10.2 维护模型

- **日常（你）**：只在源头数据库更新内容 → 网站全自动同步。想开/关模块 → 网页改一行 `site.config.json`（或用 admin 面板）。**零代码、约 0 分钟/周**。
- **季度（交给 Claude Code 一句话完成）**："升级依赖并确认构建与 Lighthouse 门槛通过"。
- **风险与对策**：
  - 数据源结构变动 → schema 校验会拦截并告警，旧数据继续在线，不会白屏。
  - 第三方免费层政策变化（Formspree/Umami）→ 同类替代品多，切换成本＜1 小时。
  - 网易云接口不稳 → 已绕开（经 Album-Journal 中转）。
  - PAT 泄露风险 → 只读 + 限定仓库 + 定期轮换（设 1 年过期提醒）。

---

## 11. 给站长的待办清单（一次性，约 1 小时）

1. 注册域名（Cloudflare Registrar / Porkbun）。
2. 注册 Cloudflare 账号，开通 Pages；注册 Web3Forms 与 Umami（各 2 分钟）。
3. 在 GitHub 创建 fine-grained **只读** PAT（仅勾选需要读取的数据仓库）。
4. 在 Spotify Developer Dashboard 创建应用，按 Claude Code 给出的指引完成一次 OAuth 拿到 refresh token。
5. 决定 v1 开启哪些模块、首页一句话身份介绍（双语）、想展示的置顶 GitHub 项目清单。
6. 安装 Claude Code，按第 9 章启动 P0。

---

## 附录 A：三个设计方向提案（待站长选定其一）

> 选定后，Claude Code 在 P0 阶段按所选方案生成 `tokens.css`、logo SVG（含动画版）与版式基准，并将本附录中该方案标记为"已采用"。所有字体均为免费授权（Google Fonts）。logo 由 Claude Code 直接产出 SVG 矢量源文件（静态版 + 动画版 + favicon），无需外部 logo 工具，无版权风险。

### 方案 A · Helvetic（瑞士国际主义）

- **关键词**：网格、秩序、精确、一抹红
- **Logo**：纯黑方块内小写 `n.`，左下对齐；句点为"可变量"——在不同模块页变为该模块主色，成为贯穿全站的彩蛋
- **字体**：Space Grotesk 或 Archivo（标题）/ Inter（正文）/ Noto Sans SC（中文）
- **色板**：`#FFFFFF` 纸白 · `#0A0A0A` 纯黑 · `#E63329` 瑞士红（点缀≤5%面积）· `#E3E3E3` 网格灰；深色模式 = 黑底白字红点缀
- **版式**：严格 12 列模块网格，可见分割线与基线节奏；标题与正文形成强烈字号对比；信息密度可较高
- **动效**：kinetic typography 文字滑轨、网格线生长入场、硬切换无拖尾；快、准、冷静
- **模块适配示例**：Projects = 黑白规格表式卡片 + 红色语言条；专辑墙 = 等距严格网格，hover 才出现信息层

### 方案 B+ · Galerie Vivante 空间版（生动画廊）★ 当前选定方向（站长确认后定稿）

> 北欧美术馆基底 × 印象派油画质感 × 物件级立体感 × 当代策展锋芒。访客是在"走进"一座当代画廊，不是在"翻"一份画册。

**设计参照系（站长选定的 10 个范例，已解码，开发时对照）**
1. OpenAI 官网卡片体系 → **UI 隐形、艺术承重**：界面克制到极简，识别度由每件内容的印象派油画封面承担（本方案的"生成式封面系统"即源于此）
2. Records 唱片店 → **物件式立体感**：唱片从封套探出一截、发丝线网格、凸版/等宽体标签——专辑墙的直接蓝本
3. YSL 编辑页 → 超大错位标题即艺术品、纸张颗粒、不对称小字块——各模块开篇的类型学
4. Berliner Ideenlabor / VIBE CODING → 裁切标记、虚线标注、等宽注释构成"图形批注层"；实验档案网格给 Projects
5. Wild Haven → 每模块一个全幅沉浸时刻，内容装在大圆角取景框
6. La Palatine → 古典基底 × 当代锋芒的张力态度（舍其霓虹）；由下方"古典馆藏层"以受控剂量实现
7. Every Tail → 衬线 × 等宽的字体搭配逻辑、bento 网格节奏变奏（舍其马卡龙色）
8. Contra Labs → 当代"研究所/档案馆"叙事框架与从容的滚动驱动动效

**设计原则**：这是一座**走得进去的三维美术馆**，不是一张纸。所有元素遵循"克制而锋利"，禁止任何手写体、手绘涂鸦、卡通化曲线——艺术感来自空间、光、材质与策展秩序，而非装饰。

**空间系统（核心层）★ —— 立体感来自"物件"，而非字面的"房间"**
- **物件厚度（第一深度来源）**：内容呈现为有物理厚度的实物——唱片从封套探出一截（hover 滑出更多）、书有可见书脊与顶面、浮框有可见留缝与断面、卡片有真实的纸张层叠；这是参考图 2 的核心手法
- **背景纵深系统（七个深度平面）★**：
  ① **光场层（最远）**= 左上定向光在墙面上的柔和光池 + 空气透视（顶部更亮、向下渐沉）；
  ② **颜料雾 + 幽灵字** = 生成式色场重度虚化后以 5–8% 透明度缓慢漂移 + 超大低对比"GALERIE"/展厅编号水印（Fraunces，约 4–5% 对比度，允许出血越界）；
  ③ **建筑暗示层** = 远处下一间展厅"门洞/拱廊"的极淡剪影（≤5% 对比度），与镜头推移转场互相呼应——转场时镜头正是穿过这个门洞；
  ④ **画布墙 + 墙地分界** = 画布纹理墙面 + 页面底部更深的地坪色阶，给所有展品一个"站立的地面"；
  ⑤ **微尘层** = 光柱中极少量（同屏 ≤6 颗）缓慢漂浮的颜料微粒，颜色取自颜料组，3–4px，几乎无感但空气是"活"的；
  ⑥ **内容层** = 展品与文字，相邻展品允许轻微叠压与差速；
  ⑦ **失焦前景（最近）**= 页面边缘一团重度虚化的颜料色形（摄影式前景虚化）+ 古典雕塑 + 批注。
  七层滚动速率递增（最远最慢、最近最快）；reduced-motion 时停止漂移与微尘，纵深由色阶与遮挡关系静态成立
- **出血与开放边界原则★**：取消角部裁切标记等一切形成"边界框"的元素——硬边界会收紧空间。色雾、幽灵字、雕塑、巨型标题、展品均允许越出视口边缘（出血），页面四边永远开放
- **签名场景**：字面的透视展墙全站只保留**一处**——专辑墙首屏（一面带灭点的挂画墙 + 镜头推近），克制使用使其成为记忆点而非廉价特效
- **三层视差纵深**：前景（展品/铭牌）、中景（墙面）、背景（远厅/纹理）滚动速率不同，产生真实进深
- **景深（depth of field）**：聚焦某件展品时，背景层轻微虚化（backdrop blur / filter），视线被引导
- **镜头语言转场**：模块切换 = 镜头推移（dolly）走进下一间展厅，而非翻页；View Transitions + 透视缩放实现
- **微立体交互**：画框随指针方向微倾（≤3°），hover 时投影同步偏移——细到几乎无感，但页面是"活"的
- reduced-motion：空间全部退化为优雅静态构图，纵深由光影与装裱厚度承担

**光影与材质系统**
- **统一定向光源**：全站假定左上方一盏恒定光，所有投影方向一致（高级感的隐形来源）
- **真实柔影**：画框、卡片使用多层柔和接触投影（contact shadow），落在"墙面"上
- **装裱规范（粗黑框禁止）**：默认 = **无框画布**（canvas wrap，气质对标 OpenAI 参考卡：作品直接上墙，仅 0.5px 极淡描边收口 + 柔影承重）；特例 = **发丝浮框**（float frame：1px 墨色细框 + 8–12px 可见留缝，墙面从缝中透出），仅用于每模块的 featured 展品与签名场景；任何 ≥2px 的深色粗边框全站禁用
- **hover 射灯**：局部径向提亮 + 投影加深，像展厅射灯亮起
- **黄铜材质**：铭牌、印章、发丝分隔线使用黄铜质感（`#B08D57` 系 + 细腻高光），是全站唯一"金属"

**艺术层**
1. **生成式印象派封面系统（识别度的承重墙）★**：构建时为每条**无真实封面**的内容自动生成一幅印象派色场画——Canvas 流场算法，以条目 id 为随机种子（确定性：同一条目永远同一幅画），用其模块"房间色"为主调、邻近颜料为辅。零成本、零外部 API、可缓存为静态图。有真实封面（专辑、照片）的条目用真图。效果对标参考图 7/8：满墙都是画，而 UI 退后
2. **画布纹理**：全站背景铺极淡油画布噪点（内联 SVG feTurbulence，透明度 ≤7%，零图片请求）；深浅两模式各调一版
3. **颜料系统**：主色板 `#F3EEE5` 画布暖白 · `#1C1A17` 墨黑；叠加印象派低饱和颜料组——鼠尾草 `#7C8B6F`、雾蓝 `#7E93A8`、赭黄 `#C9A227`、干玫瑰 `#C08D7C`。**每个模块认领一支颜料作为"房间色"**（如 music=雾蓝、writing=鼠尾草、menu=赭黄、life=干玫瑰）；黄铜 `#B08D57` 降级为发丝线与微高光点缀（当代感优先）；深色模式 = 深暖炭 `#171513` 底（夜场画廊），颜料组整体提亮一档
4. **编辑式巨型标题**：每个模块开篇为超大、错位断行的标题排版（YSL 式），标题与封面画允许克制地叠压；中文标题用思源宋体超大字重对位
5. **图形批注层（替代手写批注的当代解法）**：虚线引导线、发丝分隔线、等宽字注释（Space Mono）构成"策展批注"；**角部裁切标记已取消**（见出血原则——任何边界框性质的元素都会收紧空间）；站长短评以 Fraunces 斜体雕刻式题注呈现，延迟浮现
6. **展品编号体系（标志性细节）**：每件内容配**凸版式标签**——等宽字、压印字距的 `NO. 047 · MUSIC / 标题 / 2026 · 媒介`（参考图 2 的打字机标签气质）；编号全站连续、跨模块累加，成为访客记得住的设计签名
7. **沉浸时刻**：每个模块恰有一处全幅沉浸场景（封面画放大、地图全屏、专辑墙透视），内容装在大圆角取景框中（参考图 1）
8. **古典馆藏层（受控剂量的配角）★**：叙事定位 = "当代画廊里恰好藏着几件古典馆藏"。素材全部取自博物馆开放版权库——The Met Open Access、Art Institute of Chicago、Rijksmuseum、National Gallery of Art（均 CC0/公有领域，含印象派真迹高清图与古典雕塑摄影），由同步脚本一次性下载处理为静态资源，零成本、零版权风险。**剂量铁律**：
   - 同屏至多 1 件古典元素；全站固定 4 处，不得扩散——① Home hero 右下角一尊被取景框边缘裁切的单色石膏像（前景视差层）；② About 时间线旁一座小型胸像；③ Writing 书架顶层一件小雕塑"镇架"；④ Knowledge 夜场厅入口一座石膏像剪影。另：页脚印章区可用一条古典画裁切纹理带（如莫奈天空局部）
   - 永远是配角：置于角落/边缘/页脚，宁可被裁切"探出"也不完整居中摆放；绝不承载标题或主视觉
   - 统一处理后才可上墙：雕塑转单色或 duotone 至所在模块房间色；古典画仅以"裁切纹理带"或"装框馆藏"形式出现；可叠 ≤5% 透明度的龟裂纹（craquelure）肌理
   - 动效仅限随滚动的轻微前景视差；禁止戏剧化动画与任何霓虹/撞色处理（与 La Palatine 的差异正在于此）

**字体**：Fraunces（标题，可变光学尺寸；斜体用于题注）/ Inter（正文）/ **Space Mono**（标签、编号、批注等元数据）/ 思源宋体（中文标题）+ Noto Sans SC。无手写体。

**模块适配（覆盖 5.2 表的对应项）**
- Writing 书架 = 有真实进深的木质展架（顶/侧面可见），书脊带投影，抽出 = 封面画展开；Album Wall = **插套唱片墙**（封面探出封套、hover 滑出、发丝线网格、等宽标签，参考图 2）+ 首屏一面透视挂画墙作全站签名场景；Knowledge 图谱 = 夜场展厅星图，颜料色星点 + 发丝连线；Life 地图 = 米色艺术地图瓦片，足迹为颜料点，入场镜头俯冲；Menu = 静物画展厅，菜品卡如小幅油画装裱；Projects = **实验档案网格**（参考图 9：黑白基调 + 模块色点缀、等宽注释、巨型标题），创作者实验室气质
- 验收线：任何一屏截图都应"像一帧当代画廊纪录片的画面"——有物、有光、有秩序，且每屏至少有一幅"画"

### 方案 C · Atelier（巴黎编辑风）

- **关键词**：高对比、戏剧性、时装杂志、夜场
- **Logo**：Bodoni 斜体 N·L 交叠字标（时装屋式 monogram），象牙底 / 墨底双版本
- **字体**：Bodoni Moda（超大 Didone 标题，斜体强调）/ Archivo（小号全大写导航与标签）/ 思源宋体（中文）
- **色板**：`#11100E` 墨黑 · `#EFE9DF` 象牙白 · `#B3243D` 波尔多红；深浅模式 = 墨底 / 象牙底整体互换
- **版式**：非对称杂志拼版；超大标题出血、图文错位叠压、细发丝分隔线、页码与栏注等杂志细节
- **动效**：整页幕布式转场、斜体下划线手绘生长、标题逐字母登场、图片揭幕（clip-path reveal）；有秀场节奏
- **模块适配示例**：writing = 杂志目录页/专栏版式；专辑墙 = 黑底画廊射灯效果；Channels 电视墙天然契合此风格

### 选定状态

方向已收敛至 **B+ Galerie Vivante**（待站长最终确认）。确认后 Claude Code 在 P0 阶段据此生成 `tokens.css`（含画布纹理、颜料组、光影投影变量）、logo SVG（静态/盖章动画/favicon 三版）、空间组件库（透视展厅容器、视差层、镜头转场）与装裱组件库（画框、双层卡纸、黄铜铭牌）。方案 A / C 保留备查。

---

*版本 v1.7（冻结版）· 2026-06-11 · 设计系统经七轮迭代定稿：暖白画廊基底 / 生成式印象派封面 / 物件式立体 / 七平面纵深 / 出血开放边界 / 无框画布与发丝浮框 / 凸版标签编号 / 图形批注 / 受控古典馆藏。开发期间的变更通过修订本文档进行。*
