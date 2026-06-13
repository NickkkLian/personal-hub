# 上线前站长待办清单

> 全部开发完成后、正式上线（P5）前，按此清单统一操作。每项都是一次性的，做完打勾。
> 标注 ⏱ 的是预计耗时；标注【上线后也可】的不阻塞上线。

## 一、数据发布（让网站显示真实内容）⏱ 15–30 分钟

- [ ] 在各应用里勾选要公开的条目并点「🌐 发布公开」（每个应用一次）：
  - [ ] Creation-Ideas（创意想法库）→ `writing.public.json`
  - [ ] Mind-Archive（思维库）→ `thoughts.public.json`
  - [ ] Knowledge-Atlas → `knowledge.public.json`【模块暂关，上线后也可】
  - [ ] Life-Atlas → `life.public.json`【模块暂关，上线后也可】
  - [ ] My-Menu → `menu.public.json`【模块暂关，上线后也可】
  - [ ] Mystery-Trick-Archive → `mystery-tricks.public.json`【模块暂关，上线后也可】
  - [ ] Album-Journal → `album-journal.public.json`【专辑墙已搁置，见 BACKLOG】
- [ ] 编辑网站仓库的 `content/my-music.json`：把占位示例换成真实原创音乐作品（标题/简介/各平台外链，`public: true`）
- [ ] 编辑 `content/projects-overrides.json`：确认置顶项目清单与双语简介（现为我代拟的两条，可改）
- [ ] 编辑 `site.config.json` 的 `about.bio` 与 `about.timeline`：替换占位简介与时间线

## 二、第三方服务注册 ⏱ 10 分钟

- [ ] **Web3Forms**（联系表单）：web3forms.com 用邮箱注册 → 复制 Access Key → 填入 `site.config.json` 的 `"web3formsKey"`
- [ ] **Umami Cloud**（访问统计，P4 接入）：cloud.umami.is 注册 → 建网站 → 把 Website ID 给 Claude Code
- [ ] **Cloudflare**（托管，P5）：dash.cloudflare.com 注册账号即可，接入步骤届时由 Claude Code 给指引
- [ ] （可选）**域名**：Cloudflare Registrar 或 Porkbun 注册 `.com` ≈ US$10–12/年；不买也能用免费的 `*.pages.dev` 域名

## 三、令牌卫生 ⏱ 3 分钟

- [ ] 作废 `push-apps-v2` 令牌（开发期写入用，上线流程不需要它）：GitHub → Settings → Developer settings → Fine-grained tokens → Delete
- [ ] `hub-sync-readonly` 令牌：双仓库架构后网站同步已不需要任何令牌，可一并作废；若保留，记得一年后到期前轮换
- [ ] 确认各应用设置里的私人令牌仍只授权 `Database` + `Database-Public` 两个仓库

## 四、上线前最终确认（届时和 Claude Code 一起过）

- [ ] 决定 v1 上线时各模块开关状态（当前：home/projects/writing/my-music/about 开，其余关）
- [ ] 双语 × 双主题 × 三断点走查（Claude Code 自测后给你预览清单）
- [ ] Lighthouse 门槛验收报告（Perf ≥ 90 / A11y ≥ 95 / SEO = 100）

## 五、文本后台 admin.html（上线后可用）⏱ 随时

- 网站仓库上线后，浏览器打开 `你的网址/admin.html`
- 填 owner / repo / branch（main）/ 一个对**网站仓库** Contents 读写的 fine-grained 令牌（只存本机浏览器）
- 点「载入文本」→ 改任意界面文字、背景幽灵字、批注、标题/简介、时间线、字体 → 「保存并发布」→ 约 1–2 分钟网站更新
- 改模块开关也在这里（等同改 site.config.json）
