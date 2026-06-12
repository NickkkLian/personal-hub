---
name: hub-data
description: Personal Hub 数据层规范——源仓库清单、visibility 隐私过滤、规范化 schema、双语字段与适配器契约。Use when writing or modifying the sync script, adapters, schemas, or mock data.
---

# hub-data — 数据层规范

## 数据源清单（BLUEPRINT 1.3/4.1）

| module                            | 源                                      | adapter                                    | 备注                                            |
| --------------------------------- | --------------------------------------- | ------------------------------------------ | ----------------------------------------------- |
| projects                          | GitHub REST `/users/NickkkLian/repos`   | `github-api`                               | featured 清单 + 双语简介覆盖在本仓库 local-json |
| writing                           | Creation-Ideas + Mind-Archive 数据 JSON | `github-json`                              | Creation-Ideas 已有 `public` 字段               |
| music-wall                        | Album-Journal 数据 JSON                 | `github-json` + `enrich: spotify-metadata` |                                                 |
| my-music / social                 | 本仓库自建 JSON                         | `local-json`                               |                                                 |
| knowledge / life / menu / mystery | 各对应数据 JSON                         | `github-json`                              |                                                 |
| ~~Investment-Info / Job-Tracker~~ | —                                       | —                                          | **永不进入同步清单**                            |

**双仓库权限隔离架构（2026-06-12 定稿）**：

- **私有仓库 `NickkkLian/Database`**：各应用全量数据（`albums.json` `thoughts.json` `writing.json` `knowledge.json` `life.json` `menu.json` `mystery.json` `business.json` `develop.json` + `investment/` `data/`(job-tracker) 等）。**网站对它零权限、永不读取**
- **公开仓库 `NickkkLian/Database-Public`**（public）：只存各应用「发布公开」产出的 `*.public.json`。**网站只从这里读**（公开仓库，raw URL 即可，无需任何令牌；`GH_READONLY_PAT` 仅作 API 限额备用）
- 发布流：应用内勾选「公开」（统一 `public` 布尔字段）→ 点「🌐 发布公开」→ 当前勾选状态**快照覆盖**写入 Database-Public（取消勾选后再发布即移除）；无令牌/失败回退本地下载
- 公开文件清单：`writing.public.json` · `thoughts.public.json` · `album-journal.public.json` · `mystery-tricks.public.json` · `knowledge.public.json` · `life.public.json` · `menu.public.json` · `develop.public.json` · `business.public.json`(名可配置)。**例外：Investment-Info 发布到私有库 `investment/invest.public.json`（投资数据不进公开仓库，网站永不读取）**
- 公开导出 payload 统一结构：`{dbId, title, generatedAt, sections:[{type, label, items:[{id,name,summary,category,content,tags,updatedAt,…模块专属字段(如 life 的 lat/lng)}]}]}`
- Job-Tracker 刻意不加导出功能（数据过敏感，杜绝误发布）
- 应用侧写入 Database-Public 依赖站长在各应用设置里配置的 PAT 能访问该仓库（classic 全仓库 PAT 天然可用；fine-grained 需把 Database-Public 加入授权清单）

无 PAT / 文件缺失时用 mock（`scripts/mock/*.json`），与真实字段结构一致。

## 已验证的真实源字段（探查于 2026-06）

- Album-Journal：`id/name/artist/releaseYear/genre/tier/tracks/shelved/shelvedNote/link`
- Creation-Ideas：`id/title/content/tags/image/files/public/created_at/updated_at`
- Mind-Archive：`id/title/content/category/notes/images/attachments/url/linkTitle`

## 隐私铁律（强制，BLUEPRINT 4.2）

1. 只放行满足任一条件的条目：`visibility === "public"` / `public === true` / 来自 `*.public.json`
2. 规范化输出**剥离** schema 白名单之外的所有字段（防私密字段泄露）
3. token/PAT 只存 GitHub Actions Secrets / Cloudflare 环境变量；前端代码与仓库中绝不出现
4. 校验失败的条目跳过并在日志告警，不弄垮整次构建；构建失败保留上次成功数据

## 规范化 Schema（所有模块统一，BLUEPRINT 4.3）

```jsonc
{
  "id": "string",
  "module": "writing",
  "title": { "en": "…", "zh": "…" }, // 单语数据自动落入对应键，另一键为 null
  "summary": { "en": "…", "zh": "…" },
  "date": "2026-05-01",
  "tags": ["…"],
  "cover": "url | null",
  "links": [{ "label": "…", "url": "…" }],
  "extra": {}, // 模块专属字段（专辑 artist/year、地点坐标等）
}
```

- 双语字段一律 `{en, zh}`；前端经 `src/i18n` 的 `pickLang()` 回退并标注原文语言
- 展品编号（NO. 047）由规范化脚本全站连续分配，跨模块累加，写入 `extra.no`

## 适配器契约（BLUEPRINT 4.5）

- 注册表 `sources.config.json` 一行一个源：`{ module, adapter, ...adapterOpts, enrich? }`
- 每个 adapter 是 `scripts/adapters/` 下独立文件，签名 `async (sourceConfig, ctx) => NormalizedEntry[]`
- v1 实现：`github-json`、`github-api`、`spotify`、`local-json`；`notion/airtable/feishu-bitable` 预留
- mock↔真实切换：环境变量 `HUB_DATA_MODE=mock|live`（无凭据时自动落回 mock 并告警）
- 封面图在同步阶段缓存到 `public/covers/`（构建产物，git 忽略），避免热链失效
