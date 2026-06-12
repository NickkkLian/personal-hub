/**
 * github-api 适配器：拉取 GitHub 公开仓库列表（projects 模块）。
 * 公开 API 无需令牌；如设置 GH_READONLY_PAT 则带上以提高限额。
 * 支持本仓库 overrides 文件：featured 置顶清单 / hide 隐藏清单 / 双语简介覆盖。
 */
import { readFile } from "node:fs/promises";

export async function fetchSource(source, ctx) {
  const headers = { "User-Agent": "personal-hub-sync", Accept: "application/vnd.github+json" };
  const token = process.env.GH_READONLY_PAT;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`https://api.github.com/users/${source.user}/repos?per_page=100&sort=pushed`, {
    headers,
  });
  if (!res.ok) throw new Error(`GitHub API HTTP ${res.status}`);
  const repos = await res.json();

  let overrides = { featured: [], hide: [], descriptions: {} };
  if (source.overrides) {
    try {
      overrides = {
        ...overrides,
        ...JSON.parse(await readFile(new URL(`../../${source.overrides}`, import.meta.url), "utf8")),
      };
    } catch {
      ctx.warn(`projects overrides 文件缺失或无效（${source.overrides}），使用默认`);
    }
  }

  return repos
    .filter((r) => !r.fork && !r.archived && !overrides.hide.includes(r.name))
    .map((r) => ({
      id: `gh-${r.name}`,
      title: r.name,
      summary: overrides.descriptions[r.name] ?? r.description ?? null,
      date: (r.pushed_at ?? "").slice(0, 10),
      tags: r.topics ?? [],
      cover: null,
      links: [
        { label: "GitHub", url: r.html_url },
        ...(r.homepage ? [{ label: "Live", url: r.homepage }] : []),
      ],
      // 仓库列表天然公开
      public: true,
      extra: {
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        topics: r.topics ?? [],
        featured: overrides.featured.includes(r.name),
      },
    }));
}
