/**
 * 生成式印象派封面系统（BLUEPRINT 附录 A 艺术层 1 ——「识别度的承重墙」）。
 * 流场笔触算法：以条目 id 为确定性种子，在一个平滑噪声方向场里撒下数百道短笔触，
 * 每道笔顺着局部流向走出微弯的弧（梵高式漩涡），颜色取自模块「房间色」及其明暗/邻近变体。
 * 同一条目永远同一幅画；零外部 API；构建时内联为 SVG。
 */

const ROOM_BASE: Record<string, string> = {
  projects: "#6e6a60",
  writing: "#7c8b6f",
  "music-wall": "#7e93a8",
  "my-music": "#6b7f95",
  knowledge: "#5c6e84",
  life: "#c08d7c",
  menu: "#c9a227",
  mystery: "#8c7156",
  social: "#8b7e94",
  about: "#c08d7c",
};
/** 邻近颜料（同一低饱和体系），作为辅调点缀 */
const NEIGHBORS: Record<string, string> = {
  projects: "#7c8b6f",
  writing: "#c9a227",
  "music-wall": "#7c8b6f",
  "my-music": "#7e93a8",
  knowledge: "#7e93a8",
  life: "#c9a227",
  menu: "#c08d7c",
  mystery: "#b08d57",
  social: "#7e93a8",
  about: "#8c7156",
};

/** mulberry32：小而稳定的种子 PRNG */
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

function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
/** 朝目标色插值（amt>0 提亮/趋白，<0 压暗/趋墨） */
function mix(hex: string, target: [number, number, number], amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (target[0] - r) * amt, g + (target[1] - g) * amt, b + (target[2] - b) * amt);
}
const WHITE: [number, number, number] = [243, 238, 229]; // 画布暖白
const INK: [number, number, number] = [28, 26, 23]; // 墨黑

/** 饱和度提升：把各通道推离灰度均值（仅用于封面笔触，不动全站房间色） */
function saturate(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  const avg = (r + g + b) / 3;
  return rgbToHex(avg + (r - avg) * amt, avg + (g - avg) * amt, avg + (b - avg) * amt);
}

/**
 * 生成印象派流场封面 SVG。
 * @param id 条目 id（确定性种子）
 * @param module 模块 id（决定颜料组）
 * @param w/h 画布逻辑尺寸（viewBox）
 */
export function coverSvg(id: string, module: string, w = 320, h = 220): string {
  const rand = prng(hashId(`${module}:${id}`));
  // 封面用更鲜亮一档的房间色（参考图气质），全站其余房间色取值不变
  const base = saturate(ROOM_BASE[module] ?? "#b08d57", 1.5);
  const neighbor = saturate(NEIGHBORS[module] ?? "#c9a227", 1.5);
  const fid = `c${(hashId(id) % 99999).toString(36)}`;

  // 笔触调色板：底色 / 提亮 / 压暗 / 高光 / 邻近 —— 加权出现（整体偏亮通透，参考图气质）
  const tintLight = mix(base, WHITE, 0.44);
  const tintLighter = mix(base, WHITE, 0.64);
  const tintDark = mix(base, INK, 0.22);
  const highlight = mix(base, WHITE, 0.84);
  const palette: { c: string; wgt: number }[] = [
    { c: base, wgt: 17 },
    { c: tintLight, wgt: 26 },
    { c: tintLighter, wgt: 21 },
    { c: tintDark, wgt: 11 },
    { c: highlight, wgt: 13 },
    { c: mix(neighbor, WHITE, 0.4), wgt: 12 },
  ];
  const totalWgt = palette.reduce((s, p) => s + p.wgt, 0);
  const pickColor = () => {
    let r = rand() * totalWgt;
    for (const p of palette) {
      if ((r -= p.wgt) <= 0) return p.c;
    }
    return base;
  };

  // 平滑方向场（漩涡）：几条正弦叠加，相位与频率随种子
  const ph1 = rand() * 6.283;
  const ph2 = rand() * 6.283;
  const ph3 = rand() * 6.283;
  const f1 = 2.2 + rand() * 2.6;
  const f2 = 2.0 + rand() * 2.4;
  const f3 = 3.0 + rand() * 3.0;
  const swirl = 0.6 + rand() * 0.5;
  const angleAt = (nx: number, ny: number) =>
    Math.PI * (Math.sin(nx * f1 + ph1) + Math.cos(ny * f2 + ph2) + swirl * Math.sin((nx + ny) * f3 + ph3));

  // 笔触数随面积缩放
  const n = Math.max(90, Math.min(220, Math.round((w * h) / 1500)));
  const minDim = Math.min(w, h);
  const strokes: string[] = [];
  for (let i = 0; i < n; i++) {
    let px = rand() * w;
    let py = rand() * h;
    const segs = 2 + (rand() < 0.5 ? 1 : 0);
    const step = minDim * (0.025 + rand() * 0.045);
    const jitter = (rand() - 0.5) * 0.5;
    const pts: string[] = [`${px.toFixed(1)} ${py.toFixed(1)}`];
    for (let k = 0; k < segs; k++) {
      const a = angleAt(px / w, py / h) + jitter;
      px += Math.cos(a) * step;
      py += Math.sin(a) * step;
      pts.push(`${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    const sw = (minDim * (0.012 + rand() * 0.02)).toFixed(1);
    const op = (0.5 + rand() * 0.42).toFixed(2);
    strokes.push(
      `<path d="M${pts.join(" L")}" stroke="${pickColor()}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${op}"/>`,
    );
  }

  // 底层：房间色柔和渐变（透出笔触间隙），顶层极淡画布颗粒
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${fid}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${mix(base, WHITE, 0.5)}"/><stop offset="100%" stop-color="${mix(base, WHITE, 0.22)}"/></linearGradient><filter id="${fid}n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.06"/></feComponentTransfer><feComposite operator="over" in2="SourceGraphic"/></filter></defs><rect width="${w}" height="${h}" fill="url(#${fid}g)"/><g>${strokes.join("")}</g><rect width="${w}" height="${h}" filter="url(#${fid}n)" opacity="0.5"/></svg>`;
}
