# Hub Apps 开发手册（个人网站 + 导航站 + 全家应用）

> 目的：compact 上下文后不丢细节。**动任何 app 前先读本文档相关小节。**
> 最后更新：2026-07-16（Toronto-Plan 隐私加固后泛化更名为 **Polaris 北极星**：多计划结构、数据迁 polaris.json；同日新增「公开壳零个人数据」铁律条目）。上次全量彻查 2026-07-14。改动生态结构/约定后同步更新本文档。

---

## 0. 文档地图（**先看这里，别在别处重复同一个事实**）

一个事实**只有一个家**，别处只放指针。2026-07-14 的教训：隐私铁律被抄成三份、**两份抄漏**（最危险那份恰是改 sync 时自动加载的技能）；「网站没部署」的旧勾选把人误导了一整轮。**重复 = 迟早分歧。**

| 文档 | 唯一负责 | 明确**不要**在这写 |
|---|---|---|
| **`HUB-APPS.md`（本文）** | 全生态：app 清单 / 共同约定 / **隐私铁律权威名单(§2)** / 部署与凭据 / devlog 纪律 / 各 app schema 要点 / 常见坑 | 网站 Astro 本体的实现细节；站长一次性操作步骤 |
| `personal-hub/CLAUDE.md` | **网站本体**（Astro 技术栈、设计基准、阶段状态、交接） | 生态清单、隐私名单（指向 §2 即可） |
| `personal-hub/BLUEPRINT.md` | 网站**需求蓝图**（唯一需求来源，改需求要提版本号） | 实时状态（状态在 CLAUDE.md，蓝图里写状态必然过时） |
| `.claude/skills/hub-data/SKILL.md` | 数据层**实现**：adapter 契约、规范化 schema、同步脚本行为规则 | 隐私名单、仓库清单（指向 §1/§2/§4） |
| `.claude/skills/hub-design/SKILL.md` | 设计系统（令牌/房间色/装裱/动效） | — |
| `LAUNCH-CHECKLIST.md` | **站长待办**（一次性、未完成项） | 已完成的事（做完就打勾，别攒） |
| `DEPLOY-GUIDE.md` | 部署**参考/重建手册**（已完成，非待办） | 待办（待办去 LAUNCH-CHECKLIST） |
| `BACKLOG.md` | 明确**搁置**的功能 | 已做完的（曾把 My Music 写成"占位页"，实际早已上线） |
| `hub-apps/CLAUDE.md` | 镜像目录说明（含「content-organizer/local 即运行时」） | 任何生态约定（指向本文） |
| `~/.claude/CLAUDE.md`（用户级） | 跨项目工作纪律（问/留痕/别乱改/验收/同步远端） | 任何项目细节 |

**记忆库**（`~/.claude/projects/.../memory/`）记的是「换会话/换模型要知道、但代码和 git 看不出」的事；与本文重复的部分以本文为准。

---

## 1. 生态地图

| 层 | 仓库 | 部署 | 说明 |
|---|---|---|---|
| 个人网站 | `personal-hub` | Cloudflare Pages（deploy.yml 自动） | Astro 5，见本仓库 CLAUDE.md/BLUEPRINT.md |
| 导航站（门户） | `database-combined` | GitHub Pages **gh-pages 分支**（构建产物） | Vite+Preact+TS，卡片注册表 `src/lib/registry.ts`；改完 `npm run build` → dist 推 gh-pages（worktree 法） |
| 私有数据仓库 | `Database`（私有） | — | 各 app 的 JSON 数据 + `.github/workflows/`（investment-sync.yml、mail-sync.yml、birthday-reminder.yml）+ `investment/` `mail/` `scripts/` 脚本 + `xhs-images/` `business-lab-files/` 附件目录 + `toronto-plan/` 多伦多计划文档包（devlog 项目「多伦多计划」；本地工作副本 `~/Desktop/Dev/toronto-plan/`，改动后推回仓库）+ `toolbox/` 工具箱知识库文档（本地工作副本 `~/Desktop/Dev/toolbox/`，README=通用整理归纳 SOP，改完同步推回） |
| 公开数据仓库 | `Database-Public` | — | **只放显式导出的 `*.public.json`**；网站只读这里 |
| 各应用 | 一 app 一公开仓库（下表） | 各自 GitHub Pages（main 分支根目录） | 同源 `nickkklian.github.io/<Repo>/` |

### 应用清单（19 张门户卡）

> 卡数以 `personal-hub-admin/src/lib/registry.ts` 为准（数 `label:` 要减掉 interface 里那个声明）。

| 应用 | 仓库 | 数据文件（Database/） | 特殊点 |
|---|---|---|---|
| 开发日志 devlog | Development-Log | develop.json | §4 devlog 纪律；导出 develop.public.json |
| 创意想法库 | Creation-Ideas | writing.json | ⚠️ mergeData 剥未知键；歌词库在顶层 `lyrics` 键（§5） |
| 情报终端 | Investment-Info | investment/ 目录多文件 | tab：动态/投资/IBKR/**Wealthsimple**/书库/趋势；PREFIX='investment'；抓取总闸 config.json `fetch_enabled` |
| 生活地图 | Life-Atlas | life.json | 城市/餐厅/酒吧/cocktails schema 见 §5 |
| 选题实验室 | Business-Lab | business.json | ⚠️ 保存 payload 显式字段白名单；LIBS（research+marketing 引用库）见 §5 |
| 知识图谱 | Knowledge-Atlas | knowledge.json | vis-network 图谱；🎯 学习计划 tab 读 `plans[]`（CS/AI、Business X-Ray、french-tef-2027 三个计划），保存整包写回 |
| 菜单 | My-Menu | menu.json | |
| 思维库 | Mind-Archive | thoughts.json | 每次保存前取新 sha（免疫冲突）；附件 images/ files/ |
| 诡计逻辑库 | Mystery-Trick-Archive | data.json | |
| 专辑收藏 | Album-Journal | albums 数据 | |
| 收藏整理库 | content-organizer | content.json + xhs-images/ | ⚠️ 多文件（js/ 模块，挂 `window.XHS`）；小红书(图文/视频)+B站(视频) 合一，跨平台 AI 整理；图片归档与缓存陷阱见 §6；本地抓取后端 `local/content_server.py`（yt-dlp+whisper，须住宅 IP，双击 `收藏整理库抓取.app` 开关） |
| 暂存库存 | Storage-Tracker | storage 数据 | |
| 求职追踪 | Job-Tracker | jobapp/ 多文件 | ⚠️ React 18 CDN + babel-standalone（JSX），非 vanilla |
| 邮件分拣台 | Mail-Sorter | mail/mail.json + mail/config.json | 后台在 Database repo（§7） |
| 媒体台账 | Media-Ops | media-ops.json | 自媒体账号运营台账；与 `~/Desktop/Dev/media-swarm` 蜂群 accounts/ 同 id 对应；成本收益敏感，**无公开导出** |
| 人力资源 | People-Atlas | people.json | **绝无公开导出功能**（§5） |
| 北极星 | Polaris | polaris.json | 多计划人生追踪（原 Toronto-Plan，2026-07-16 泛化更名）：plans[] 每计划独立线路/现金流 vs 目标带/里程碑/检查点/配置，App 内可建删计划与线；多伦多计划=plans[0]；现金流敏感，**无公开导出**；**公开壳零个人数据**（种子/链接由私有 polaris.json 的 config.docLinks 与 line.link 驱动）；多伦多文档包 Database/toronto-plan/，法语计划在 Knowledge-Atlas plans[] |
| 工具箱 | Toolbox | toolbox/ 目录（*.md） | 只读文档阅读器（README=通用整理归纳 SOP，主题侧栏读 INDEX.md 描述，内置精简 MD 渲染器）；编辑走本地工作副本 `~/Desktop/Dev/toolbox/` 再同步；未来项目情报，**无公开导出** |
| 网站后台 | personal-hub `/admin` | 写回网站仓库 | Cloudflare 域，独立登录，不共享 pha-config |

**已退役（别再找、别再改）**：`claude-remote`（Claude 遥控，手机发键给桌面 app）→ **2026-07-15 退役**：卡在 macOS TCC——这台 Mac 不放行 ad-hoc 签名的自制 app 拿「辅助功能」，发键那步过不了系统权限（裸 python/CGEvent/AppleScript app 都试过，自动化能授、辅助功能 trust 恒 0）。代码存**私密 repo `NickkkLian/claude-remote`**（前台检测/手机页/命令队列可用，仅系统级发键权限卡死），本地 `~/Desktop/Dev/claude-remote/`。想要手机遥控改用 RustDesk / Mac 屏幕共享（正经签名、权限干净）。devlog 项目「Claude 遥控」保留、`status=archived`。

`xhs-organizer`（小红书整理）+ `bilibili-organizer`（B站归档）→ **2026-07-11 合并进「收藏整理库」**。两个仓库与 `Database/xhs.json`、`bilibili.json` 仅作备份（**不再被写**，content.json 首次运行时自动引导合并），门户卡已撤，devlog 里 `status=archived`、`public:false`。`bilibili-organizer` 原先那个 Cloudflare Worker（B 站字幕代理）**一并退役**——数据中心 IP 被 B 站拦，改走本地住宅 IP。本地镜像 `hub-apps/{xhs,bilibili}-organizer/` 留着只为查历史。

---

## 2. 全家共同约定（写代码必须遵守）

- **单文件哲学**：app = 一个 index.html（例外见上表）。无构建、无依赖（CDN 字体/库除外）。
- **令牌共享**：`localStorage['pha-config']`＝`{owner, repo, token}`，全家同源共享（门户配置一次）。app 读取时**只补空缺不覆盖**；写回时**整体合并**，绝不丢其它字段。⚠️ **设备上的实际值可能缺 repo（甚至缺 owner）**——app 读取端必须缺省补 `NickkkLian`/`Database`（门户 store.ts 的 DEFAULTS 就是这么做的）；北极星曾因要求三字段齐全而误报「未配置令牌」（2026-07-17 修复）。
- **双语**：`localStorage['pha-lang']`（'zh' 默认/'en'）。惯用法：`const T=(zh,en)=>lang==='en'?en:zh` + 静态 HTML 用 `data-i18n` 词典 + `applyStatic()`。存储值（枚举/分类 key）不译，只译显示。
- **base64 必须 UTF-8 安全**：TextEncoder/TextDecoder 或 `btoa(unescape(encodeURIComponent()))`。裸 btoa/atob 处理中文=数据损坏。
- **保存冲突**：PUT 409/422 → 重新 GET sha → 重试一次（全家标准 idiom，2026-07-02 体检已补齐所有 app）。Mind-Archive 例外：每次保存前都取新 sha。
- **保存要有 try/catch 并把失败显示给用户**（My-Menu 曾静默失败，已修）。
- **XSS**：所有用户内容进 innerHTML 前过 `esc()`。Job-Tracker 是 React 自动转义。
- **隐私铁律（本节是全生态唯一权威名单，别处只许指向这里、不许各自抄一份）**：默认私有、显式公开。只有用户勾选 `public` 的条目、经「发布公开数据」按钮才进 Database-Public 的 `*.public.json`。
  **永不公开 / 永不进同步清单（5 个）**：
  | app | 为什么 | 现状 |
  |---|---|---|
  | Investment-Info | 投资数据 | 导出只写**私有库** `investment/invest.public.json`，网站永不读 |
  | Job-Tracker | 求职数据过敏感 | **刻意不做导出功能**，杜绝误发布 |
  | People-Atlas | 人际关系/AI 蒸馏私密内容 | **连导出代码都没有，保持如此** |
  | Media-Ops | 成本收益敏感 | 无公开导出 |
  | Polaris（北极星，原 Toronto-Plan） | 现金流敏感 | 无公开导出 |
  > ⚠️ 2026-07-14 查出：这条铁律曾被抄成三份并**各自抄漏**——`personal-hub/CLAUDE.md` 漏了 People-Atlas，`.claude/skills/hub-data/SKILL.md`（**恰恰是改 sync 脚本时自动加载的那份**）漏了 People-Atlas / Media-Ops / Toronto-Plan。已改为都指向本节。**以后新增敏感 app 只改这里一处。**
- **公开壳零个人数据**：app 的 index.html（公开仓库+公开 Pages 站点，即使仓库转私有站点也公开）里不得内嵌任何个人内容——种子数据、默认目标、日期、文档链接、业务槽名都算；一律放私有数据文件由 config 驱动，壳只留空态提示。**新 app 上线前 grep 壳里的个人字符串**；若已泄露：清壳 + orphan 重写历史强推 + 验证线上。（2026-07-16 教训：Toronto-Plan 壳曾内嵌六线/里程碑/现金流目标/PR 日期种子，站长指正后已修复。）
- **本地缓存**：localStorage 缓存数据秒开，连接后 ghPull 覆盖。多设备并发以「合并/最新者胜」或「整文件最后写入胜」为准（收藏整理库 content.json 是真合并+墓碑）。

---

## 3. 部署与凭据（每次操作的正确路径）

- **本地镜像** `~/Desktop/Dev/hub-apps/<App>/`＝工作副本（本地 git 仓库，**无远程**）。**线上各 repo 才是真相源**。改前必做：`git clone --depth 1 git@github.com:NickkkLian/<Repo>.git` 到 scratchpad → **diff 线上 vs 本地**确认无漂移 → 在克隆里改 → 语法检查（`node --check` / `new Function(scriptBlock)`）→ 预览实测 → SSH push → `cp` 回本地镜像。
- **SSH 可推所有仓库**（用户级 key），包括 workflow 文件；**fine-grained PAT**（聊天中提供，勿写入任何文件）只能读写 Database/Database-Public 的 Contents，**不能**写 workflow、不能写其它 repo、不能建仓库。
- **建新仓库/开 Pages**：需要 owner 的 classic token（临时提供）或 owner 手动点。Pages API 刚建仓库时可能 500，隔几秒重试。
- **门户改卡片**：registry.ts → `npm run build` → dist 覆盖到 gh-pages worktree → push 两个分支。
- **workflow 升级基线**：actions/checkout@v5 + setup-node@v5 + Node 22（Node 20 已弃用）。
- **Anthropic API 直连**（app 内 AI 功能）：`anthropic-dangerous-direct-browser-access: true` 头；key 存 localStorage（各 app 自己的 key 名），绝不进仓库。模型选择惯例：`claude-opus-4-8` 默认/推荐，`claude-sonnet-5` 省钱档（2026-07 全家已从 Sonnet 4.6 升级到 5，别再写 4.6）；Actions 里批量任务用 Haiku（`claude-haiku-4-5-20251001`）。
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
- 侧栏搜索有 `state.searchMode`（'city'|'venue'）切换：venue 模式 `renderVenueList()` 跨全部城市搜 restaurants/bars/others（名/备注/类别/城市/cocktail），点结果 `openVenue()` → 开城市详情并 `_flashVenue` 滚动高亮那条 `[data-eid]`。city 模式才走 geocode 加城市。
- 地图交互：Leaflet `preferCanvas` + `zoomSnap:0` 连续缩放 + 触控板双指 wheel→平移（`scrollWheelZoom.disable()` 自管 wheel）；城市点 `POINT_ZOOM=3.8` 起显示。区域高亮就近吸附只吸「中国省 / 非中国整国」（`nearestRegionId`，别吸非中国省否则如魁北克单独变色）；`regions.geojson` 里原 8 国共用 `a0_-99` 已各给独立 id。
- 已知无害怪癖：海报导出函数内局部 `const T=(str,x,y,...)` 与全局 i18n T 同名，作用域隔离，勿动。

### People-Atlas（people.json）
- `{version,updatedAt,dims:{friends[],work[],venture[]},people[]}`；dim：`{id,name,weight}`；person：`{id,cat,name,scores{dimId:0-10},contact,source,profile,notes,tags[],lastContact,birthday,character[],essence[],quotes[],createdAt,updatedAt}`。
- 综合分＝已评维度加权平均（未评不计入）。三类人各自独立可编辑维度。视图：名录 / 各维度单项排行榜（`ui.view`）。**本库无任何公开导出，保持如此。**
- `birthday`：可选，存 `MM-DD`（年份未知）或 `YYYY-MM-DD`（可算年龄）；前端 `parseBday/bdayInfo` 算下一次生日倒计时，卡片 ≤14 天显示 🎂 徽章、当天变红。
- **生日提醒（服务端）**：Database repo `scripts/birthday-reminder.mjs` + `.github/workflows/birthday-reminder.yml`（每天 15:00 UTC）。读 people.json，谁的生日 `∈ LEAD`（默认 `7,0`＝提前一周+当天，可用 workflow 输入 `lead_days` 或 env `BIRTHDAY_LEAD_DAYS` 改）就用 nodemailer 经 Gmail SMTP 给站长自己发提醒邮件（含联系方式/备注）。**复用 Mail-Sorter 的 GMAIL_USER/GMAIL_APP_PASSWORD，无新 Secret**。`DRY_RUN=1` 只打印命中不发信；无命中/无凭据均 exit 0 不红。用温哥华时区定「今天」避免差一天。数据仍私有，邮件只发给自己。
- **深读档案（纪念+文学创作向）**：每人一个「📖 深读」模态（抽屉底部按钮进）。三块：`character[{id,label,text}]`（人物蒸馏，默认 3 维度 性格特质/说话方式/观念·价值观，`charAspects()` 空时按需 seed、可增删）、`essence[{id,topic,text,quote,date,createdAt}]`（探讨精华）、`quotes[{id,text,context,date,createdAt}]`（金句原话）。卡片有内容时显示 📖。
- **AI 蒸馏（本 app 首个 AI）**：设置里填 Anthropic key，存 `localStorage['people_ai_cfg']={key,model}`（默认 `claude-opus-4-8`，可切 `claude-sonnet-5`；**各 app 自己的 key 名，只存本机**）。深读页「🧪 从聊天记录蒸馏」→ 浏览器直连 `api.anthropic.com/v1/messages`（headers：x-api-key + anthropic-version 2023-06-01 + **anthropic-dangerous-direct-browser-access:true**）+ `output_config.format` json_schema（**结构化 JSON，保证可解析**；schema 每层 `additionalProperties:false`、字段全 required）→ 提取 character/essence/quotes → 审阅后 `adoptDistill()` **增量合并**（同名 aspect 追加不覆盖、essence/quotes 前插）。查过 stop_reason==='refusal'。max_tokens 8000 非流式。**纯私有，无公开导出，key 不进仓库。**

### Investment-Info（investment/ 目录）
- 文件：invest.json（持仓/交易/计划，网页自动保存）、news.json、jobs.json（Actions 写）、config.json（news_sources + `fetch_enabled` 总闸）、ibkr.json（快照+交易）、books.json（书库蒸馏大全）、invest.public.json（发布到**私有库本目录**，非 Database-Public——投资数据不出私有库）、**ws.json**（Wealthsimple TFSA，2026-07-15 新增）。
- ghGet/ghPut 带 PREFIX='investment'；IBKR 解析器吃 Activity Statement CSV（多段式，Statement/Net Asset Value/Open Positions/Trades 段）；
- **Wealthsimple（ws.json）**：`{updated_at, tfsa:{room_amount,room_asof}, flows:[{id,date,type:contribute|withdraw,amount,note}], positions:[{id,symbol,cat,cur,qty,costPrice,price}], cash, snapshots:[…同 ibkr], trades:[]}`。positions 是**可编辑的当前持仓**（value/costBasis/unreal 由 `wsCalc()` 现算、不落库），点「存为今日快照」才 push 进 snapshots（同日覆盖）→ 复用 `drawNavChart/drawAllocChart`。
  - ⚠️ **WS 没有官方 API**，非官方库要账号密码+2FA（券商凭据，不碰；WS 也在封）→ 只做「导出→解析」，与 IBKR 同套路。
  - **解析器（2026-07-15 照真实样本写成）**：两种导出按表头自动认——`holdings-report`（Account Name…Book Value (CAD)…）＝全量持仓快照，整体替换；`activities-export`（transaction_date…activity_type…net_cash_amount）＝成交 + 出入金。两份可一次选中同时导入。末尾 `"As of …"` 行与空行要跳过；复用现成 `parseCSVLine`；只收 `account_type=TFSA`。
  - 🚨 **绝不按内容去重（血的教训）**：WS 同一天可能有**多笔完全相同**的成交——真实样本里两笔 BUY 各 13.1814 股 @189.6599，持仓表 26.3628＝2×13.1814 印证是两笔真成交。**照搬 IBKR 的 `date|symbol|qty|price` 去重会把持仓算成一半。** 改用**按导出日期区间整段替换**：重复导入幂等、新导出覆盖重叠区间、手动流水（`src!=='ws'`）不受影响。
  - ⚠️ **持仓表不含现金** → 现金只能由活动表 `net_cash_amount` 累加推得，且只有导出「全部历史」才准 → 只做建议+按钮，**不自动写**。
  - ⚠️ **认不出的活动不猜、也不静默丢弃**：只自动认 `MoneyMovement/EFT`（按金额正负判供款/取款），股息/利息/转账等一律列出来交站长判断——TFSA 里股息利息不占额度、机构间直接转账也不占，但从非注册账户转入就占；猜错会让他以为还有额度→超额→罚 1%/月。
  - ⚠️ **TFSA 额度规则（别自作聪明）**：基准 `room_amount/room_asof` 由站长从 **CRA My Account** 抄，**代码不推算每年限额**（算错会害站长超额，CRA 罚超出部分 1%/月）。两条硬规则在 `wsRoom()`：① 当年取款**不**恢复额度（下一个 1/1 才恢复）→ 记 `pending`；② `asof` 跨年即 `stale`（缺新年度限额 + 去年取款的恢复）→ 红字提示回 CRA 更新。已单测 9 例。书库蒸馏走浏览器直连 Claude（key 存 `id_ai_cfg`），大全在 books.compendium.sections[].points[]（sources=bookId，img=book-images/ 路径）。

---

## 6. 收藏整理库 content-organizer 图片机制

- **CDN 链接自带签名时效**（URL 第一段 `/202607021008/`＝过期时间戳 UTC+8），过期 403 无解。
- 收藏时自动归档：weserv.nl 代理取字节（`images.weserv.nl/?url=…&w=1080&q=78&output=webp`，解决 CORS）→ PUT 私有库 `xhs-images/<noteId>/<i>.webp` → note.imagesRepo[i]。渲染优先 repo 图（带令牌 raw→blob），回退 https 化直连→weserv→「已过期」占位。
- ⚠️ **取 sha 的 GET 必须 `cache:'no-store'`**（凡"同一 contents URL 既用 raw 取图、又用 JSON 取 sha"的 app 都适用）：渲染截图用 `Accept: vnd.github.raw` 请求过 `contents/<path>` 后，Chrome 把原始图片字节缓存在该 URL 下、**且不按 Accept 分桶**（GitHub 发了 `Vary: Accept`，但浏览器侧读到 null）；之后 PUT 撞 422（文件已存在）回头 GET 同一 URL 取 sha 时命中那份缓存，`.json()` 拿到图片字节报 `Unexpected token 'R', "RIFF…"`。实测**只加显式 Accept 挡不住，只有 no-store 管用**。2026-07-14 content-organizer 踩到：重抓已存在的视频时截图 0/N 全灭。
- 旧笔记「🔧 修复图片/修复全部」：重抓原帖（Jina Reader）拿新签名链接再归档。
- AI 整理「连图片一起分析」：**默认勾选**，带所选笔记**全部**图片（API 上限 100 截断提示；归档图发 base64，未过期直链发 url block）。⚠️ 送 Claude 前必须限尺寸：单请求 >20 张图时单图上限 2000×2000，长图直接送会 400（`image dimensions exceed max`）——`visionUrl()` 走 weserv `fit=inside` 限长边 1568，归档图用 `capB64()` 在 canvas 里缩。
- 视频截图同走这套：本地后端抽候选帧 → `ai.judgeFrames()` 判有无信息价值 → `images.saveFrames(key, kept)` 存 `xhs-images/<key>/<i>.webp`（所以上面那条 no-store 陷阱正是在这踩到的）。
- 模块化（**真实加载顺序**，i18n.js 必须最先）：`js/{i18n,classify,parse,store,sync,images,fetch,ai,app}.js`——images.js 在 ai.js 前；`fetch.js`（连本地抓取后端）是收藏整理库比原 xhs-organizer 多出来的一个。

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
