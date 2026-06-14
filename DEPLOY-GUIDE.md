# 上线部署指引（P5 · GitHub Actions + Cloudflare Pages）

> 给站长的逐步操作手册。技术活已写好（`.github/workflows/` 三个文件），你只需做下面的一次性配置。
> 全程约 **20 分钟**，不需要写任何代码。做完打勾。

部署方式：**GitHub Actions 全自动**。逻辑是——你 push 代码或数据应用发布公开 → GitHub 自动构建 → 部署到 Cloudflare Pages。
公开数据走 `raw.githubusercontent.com` 直读，**全程不碰任何私有令牌**，隐私铁律不受影响。

---

## 你需要准备的东西

- 一个 GitHub 账号（你已有：NickkkLian）
- 一个 Cloudflare 账号（没有就去 https://dash.cloudflare.com/sign-up 注册，免费）

最终你要拿到 **2 个值**，填进 GitHub 仓库的 Secrets：

| Secret 名字       | 是什么                          |
| ----------------- | ------------------------------- |
| `CF_ACCOUNT_ID`   | Cloudflare 账号 ID              |
| `CF_API_TOKEN`    | 一个只能管 Pages 的 API 令牌    |

---

## 第 1 步：在 GitHub 建一个空仓库（2 分钟）

1. 打开 https://github.com/new
2. **Repository name** 填：`personal-hub`
3. 可见性选 **Private**（私有，推荐）或 Public 都行
4. ⚠️ **不要**勾选 "Add a README / .gitignore / license"——保持完全空白
5. 点绿色按钮 **Create repository**
6. 建好后**把这个页面的网址发给我**（形如 `https://github.com/NickkkLian/personal-hub`），我来把本地代码推上去。

> 推上去这一步由我（Claude Code）执行，你不用敲命令。

---

## 第 2 步：拿 Cloudflare Account ID（1 分钟）

1. 登录 https://dash.cloudflare.com
2. 左侧菜单点 **Workers & Pages**
3. 在右侧栏（或页面右下角）找到 **Account ID**，点旁边的复制图标
4. 把它存好——这就是 `CF_ACCOUNT_ID` 的值

---

## 第 3 步：创建 Cloudflare API Token（3 分钟）

1. 打开 https://dash.cloudflare.com/profile/api-tokens
2. 点 **Create Token**（创建令牌）
3. 拉到最下面，**Custom token（自定义令牌）** 那一栏点 **Get started**
4. 填写：
   - **Token name**：随便起，例如 `personal-hub-deploy`
   - **Permissions（权限）**：选一行，三个下拉依次设为
     **Account** → **Cloudflare Pages** → **Edit**
   - 其余保持默认
5. 点 **Continue to summary** → **Create Token**
6. 页面会显示一长串令牌——**这串只显示这一次**，立刻复制存好。这就是 `CF_API_TOKEN` 的值。

> 这个令牌只能编辑 Cloudflare Pages，碰不到你的代码、邮箱或别的服务，泄露风险很低；但仍请只贴进下一步的 GitHub Secrets，别发别处。

---

## 第 4 步：把 2 个值填进 GitHub Secrets（2 分钟）

1. 打开你第 1 步建的仓库，点顶部 **Settings**（设置）
2. 左侧菜单 **Secrets and variables** → **Actions**
3. 点 **New repository secret**：
   - Name 填 `CF_ACCOUNT_ID`，Secret 填第 2 步复制的账号 ID → **Add secret**
4. 再点一次 **New repository secret**：
   - Name 填 `CF_API_TOKEN`，Secret 填第 3 步复制的令牌 → **Add secret**

填完应看到列表里有两条：`CF_ACCOUNT_ID`、`CF_API_TOKEN`。✅

---

## 第 5 步：我推代码 → 自动上线（你不用做，等结果）

你把第 1 步的仓库网址发我后，我会：

1. 把本地全部代码推到新仓库的 `main` 分支
2. push 会自动触发 **Deploy** workflow（GitHub 仓库 **Actions** 标签页能看到进度条）
3. 第一次运行会**自动创建**名为 `personal-hub` 的 Cloudflare Pages 项目并部署
4. 约 2–4 分钟后，你的站点上线在 `https://personal-hub.pages.dev`

我会盯着这次构建，成功后把网址和验收说明给你。

---

## 上线后会怎样运转（了解即可，无需操作）

- **改文本/字体/开关**：在 `你的网址/admin.html` 里改并保存 → 自动 push → 1–2 分钟刷新上线
- **发布公开数据**：在各数据应用点「🌐 发布公开」→ 最迟 6 小时内（定时任务）自动刷上线
  - 想「发布即时上线」是可选增强：让应用在发布后顺手通知网站重建。需要时告诉我，我给应用侧加一段（要一个能触发网站仓库 Actions 的小令牌）。现在不做也行，6 小时兜底足够。
- **自定义域名**（可选）：买了域名后告诉我，在 Cloudflare Pages 项目 → Custom domains 绑定，我同步改 `site.config.json` 与 `astro.config.mjs` 的 url。

---

## 三个 workflow 文件是干嘛的（给好奇的你）

| 文件                                | 触发时机                                  | 作用                     |
| ----------------------------------- | ----------------------------------------- | ------------------------ |
| `.github/workflows/deploy.yml`      | 每次 push 到 main / 手动                   | 代码变了就重新部署       |
| `.github/workflows/sync.yml`        | 每 6 小时 / 应用发布通知 / 手动            | 公开数据变了就刷新上线   |
| `.github/workflows/_build-deploy.yml` | 被上面两个调用（不单独跑）                | 共享的「构建+部署」逻辑  |

> 改部署逻辑只需改 `_build-deploy.yml` 一处，两个入口自动同步，不会两边写岔。
