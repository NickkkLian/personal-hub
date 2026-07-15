# 站长待办清单（网站**已上线**，这些是还没做完的）

> ⚠️ **2026-07-14 更正**：本文原写作「上线前待办」，但**网站早就在跑**了 —— https://personal-hub-7uc.pages.dev （Cloudflare Pages，deploy.yml/sync.yml 都在正常工作）。旧措辞误导过一次，已按实际状态重排。
> 下面**没打勾的是真的还没做**（2026-07-14 逐项核对过线上与配置，不是照抄旧文）：公开数据只发布了 `album-journal` + `develop`，`web3formsKey` 仍是空的（**联系表单目前不工作**），Umami 未接。
> 每项都是一次性的，做完打勾。标注 ⏱ 的是预计耗时；标注【上线后也可】的不阻塞。

## 一、数据发布（让网站显示真实内容）⏱ 15–30 分钟

- [ ] 在各应用里勾选要公开的条目并点「🌐 发布公开」（每个应用一次）：
  - [ ] Creation-Ideas（创意想法库）→ `writing.public.json`
  - [ ] Mind-Archive（思维库）→ `thoughts.public.json`
  - [ ] Knowledge-Atlas → `knowledge.public.json`【模块暂关，上线后也可】
  - [ ] Life-Atlas → `life.public.json`【模块暂关，上线后也可】
  - [ ] My-Menu → `menu.public.json`【模块暂关，上线后也可】
  - [ ] Mystery-Trick-Archive → `mystery-tricks.public.json`【模块暂关，上线后也可】
  - [x] Album-Journal → `album-journal.public.json`【✅ 2026-07-14 核实：文件已在 Database-Public。但专辑墙模块已搁置，见 BACKLOG】
  - [x] Development-Log → `develop.public.json`【✅ 已发布并在 /projects 展出；改了公开项目后记得跑一次 sync.yml，否则不上站】
- [x] 编辑网站仓库的 `content/my-music.json`：✅ 已填 4 首真实作品（繁花 / 当灯光熄灭时 / 夏日重现 / 泡沫天使，均带网易云链接，已在 `/music` 展出）。**仅剩**：想要页内试听的话得提供音频文件（现在 4 首都没有 `audio`，只能跳外链）
- [ ] 编辑 `content/projects-overrides.json`：确认置顶项目清单与双语简介（现为我代拟的两条，可改）
- [ ] 编辑 `site.config.json` 的 `about.bio` 与 `about.timeline`：替换占位简介与时间线

## 二、第三方服务注册 ⏱ 10 分钟

- [ ] **Web3Forms**（联系表单）：web3forms.com 用邮箱注册 → 复制 Access Key → 填入 `site.config.json` 的 `"web3formsKey"`
- [ ] **Umami Cloud**（访问统计，P4 接入）：cloud.umami.is 注册 → 建网站 → 把 Website ID 给 Claude Code
- [x] **Cloudflare**（托管，P5）：✅ 已完成，站点跑在 https://personal-hub-7uc.pages.dev
- [ ] （可选）**域名**：现用免费的 `*.pages.dev`，够用；想要自有域名再去 Cloudflare Registrar 或 Porkbun 注册 `.com` ≈ US$10–12/年

## 三、令牌卫生 ⏱ 3 分钟

- [ ] 作废 `push-apps-v2` 令牌（开发期写入用，上线流程不需要它）：GitHub → Settings → Developer settings → Fine-grained tokens → Delete
- [ ] `hub-sync-readonly` 令牌：双仓库架构后网站同步已不需要任何令牌，可一并作废；若保留，记得一年后到期前轮换
- [ ] 确认各应用设置里的私人令牌仍只授权 `Database` + `Database-Public` 两个仓库

## 四、复查（已上线，随时可和 Claude Code 一起过）

- [x] 各模块开关状态（2026-07-14 核实线上：home `/`、projects、writing、my-music（**路由是 `/music`**）、about 全 200；music-wall/knowledge/life/menu/mystery/social 关）
- [ ] 双语 × 双主题 × 三断点走查（Claude Code 自测后给你预览清单）
- [ ] Lighthouse 门槛验收报告（Perf ≥ 90 / A11y ≥ 95 / SEO = 100）

## 五、文本后台 admin.html（**现在就能用**）⏱ 随时

- 浏览器打开 **https://personal-hub-7uc.pages.dev/admin.html** （2026-07-14 核实可访问）
- 填 owner / repo / branch（main）/ 一个对**网站仓库** Contents 读写的 fine-grained 令牌（只存本机浏览器）
- 点「载入文本」→ 改任意界面文字、背景幽灵字、批注、标题/简介、时间线、字体 → 「保存并发布」→ 约 1–2 分钟网站更新
- 改模块开关也在这里（等同改 site.config.json）
