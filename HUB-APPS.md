# Hub Apps 开发手册（个人网站 + 导航站 + 全家应用）

> 目的：compact 上下文后不丢细节。**动任何 app 前先读本文档相关小节。**
> 最后更新：2026-07-03。改动生态结构/约定后同步更新本文档。

---

## 1. 生态地图

| 层 | 仓库 | 部署 | 说明 |
|---|---|---|---|
| 个人网站 | `personal-hub` | Cloudflare Pages（deploy.yml 自动） | Astro 5，见本仓库 CLAUDE.md/BLUEPRINT.md |
| 导航站（门户） | `database-combined` | GitHub Pages **gh-pages 分支**（构建产物） | Vite+Preact+TS，卡片注册表 `src/lib/registry.ts`；改完 `npm run build` → dist 推 gh-pages（worktree 法） |
| 私有数据仓库 | `Database`（私有） | — | 各 app 的 JSON 数据 + `.github/workflows/`（investment-sync.yml、mail-sync.yml、birthday-reminder.yml）+ `investment/` `mail/` `scripts/` 脚本 + `xhs-images/` `business-lab-files/` 附件目录 |
| 公开数据仓库 | `Database-Public` | — | **只放显式导出的 `*.public.json`**；网站只读这里 |
| 各应用 | 一 app 一公开仓库（下表） | 各自 GitHub Pages（main 分支根目录） | 同源 `nickkklian.github.io/<Repo>/` |

### 应用清单（17 张门户卡）

| 应用 | 仓库 | 数据文件（Database/） | 特殊点 |
|---|---|---|---|
| 开发日志 devlog | Development-Log | develop.json | §4 devlog 纪律；导出 develop.public.json |
| 创意想法库 | Creation-Ideas | writing.json | ⚠️ mergeData 剥未知键；歌词库在顶层 `lyrics` 键（§5） |
| 情报终端 | Investment-Info | investment/ 目录多文件 | tab：动态/投资/IBKR/书库/趋势；PREFIX='investment'；抓取总闸 config.json `fetch_enabled` |
| 生活地图 | Life-Atlas | life.json | 城市/餐厅/酒吧/cocktails schema 见 §6 |
| 选题实验室 | Business-Lab | business.json | ⚠️ 保存 payload 显式字段白名单；LIBS（research+marketing 引用库）见 §5 |
| 知识图谱 | Knowledge-Atlas | knowledge.json | vis-network 图谱 |
| 菜单 | My-Menu | menu.json | |
| 思维库 | Mind-Archive | thoughts.json | 每次保存前取新 sha（免疫冲突）；附件 images/ files/ |
| 诡计逻辑库 | Mystery-Trick-Archive | data.json | |
| 专辑收藏 | Album-Journal | albums 数据 | |
| 小红书整理 | xhs-organizer | xhs.json + xhs-images/ | ⚠️ 多文件（js/ 模块）；图片归档见 §7 |
| B站归档 | bilibili-organizer | bilibili 数据 | 多文件；线上另有 worker/（Cloudflare 字幕代理），本地镜像无 |
| 暂存库存 | Storage-Tracker | storage 数据 | |
| 求职追踪 | Job-Tracker | jobapp/ 多文件 | ⚠️ React 18 CDN + babel-standalone（JSX），非 vanilla |
| 邮件分拣台 | Mail-Sorter | mail/mail.json + mail/config.json | 后台在 Database repo（§8） |
| 人力资源 | People-Atlas | people.json | **绝无公开导出功能**（§5） |
| 网站后台 | personal-hub `/admin` | 写回网站仓库 | Cloudflare 域，独立登录，不共享 pha-config |

---

## 2. 全家共同约定（写代码必须遵守）

- **单文件哲学**：app = 一个 index.html（例外见上表）。无构建、无依赖（CDN 字体/库除外）。
- **令牌共享**：`localStorage['pha-config']`＝`{owner, repo, token}`，全家同源共享（门户配置一次）。app 读取时**只补空缺不覆盖**；写回时**整体合并**，绝不丢其它字段。
- **双语**：`localStorage['pha-lang']`（'zh' 默认/'en'）。惯用法：`const T=(zh,en)=>lang==='en'?en:zh` + 静态 HTML 用 `data-i18n` 词典 + `applyStatic()`。存储值（枚举/分类 key）不译，只译显示。
- **base64 必须 UTF-8 安全**：TextEncoder/TextDecoder 或 `btoa(unescape(encodeURIComponent()))`。裸 btoa/atob 处理中文=数据损坏。
- **保存冲突**：PUT 409/422 → 重新 GET sha → 重试一次（全家标准 idiom，2026-07-02 体检已补齐所有 app）。Mind-Archive 例外：每次保存前都取新 sha。
- **保存要有 try/catch 并把失败显示给用户**（My-Menu 曾静默失败，已修）。
- **XSS**：所有用户内容进 innerHTML 前过 `esc()`。Job-Tracker 是 React 自动转义。
- **隐私铁律**：默认私有、显式公开。只有用户勾选 `public` 的条目、经「发布公开数据」按钮才进 Database-Public 的 `*.public.json`。**Investment-Info、Job-Tracker、People-Atlas 永不公开**（People-Atlas 连导出代码都没有，保持如此）。
- **本地缓存**：localStorage 缓存数据秒开，连接后 ghPull 覆盖。多设备并发以「合并/最新者胜」或「整文件最后写入胜」为准（xhs/bili 是真合并+墓碑）。

---

## 3. 部署与凭据（每次操作的正确路径）

- **本地镜像** `~/Desktop/hub-apps/<App>/`＝工作副本（本地 git 仓库，**无远程**）。**线上各 repo 才是真相源**。改前必做：`git clone --depth 1 git@github.com:NickkkLian/<Repo>.git` 到 scratchpad → **diff 线上 vs 本地**确认无漂移 → 在克隆里改 → 语法检查（`node --check` / `new Function(scriptBlock)`）→ 预览实测 → SSH push → `cp` 回本地镜像。
- **SSH 可推所有仓库**（用户级 key），包括 workflow 文件；**fine-grained PAT**（聊天中提供，勿写入任何文件）只能读写 Database/Database-Public 的 Contents，**不能**写 workflow、不能写其它 repo、不能建仓库。
- **建新仓库/开 Pages**：需要 owner 的 classic token（临时提供）或 owner 手动点。Pages API 刚建仓库时可能 500，隔几秒重试。
- **门户改卡片**：registry.ts → `npm run build` → dist 覆盖到 gh-pages worktree → push 两个分支。
- **workflow 升级基线**：actions/checkout@v5 + setup-node@v5 + Node 22（Node 20 已弃用）。
- **Anthropic API 直连**（app 内 AI 功能）：`anthropic-dangerous-direct-browser-access: true` 头；key 存 localStorage（各 app 自己的 key 名），绝不进仓库。模型选择惯例：Opus 4.8 默认/推荐，Sonnet 4.6 省钱档；Actions 里批量任务用 Haiku（`claude-haiku-4-5-20251001`）。
- **图片/附件**：存私有仓库子目录（xhs-images/、book-images/、business-lab-files/、images/），Contents API PUT base64；读取带令牌 `Accept: application/vnd.github.raw` → blob URL。

---

## 4. devlog 纪律（每次改动后必做）

- **凡有功能改动，写入 `Database/develop.json` 对应项目的 `updates`**（经 PAT Contents API）。
- **updates 数组顺序＝权威时间线（旧→新，追加在末尾）**；App 倒序显示（新在上）、**按数组位置累计版本号**（major.minor）。乱序会搞乱版本号——2026-07-02 已全量重排过，别再把新更新插错位置。
- note 用中文、信息密度高；kind：major（新功能/大改）/ minor（修复/小改）。
- 顺手刷新该项目的 `featureIntro`（“最新版本能力”）。
- 项目字段双语：`name`（中）+ `nameEn`、`desc` + `descEn`——**都是纯字符串**，devlog App 按字符串渲染，存对象会显示 [object Object]。
- **公开项目**（public:true 的 5 个）改动后要重新生成 `develop.public.json` 推 Database-Public，并同步 `personal-hub/scripts/mock/develop.public.json`。生成逻辑：name/summary 为 `{zh,en}`（en 取 nameEn/descEn 回退中文）、links 由 repoUrl/liveUrl 组装、updatedAt=最后一条有日期的 update。
- 写 develop.json 遇 409：重新 GET sha 重试（并发常见）。

---

## 5. 各 app 数据结构要点（改 schema 前必读）

### Creation-Ideas（writing.json）
- 结构：`{_meta, mystery:{sub:{ideas,wip,done}}, music:{ideas,wip,done}, literature:{...}, lyrics:{groups,items}}`。
- ⚠️ **`mergeData(defaults, loaded)` 只保留 defaults 里已有的键** ——加新顶层键必须同时改 `defaultData()` 和 `mergeData()`（lyrics 已有专门分支）。
- 歌词库：`lyrics.groups[{id,name,analysis,analyzedAt,analyzedCount}]`、`lyrics.items[{id,text,song,artist,note,groups:[gid],created_at,updated_at}]`（一条可多组）。AI 分析存组上；组内容变化显示 stale 提示。音乐类子页签由 `state.musicView`（'stages'|'lyrics'）控制。公开导出只遍历分类×阶段，lyrics 天然不导出。

### Business-Lab（business.json）
- ⚠️ **保存 payload 显式列字段**（ghPutOnce 与 g-export 两处）——新增顶层数组必须接进：state 初始化、payload、ghLoad(data.*)、本地 load(r.*)、导出 blob、计数、i18n。
- `BOARD_TYPES=['projects','media','freelance','career','topics']`（看板：三列分类+加权评分+抽屉）。
- `LIBS={research, marketing}`：**引用库**（扁平：title/summary/body/kind/tags/attachments/public）。`isLib(type)`/`libArr(type)`；渲染 `renderLib/libCard/libHTML/quickAddLib`。板块抽屉的引用下拉同时列 research+marketing（`citable`），`refCount` 跨全部板块统计，删除走 `cleanupRefs` 清悬挂引用。类型列表：`config.researchKinds` / `config.marketingKinds`（设置里 catEditor 可编辑）。
- 营销方案是**引用库不是看板**（用户明确要求，勿改回）。

### Development-Log（develop.json）
- project：`{id,name,nameEn,type(commercial/volunteer/personal/fun),status(delivered/inuse/wip/idea),desc,descEn,featureIntro,notes,repoUrl,liveUrl,public,createdAt,updates[]}`。
- update：`{id,date,kind(major/minor),note}`。
- 导出（buildExportData）：name/summary 双语对象、content=featureIntro、links、updatedAt=lastUpdateTime。按钮叫「发布公开数据」。

### Life-Atlas（life.json）
- `{version, config:{dimensions[6], otherTypes[{label,emoji}]}, cities[], chains[], trips[]}`。
- city：`{id,name(中文),country,lat,lng,status(resided/visited/want),scores{六维:0-10},guide,attractions,review,notes,restaurants[],bars[],others[]}`。
- restaurant：`{id,name,rating(null=未评),note}`；bar：`+cocktails[{id,name,level(tried/liked/loved),food?:true}]`（food=true 是「菜」）；other：`+type(取 otherTypes.label，如 咖啡/茶、甜品/烘焙)`。
- id 风格 `Date.now().toString(36)+rand`；新城市 scores 六维默认 5。
- 已知无害怪癖：海报导出函数内局部 `const T=(str,x,y,...)` 与全局 i18n T 同名，作用域隔离，勿动。

### People-Atlas（people.json）
- `{version,updatedAt,dims:{friends[],work[],venture[]},people[]}`；dim：`{id,name,weight}`；person：`{id,cat,name,scores{dimId:0-10},contact,source,profile,notes,tags[],lastContact,birthday,createdAt,updatedAt}`。
- 综合分＝已评维度加权平均（未评不计入）。三类人各自独立可编辑维度。视图：名录 / 各维度单项排行榜（`ui.view`）。**本库无任何公开导出，保持如此。**
- `birthday`：可选，存 `MM-DD`（年份未知）或 `YYYY-MM-DD`（可算年龄）；前端 `parseBday/bdayInfo` 算下一次生日倒计时，卡片 ≤14 天显示 🎂 徽章、当天变红。
- **生日提醒（服务端）**：Database repo `scripts/birthday-reminder.mjs` + `.github/workflows/birthday-reminder.yml`（每天 15:00 UTC）。读 people.json，谁的生日 `∈ LEAD`（默认 `7,0`＝提前一周+当天，可用 workflow 输入 `lead_days` 或 env `BIRTHDAY_LEAD_DAYS` 改）就用 nodemailer 经 Gmail SMTP 给站长自己发提醒邮件（含联系方式/备注）。**复用 Mail-Sorter 的 GMAIL_USER/GMAIL_APP_PASSWORD，无新 Secret**。`DRY_RUN=1` 只打印命中不发信；无命中/无凭据均 exit 0 不红。用温哥华时区定「今天」避免差一天。数据仍私有，邮件只发给自己。

### Investment-Info（investment/ 目录）
- 文件：invest.json（持仓/交易/计划，网页自动保存）、news.json、jobs.json（Actions 写）、config.json（news_sources + `fetch_enabled` 总闸）、ibkr.json（快照+交易）、books.json（书库蒸馏大全）、invest.public.json（发布到**私有库本目录**，非 Database-Public——投资数据不出私有库）。
- ghGet/ghPut 带 PREFIX='investment'；IBKR 解析器吃 Activity Statement CSV（多段式，Statement/Net Asset Value/Open Positions/Trades 段）；书库蒸馏走浏览器直连 Claude（key 存 `id_ai_cfg`），大全在 books.compendium.sections[].points[]（sources=bookId，img=book-images/ 路径）。

---

## 6. 小红书 xhs-organizer 图片机制（§7 引用）

- **CDN 链接自带签名时效**（URL 第一段 `/202607021008/`＝过期时间戳 UTC+8），过期 403 无解。
- 收藏时自动归档：weserv.nl 代理取字节（`images.weserv.nl/?url=…&w=1080&q=78&output=webp`，解决 CORS）→ PUT 私有库 `xhs-images/<noteId>/<i>.webp` → note.imagesRepo[i]。渲染优先 repo 图（带令牌 raw→blob），回退 https 化直连→weserv→「已过期」占位。
- 旧笔记「🔧 修复图片/修复全部」：重抓原帖（Jina Reader）拿新签名链接再归档。
- AI 整理「连图片一起分析」：带所选笔记**全部**图片（API 上限 100 截断提示；归档图发 base64，未过期直链发 url block）。
- 模块化：js/{i18n,classify,parse,store,sync,ai,images,app}.js，加载顺序 images.js 在 ai.js 前。

---

## 7. 邮件分拣台（Mail-Sorter + Database/mail/）

- 前端只是**摘要面板**（读 mail/mail.json、开关写 mail/config.json `enabled`）；干活的是 Database repo 的 `mail/scripts/classify.mjs` + `.github/workflows/mail-sync.yml`（每天 15:00 UTC + 手动 dispatch）。
- 流程：IMAP(imapflow) 读 Gmail → Claude Haiku 按 config.categories 分 8 类 → `messageCopy` 打 `AI/<类别>` 标签（archive_categories 里的类别用 `messageMove`=归档出收件箱）→ 写 mail.json（lastUid 增量游标、items 留 500）。
- `primary_only:true`（默认）：`gmailRaw:'category:primary'`（X-GM-RAW）只读「主要」标签页。
- backfill：Run workflow 填 `backfill_days`（上限 config.max_backfill=3000）。
- **安全边界**：只加标签，绝不删信/标已读/移出收件箱（MOVE 仅限用户显式配置的 archive_categories）；只发发件人+主题+群发信号给 AI，不发正文。Secrets：GMAIL_USER、GMAIL_APP_PASSWORD、ANTHROPIC_API_KEY。
- 无凭据/enabled=false 时脚本 exit 0 优雅跳过（workflow 不红）。

---

## 8. 网站侧对接（personal-hub）

- 数据管线：sources.config.json 注册 → sync-data.mjs（auto：真实源缺失落 mock）→ `src/data/*.normalized.json`。projects 读 develop.public.json（bilingual()/flattenPublicPayload 处理 {zh,en} 与 links）。
- featured：site.config.json `featured[module]=条目id` → sync 时打 `extra.featured` 标记置顶（展品号 NO.001 起）。
- 其余见 CLAUDE.md（网站本体的约定不在本文档重复）。

---

## 9. 常见坑速查

- zsh 循环里 `$VAR` 不分词、glob 失配即中断——批处理脚本用 python 或显式列表。
- headless 预览里 `confirm()` 返回 false——测删除先 `window.confirm=()=>true`。
- canvas 在 `display:none` 容器内宽度为 0——切 tab 时重绘（Investment-Info IBKR 已处理）。
- 预览测试数据记得清（localStorage 各 app 的 cache 键），别让测试数据被同步上仓库。
- Gmail Pages/API 刚创建资源时偶发 500/404——sleep 后重试。
- **GitHub Pages 部署偶发失败（纯服务端抖动，非代码问题）**：表现为一次 run **build 成功、deploy 失败**，annotation 写「Deployment failed, try again later」。诊断：`git ls-remote` 看 gh-pages HEAD 是新提交，但线上主 js 仍是旧 hash（curl 抓 `assets/index-*.js` grep 新卡片名，缺失=没部署上）；`GET /repos/{o}/{r}/deployments?environment=github-pages` 看最近 sha 的状态（failure）。**修法：① 优先 `POST /actions/runs/{id}/rerun-failed-jobs`（重发同一份正确产物）；② 若重跑卡在 queued 且取消不掉（运行器积压），改为往 gh-pages 推一个空提交 `git commit --allow-empty` 重触发一次全新部署——全新 run 会顶掉卡住的那次。** 门户（database-combined）就是这么修好 People-Atlas 卡片的（2026-07-03）。CDN 缓存刷新可能再等 1–2 分钟。
- devlog/develop.json 并发写 409——重新 GET sha 重试。
- 别用 `git add -A` 在 personal-hub 根（曾误吞私有 Database/ 等目录；.gitignore 已挡，但保持显式 add 习惯）。
