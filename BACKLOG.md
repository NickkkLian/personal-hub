# 功能后备清单（后续版本）

> 已决策搁置或排期未到的功能。恢复任何一项 = 告诉 Claude Code「做 BACKLOG 第 N 项」。

## 1. 专辑墙 Album Wall（2026-06-12 站长决定搁置）

- **状态**：模块代码占位已就绪、数据管线已通（`album-journal.public.json` 适配器已配置），仅 UI 完整版未做、模块开关关闭
- **恢复时要做的**：按 BLUEPRINT 5.2 + 附录 A 实现——插套唱片墙（封面探出封套、hover 滑出、发丝线网格、等宽标签）+ 全站唯一的透视挂画墙签名场景（首屏）+ 点击封面飞出放大（shared element transition）
- **连带**：Spotify 封面元数据补全（enrich: spotify-metadata 适配器）+ now-playing Pages Function（原 P3 范围）需站长 Spotify Developer 应用 + OAuth

## 2. My Music 原创音乐完整版（当前优先方向）

- **状态**：模块已开启（占位页），数据文件 `content/my-music.json` 已建
- **待做**：录音室桌面布局（黑胶/磁带作品卡）+ 内嵌播放器（试听）+ 播放时唱片旋转与音波可视化（Web Audio API）；试听音频文件存放方案（仓库内或 R2）
- **待站长**：填真实作品数据 + 提供试听音频文件（如有）

## 3. 其余模块完整版（数据管线全部已通，做 UI 即可逐个开启）

- Knowledge 星座图谱（夜场天幕、星点渐次点亮、移动端折叠列表）
- Life 地图（米色艺术瓦片、足迹时间线飞行、Leaflet 懒加载）
- Menu 菜单卡（静物画装裱、翻页动画、推荐印章）
- Mystery 档案柜（抽屉拉出、卷宗章）
- Channels 电视墙（开机闪烁、平台色描边）

## 4. 体验与工具

- admin.html 开关面板（PAT + contents API 模式，拨杆改 site.config.json）
- Pagefind 纯静态全文搜索（v2）
- AI 辅助翻译缓存（v1.5：新条目自动生成英文摘要，translations-cache.json 人工可改）
- 应用侧「发布公开」改进：发布成功后显示上次发布时间/条数徽标
- Database 仓库 images/ 重复大图清理（同一图存了 3 份，约省 3MB）
