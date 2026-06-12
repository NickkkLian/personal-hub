/**
 * local-json 适配器：读取本仓库自建数据（my-music.json / channels.json）。
 * 条目必须显式 public: true 才会进站（与全站隐私规则一致）。
 */
import { readFile } from "node:fs/promises";

export async function fetchSource(source) {
  const raw = await readFile(new URL(`../../${source.file}`, import.meta.url), "utf8");
  const data = JSON.parse(raw);
  const items = Array.isArray(data) ? data : (data.items ?? []);
  return items;
}
