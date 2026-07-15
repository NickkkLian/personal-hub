# 功能后备清单（后续版本）

> 已决策搁置或排期未到的功能。恢复任何一项 = 告诉 Claude Code「做 BACKLOG 第 N 项」。

## 1. 专辑墙 Album Wall（2026-06-12 站长决定搁置）

- **状态**：模块代码占位已就绪、数据管线已通（`album-journal.public.json` 适配器已配置），仅 UI 完整版未做、模块开关关闭
- **恢复时要做的**：按 BLUEPRINT 5.2 + 附录 A 实现——插套唱片墙（封面探出封套、hover 滑出、发丝线网格、等宽标签）+ 全站唯一的透视挂画墙签名场景（首屏）+ 点击封面飞出放大（shared element transition）
- **连带**：Spotify 封面元数据补全（enrich: spotify-metadata 适配器）+ now-playing Pages Function（原 P3 范围）需站长 Spotify Developer 应用 + OAuth

## 2. My Music 原创音乐完整版（当前优先方向）

- **状态（2026-07-14 核实更新）**：✅ **早已不是占位页** —— 录音室已做完并上线（`src/modules/my-music/Page.astro` 396 行，黑胶/vinyl 布局齐全），线上 https://personal-hub-7uc.pages.dev/music 正常展出；`content/my-music.json` 里是 **4 首真实作品**（繁花 / 当灯光熄灭时 / 夏日重现 / 泡沫天使，各带网易云链接）。
- **仅剩**：4 首都没有 `audio` 字段 → 页内**试听**无源可放，目前只能跳转网易云外链。要开试听得先定音频文件存放方案（仓库内或 R2）+ 站长提供文件。
- ⚠️ 本条目原写「占位页 / 待做播放器 / 待站长填作品数据」，与 CLAUDE.md 的「P3 已完成」互相打架，已按线上实际改正。

## 3. 其余模块完整版（数据管线全部已通，做 UI 即可逐个开启）

- Knowledge 星座图谱（夜场天幕、星点渐次点亮、移动端折叠列表）
- Life 地图（米色艺术瓦片、足迹时间线飞行、Leaflet 懒加载）
- Menu 菜单卡（静物画装裱、翻页动画、推荐印章）
- Mystery 档案柜（抽屉拉出、卷宗章）
- Channels 电视墙（开机闪烁、平台色描边）

## 4. 古典馆藏层（方案 B+ 艺术层 8，2026-06-12 排期至此）

- **状态**：方案 B+ 唯一未实现的艺术系统；其余空间效果（七层视差/景深/镜头转场/沉浸时刻/hover 射灯/批注层）已在本版补齐
- **待做**：同步脚本一次性下载 CC0 博物馆素材（The Met Open Access / Rijksmuseum / Art Institute / NGA），duotone 处理为房间色单色，叠 ≤5% 龟裂纹；按剂量铁律固定放 4 处——① Home hero 右下角被取景框裁切的石膏像（前景视差层）② About 时间线旁小型胸像 ③ Writing 书架顶层镇架小雕塑 ④ Knowledge 夜场厅入口石膏像剪影；页脚印章区可加一条古典画裁切纹理带
- **铁律**：同屏至多 1 件、永远配角置于角落/边缘、仅随滚动轻微前景视差、禁戏剧化动画与霓虹

## 5. 体验与工具

- admin.html 开关面板（PAT + contents API 模式，拨杆改 site.config.json）
- Pagefind 纯静态全文搜索（v2）
- AI 辅助翻译缓存（v1.5：新条目自动生成英文摘要，translations-cache.json 人工可改）
- 应用侧「发布公开」改进：发布成功后显示上次发布时间/条数徽标
- Database 仓库 images/ 重复大图清理（同一图存了 3 份，约省 3MB）
