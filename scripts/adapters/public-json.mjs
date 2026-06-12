/**
 * public-json 适配器：从公开仓库 Database-Public 读取应用导出的 *.public.json。
 * 公开仓库 → raw URL 直读，无需任何令牌（网站管线对私有数据零权限的关键）。
 * 文件不存在（站长还没发布）→ 返回 null，由 sync 落回 mock 并告警。
 */
import { flattenPublicPayload } from "../lib/normalize.mjs";

export async function fetchSource(source, ctx) {
  const url = `https://raw.githubusercontent.com/${ctx.publicRepo}/main/${source.file}`;
  const res = await fetch(url, { headers: { "User-Agent": "personal-hub-sync" } });
  if (res.status === 404) return null; // 尚未发布
  if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
  const payload = await res.json();
  return flattenPublicPayload(payload, source.module);
}
