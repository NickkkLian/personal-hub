---
name: hub-design
description: Personal Hub 设计系统（方案 B+ Galerie Vivante 空间版）——设计令牌、房间色、装裱与光影规格、动效约束、各模块布局隐喻。Use when building or styling any UI component, page, or animation.
---

# hub-design — 方案 B+ Galerie Vivante（已定稿）

气质：北欧美术馆基底 × 印象派油画质感 × 物件级立体感 × 当代策展锋芒。
访客是在"走进"一座当代画廊。完整规格见 BLUEPRINT.md 附录 A 方案 B+，本文是执行浓缩版。

## 令牌（唯一来源 `src/styles/tokens.css`）

- 基底：画布暖白 `#F3EEE5` / 墨黑 `#1C1A17`；深色 = 深暖炭 `#171513`（夜场画廊，颜料提亮一档）
- 颜料组（低饱和）：鼠尾草 `#7C8B6F` · 雾蓝 `#7E93A8` · 赭黄 `#C9A227` · 干玫瑰 `#C08D7C`；黄铜 `#B08D57` 是**全站唯一金属**
- 房间色：projects=石墨 writing=鼠尾草 music-wall=雾蓝 my-music=深雾蓝 knowledge=夜蓝 life=干玫瑰 menu=赭黄 mystery=焦赭 social=紫灰 about=黄铜；组件内用 `var(--room)`（由页面注入）
- Tailwind 语义类映射在 `global.css` 的 `@theme inline`（bg-bg / text-text / border-hair…）

## 硬规则

- **统一左上定向光**：所有投影落右下（用 `--shadow-exhibit/--shadow-lift`，禁止自造阴影值）
- **装裱**：默认无框画布（0.5px 极淡描边 + 柔影）；发丝浮框（1px 墨框 + 10px 留缝）仅 featured；**≥2px 深色粗边框全站禁用**
- **出血开放边界**：幽灵字/色雾/巨型标题允许越出视口；禁止角部裁切标记等边界框元素
- **字体**：Fraunces（标题/题注斜体）· Inter（正文）· Space Mono（编号/批注/元数据）· 思源宋/Noto Sans SC（中文）；**禁手写体**
- **动效**：入场 ≤600ms；统一 `--ease-gallery`；时长只用 `--dur-micro/move/enter`；全部尊重 `prefers-reduced-motion`（退化为静态构图）；移动端减量（微尘隐藏）
- **禁止**：紫色渐变模板脸、通用 SaaS 卡片、AI 味插画、霓虹撞色、戏剧化古典动画
- 古典馆藏元素全站固定 4 处（Home hero / About 时间线 / Writing 书架顶 / Knowledge 入口），同屏至多 1 件，必须 duotone 至房间色、置于边缘可被裁切

## 标志性细节

- 凸版展品标签：`NO. 047 · MUSIC`（Space Mono、压印字距，组件 `ExhibitLabel`）；编号全站连续
- 黄铜铭牌 `BrassPlaque`；发丝线 `.hairline`；等宽元数据 `.meta-mono`
- 每模块开篇 = 超大错位 Fraunces 标题（YSL 式），中文用思源宋超大字重
- 透视挂画墙签名场景**全站仅一处**：专辑墙首屏
- 每模块恰一处全幅沉浸时刻，内容装在大圆角取景框（`--radius-viewport`）

## 模块布局隐喻（BLUEPRINT 5.2 + 附录 A 适配）

| 模块       | 隐喻                                               | 关键动效                        |
| ---------- | -------------------------------------------------- | ------------------------------- |
| Home       | 全屏 Hero + 门厅入口卡                             | 逐词浮现；卡片 hover 预览微动效 |
| Projects   | 实验档案网格（黑白基调+模块色点缀+等宽注释）       | 3D tilt + 流光；筛选 FLIP 重排  |
| Writing    | 有进深的木质书架，书脊可抽出                       | 书脊 3D 翻转；NEW 书腰          |
| Album Wall | 插套唱片墙（封面探出、hover 滑出）+ 透视挂画墙首屏 | shared element 放大；黑胶滑出   |
| My Music   | 录音室桌面、黑胶/磁带卡                            | 唱片旋转 + 音波可视化           |
| Knowledge  | 夜场星座图谱                                       | 星点渐次点亮；移动端降级列表    |
| Life       | 米色艺术地图瓦片 + 颜料足迹点                      | 足迹时间线飞行                  |
| Menu       | 静物画展厅，菜品如小幅油画                         | 翻菜单页；推荐印章盖落          |
| Mystery    | 档案柜抽屉 + 卷宗章                                | 抽屉拉出、卷宗展开              |
| Channels   | 电视墙频道网格                                     | 开机闪烁；平台色描边            |
| About      | 极简编辑页 + 时间线                                | 时间线逐点亮起                  |

## 验收线

任何一屏截图都应"像一帧当代画廊纪录片的画面"——有物、有光、有秩序，每屏至少一幅"画"。
Lighthouse 移动端 Perf ≥ 90 / A11y ≥ 95 / SEO = 100；首页 JS ≤ 120KB gzip。
