/**
 * 印象派花艺拱廊生成器（背景纵深层 ③ 的主角）。
 * 手法：以「莫奈式柔渐变色块」层叠成花，但给出明确花型——雏菊（花瓣环+金花心）、玫瑰（同心暖块）、
 * 绣球（小花球）、紫藤（垂串）；统一左上光源（花瓣左上高光点、右下暗块＝影子），叶用旋转椭圆。
 * 沿拱骨架从下往上「一路生花」，底部最密最大；远/中/近三层景深（远层更糊更淡＝大气透视）。
 * 确定性种子 → 同一构图；构建时内联 SVG；动效交给 transform/opacity（见 Backdrop）。
 */

function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 拱骨架采样（viewBox 0 0 600 640）：左柱 → 顶冠半圆 → 右柱，返回点 + 朝拱内法线。
const AX = { lx: 172, rx: 428, base: 636, spring: 250, r: 128 };
const Lp = AX.base - AX.spring;
const crownLen = Math.PI * AX.r;
const total = Lp * 2 + crownLen;
function archPoint(s: number) {
  if (s < Lp) return { x: AX.lx, y: AX.base - s, nx: 1, ny: 0 };
  if (s < Lp + crownLen) {
    const u = (s - Lp) / crownLen;
    const ang = Math.PI * (1 - u);
    return { x: 300 + AX.r * Math.cos(ang), y: AX.spring - AX.r * Math.sin(ang), nx: -Math.cos(ang), ny: Math.sin(ang) };
  }
  const d = s - Lp - crownLen;
  return { x: AX.rx, y: AX.spring + d, nx: -1, ny: 0 };
}

// 莫奈花园调色（花＋叶＋高光＋金花心）
const G = {
  rose: ["#d59aa1", "#bd7a86"],
  blush: ["#e8c6ba", "#d6a08e"],
  lav: ["#b0a2cd", "#9080bb"],
  blue: ["#9bb7d3", "#7a96b9"],
  cream: ["#f7f0e3", "#efe3cd"],
  gold: ["#e6c483", "#cf9f52"],
  leaf1: ["#8ea27b", "#6b7f5c"],
  leaf2: ["#69795a", "#4e5f42"],
  leaf3: ["#abb998", "#8b9c74"],
} as const;
type GKey = keyof typeof G;

function grads(): string {
  const stop = (id: string, [a, b]: readonly string[]) =>
    `<radialGradient id="fa-${id}" cx="40%" cy="36%" r="60%">` +
    `<stop offset="0%" stop-color="${b}" stop-opacity="1"/>` +
    `<stop offset="46%" stop-color="${a}" stop-opacity="0.82"/>` +
    `<stop offset="82%" stop-color="${a}" stop-opacity="0.28"/>` +
    `<stop offset="100%" stop-color="${a}" stop-opacity="0"/></radialGradient>`;
  return (Object.keys(G) as GKey[]).map((k) => stop(k, G[k])).join("");
}

const c = (x: number, y: number, r: number, id: string, op = 1) =>
  `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="url(#fa-${id})" opacity="${op.toFixed(2)}"/>`;
// 旋转椭圆（叶片）
const leafShape = (x: number, y: number, rx: number, ry: number, rot: number, id: string, op: number) =>
  `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="url(#fa-${id})" opacity="${op.toFixed(2)}" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;

const FLOWER_COLORS: GKey[] = ["rose", "blush", "lav", "blue", "cream", "rose", "lav"];
const LEAF: GKey[] = ["leaf1", "leaf2", "leaf3", "leaf1", "leaf2"];

/** 高光点（左上）+ 影子块（右下），做立体 */
function litShadow(rand: () => number, x: number, y: number, R: number, out: string[]): void {
  out.unshift(c(x + R * 0.34, y + R * 0.4, R * 1.02, "leaf2", 0.26)); // 影子先入（在花后）
  out.push(c(x - R * 0.32, y - R * 0.36, R * 0.36, "cream", 0.9)); // 高光
  out.push(c(x - R * 0.26, y - R * 0.3, R * 0.15, "cream", 1)); // 高光芯
}

function daisy(rand: () => number, x: number, y: number, R: number, col: GKey, out: string[]): void {
  const n = 6 + ((rand() * 3) | 0);
  const a0 = rand() * 6.283;
  for (let i = 0; i < n; i++) {
    const a = a0 + (i / n) * 6.283;
    out.push(c(x + Math.cos(a) * R * 0.72, y + Math.sin(a) * R * 0.72, R * 0.42, col, 0.9)); // 花瓣环
  }
  out.push(c(x, y, R * 0.5, col, 0.7)); // 花芯垫
  out.push(c(x, y, R * 0.3, "gold", 0.95)); // 金花心
  out.push(c(x - R * 0.08, y - R * 0.08, R * 0.16, "gold", 1));
  litShadow(rand, x, y, R, out);
}
function rose(rand: () => number, x: number, y: number, R: number, col: GKey, out: string[]): void {
  out.push(c(x, y, R, col, 0.85)); // 外层
  for (let i = 0; i < 4; i++) {
    const a = rand() * 6.283;
    out.push(c(x + Math.cos(a) * R * 0.34, y + Math.sin(a) * R * 0.34, R * (0.44 + rand() * 0.22), col, 0.72)); // 同心花瓣
  }
  out.push(c(x, y, R * 0.32, col, 0.95)); // 卷心
  litShadow(rand, x, y, R, out);
}
function hydrangea(rand: () => number, x: number, y: number, R: number, col: GKey, out: string[]): void {
  const n = 9 + ((rand() * 5) | 0);
  for (let i = 0; i < n; i++) {
    const a = rand() * 6.283;
    const d = rand() * R * 0.85;
    out.push(c(x + Math.cos(a) * d, y + Math.sin(a) * d, R * (0.28 + rand() * 0.14), col, 0.72)); // 小花球
  }
  litShadow(rand, x, y, R, out);
}
function wisteria(rand: () => number, x: number, y: number, R: number, col: GKey, out: string[]): void {
  const n = 6 + ((rand() * 4) | 0);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    out.push(c(x + (rand() - 0.5) * R * 0.5, y + t * R * 2.2, R * (0.4 - t * 0.24), col, 0.8 - t * 0.4)); // 向下渐小垂串
  }
  out.push(c(x - R * 0.28, y - R * 0.3, R * 0.28, "cream", 0.8));
}
function leaves(rand: () => number, x: number, y: number, R: number, out: string[]): void {
  const n = 2 + ((rand() * 3) | 0);
  for (let i = 0; i < n; i++) {
    const a = rand() * 6.283;
    const d = rand() * R * 0.8;
    const lk = LEAF[(rand() * LEAF.length) | 0];
    out.push(leafShape(x + Math.cos(a) * d, y + Math.sin(a) * d, R * (0.85 + rand() * 0.5), R * (0.34 + rand() * 0.2), (rand() * 180 - 90), lk, 0.62 + rand() * 0.28));
  }
}

export interface FloralArch {
  defs: string;
  back: string;
  mid: string;
  front: string;
  count: number;
}

export function floralArch(seed = 20260721): FloralArch {
  const rand = prng(seed);
  const back: { y: number; s: string }[] = [];
  const mid: { y: number; s: string }[] = [];
  const front: { y: number; s: string }[] = [];

  for (let s = 4; s < total; s += 13 + rand() * 9) {
    const p = archPoint(s);
    const heightF = Math.min(1, (AX.base - p.y) / (AX.base - 70)); // 0 底 → 1 顶
    const dense = 1 - heightF * 0.4;
    const clumps = 1 + (rand() < dense ? 1 : 0) + (rand() < dense * 0.5 ? 1 : 0);

    for (let k = 0; k < clumps; k++) {
      const off = (rand() - 0.42) * 40; // 主要朝拱内铺开
      const x = p.x + p.nx * off + (rand() - 0.5) * 16;
      const y = p.y + p.ny * off + (rand() - 0.5) * 16;
      const base = 5.2 + rand() * 5.5;
      const hero = rand() < 0.12 ? 1.7 : 1; // 少数放大的主花
      const R = base * hero * (0.78 + dense * 0.5);

      const buf: string[] = [];
      const roll = rand();
      const col = FLOWER_COLORS[(rand() * FLOWER_COLORS.length) | 0];
      if (roll < 0.16) leaves(rand, x, y, R * 1.25, buf);
      else if (roll < 0.42) daisy(rand, x, y, R, col, buf);
      else if (roll < 0.62) rose(rand, x, y, R, col === "blue" ? "rose" : col, buf);
      else if (roll < 0.8) hydrangea(rand, x, y, R * 1.15, col, buf);
      else if (heightF > 0.45 && p.ny > 0.2) wisteria(rand, x, y, R * 0.9, "lav", buf); // 垂串多在拱顶
      else daisy(rand, x, y, R, col, buf);
      if (rand() < 0.6) leaves(rand, x + (rand() - 0.5) * 26, y + 5 + rand() * 8, R * 1.1, buf); // 底叶衬托

      const rec = { y, s: buf.join("") };
      // 分层：近层给底部大花与 hero；越高越入远层
      const layerRoll = rand() + heightF * 0.5 - (hero > 1 ? 0.5 : 0);
      if (layerRoll < 0.62) back.push(rec);
      else if (layerRoll < 1.15) mid.push(rec);
      else front.push(rec);
    }
  }

  const paint = (arr: { y: number; s: string }[]) => arr.sort((a, b) => a.y - b.y).map((r) => r.s).join("");
  return {
    defs: grads(),
    back: paint(back),
    mid: paint(mid),
    front: paint(front),
    count: back.length + mid.length + front.length,
  };
}
