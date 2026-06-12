/**
 * 生成式印象派封面系统（BLUEPRINT 附录 A 艺术层 1 ——「识别度的承重墙」）。
 * 构建时为无真实封面的条目生成一幅确定性的印象派色场画：
 * 以条目 id 为随机种子（同一条目永远同一幅画），模块房间色为主调、邻近颜料为辅。
 * 输出内联 SVG 字符串（SSG 阶段内联进 HTML，零运行时成本、零外部请求）。
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
  about: "#b08d57",
};
/** 邻近颜料（同一低饱和体系），按色相亲缘排在各房间色后 */
const NEIGHBORS: Record<string, string[]> = {
  projects: ["#7c8b6f", "#b08d57", "#8c7156"],
  writing: ["#c9a227", "#7e93a8", "#b08d57"],
  "music-wall": ["#5c6e84", "#7c8b6f", "#8b7e94"],
  "my-music": ["#7e93a8", "#8b7e94", "#5c6e84"],
  knowledge: ["#7e93a8", "#8b7e94", "#6b7f95"],
  life: ["#c9a227", "#8c7156", "#b08d57"],
  menu: ["#c08d7c", "#b08d57", "#7c8b6f"],
  mystery: ["#b08d57", "#6e6a60", "#c08d7c"],
  social: ["#7e93a8", "#c08d7c", "#5c6e84"],
  about: ["#c9a227", "#8c7156", "#7c8b6f"],
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

/**
 * 生成印象派色场封面 SVG。
 * @param id 条目 id（确定性种子）
 * @param module 模块 id（决定颜料组）
 * @param w/h 画布逻辑尺寸（viewBox）
 */
export function coverSvg(id: string, module: string, w = 320, h = 220): string {
  const rand = prng(hashId(`${module}:${id}`));
  const base = ROOM_BASE[module] ?? "#b08d57";
  const palette = [base, base, ...(NEIGHBORS[module] ?? [])];
  const fid = `g${(hashId(id) % 99999).toString(36)}`;

  // 3–5 团重度虚化的颜料色场 + 6–9 笔短触
  const blobs: string[] = [];
  const nBlobs = 3 + Math.floor(rand() * 3);
  for (let i = 0; i < nBlobs; i++) {
    const c = palette[Math.floor(rand() * palette.length)];
    const cx = w * (0.15 + rand() * 0.7);
    const cy = h * (0.15 + rand() * 0.7);
    const rx = w * (0.18 + rand() * 0.3);
    const ry = h * (0.2 + rand() * 0.35);
    const rot = Math.floor(rand() * 180);
    const op = 0.35 + rand() * 0.4;
    blobs.push(
      `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${c}" opacity="${op.toFixed(2)}" transform="rotate(${rot} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`,
    );
  }
  const strokes: string[] = [];
  const nStrokes = 6 + Math.floor(rand() * 4);
  for (let i = 0; i < nStrokes; i++) {
    const c = palette[Math.floor(rand() * palette.length)];
    const x = w * rand();
    const y = h * rand();
    const len = w * (0.08 + rand() * 0.16);
    const ang = rand() * 180;
    const sw = 3 + rand() * 7;
    strokes.push(
      `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + len).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${c}" stroke-width="${sw.toFixed(1)}" stroke-linecap="round" opacity="${(0.25 + rand() * 0.35).toFixed(2)}" transform="rotate(${ang.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`,
    );
  }

  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice"><defs><filter id="${fid}b"><feGaussianBlur stdDeviation="${(w / 16).toFixed(0)}"/></filter><filter id="${fid}s"><feGaussianBlur stdDeviation="1.2"/></filter><filter id="${fid}n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.07"/></feComponentTransfer><feComposite operator="over" in2="SourceGraphic"/></filter></defs><rect width="${w}" height="${h}" fill="var(--surface-2, #ece5d8)"/><g filter="url(#${fid}b)">${blobs.join("")}</g><g filter="url(#${fid}s)">${strokes.join("")}</g><rect width="${w}" height="${h}" filter="url(#${fid}n)" opacity="0.5"/></svg>`;
}
