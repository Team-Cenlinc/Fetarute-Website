/** 概念地图中的逻辑坐标；不表示游戏坐标或真实地理位置。 */
export type CommunityMapPoint = readonly [number, number];

/** 地块轮廓和内部标注点；凹形包围盒中心可能在公园内，因此标注单独计算。 */
export interface CommunityMapLot {
  points: readonly CommunityMapPoint[];
  label: CommunityMapPoint;
  labelWidth: number;
}

/** 地形和热区共享几何，河口坐标固定以便上下区域拼成连续地图。 */
export interface CommunityMapTemplate {
  width: number;
  height: number;
  lots: readonly CommunityMapLot[];
  park: readonly CommunityMapPoint[];
  plaza: readonly CommunityMapPoint[];
  river: readonly CommunityMapPoint[];
}

/** 可复现随机源仅用于概念地图，不用于身份、权限或安全凭据。 */
export function createCommunityRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

/** 求轮廓边界，用于选择可继续细分的街块，不直接作为交互区域。 */
function boundsOf(points: readonly CommunityMapPoint[]) {
  return {
    left: Math.min(...points.map(([x]) => x)),
    right: Math.max(...points.map(([x]) => x)),
    top: Math.min(...points.map(([, y]) => y)),
    bottom: Math.max(...points.map(([, y]) => y)),
  };
}

/** 半平面裁切保留原河岸斜边，在新街道两侧留出真实空隙。 */
function clipPolygon(
  points: readonly CommunityMapPoint[],
  axis: 0 | 1,
  limit: number,
  less: boolean,
): CommunityMapPoint[] {
  const result: CommunityMapPoint[] = [];
  for (let i = 0; i < points.length; i++) {
    const from = points[i],
      to = points[(i + 1) % points.length];
    const fromInside = less ? from[axis] <= limit : from[axis] >= limit;
    const toInside = less ? to[axis] <= limit : to[axis] >= limit;
    if (fromInside) result.push(from);
    if (fromInside !== toInside) {
      const t = (limit - from[axis]) / (to[axis] - from[axis]);
      result.push([from[0] + t * (to[0] - from[0]), from[1] + t * (to[1] - from[1])]);
    }
  }
  return result;
}

/** 当前河岸/L 形地块的每条水平截面都是一个连续区间；端点也参与计算以保留斜边约束。 */
function horizontalSpan(points: readonly CommunityMapPoint[], y: number) {
  const crossings: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    if (y < Math.min(a[1], b[1]) || y > Math.max(a[1], b[1])) continue;
    if (a[1] === b[1]) crossings.push(a[0], b[0]);
    else crossings.push(a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]));
  }
  return { left: Math.min(...crossings), right: Math.max(...crossings) };
}

/** 为整个头像/姓名盒求内接矩形；检查完整高度内的所有转折，不能只检查中心所在的一条线。 */
function labelFor(
  points: readonly CommunityMapPoint[],
  minimumHeight: number,
): Pick<CommunityMapLot, "label" | "labelWidth"> | undefined {
  const bounds = boundsOf(points);
  if (bounds.bottom - bounds.top < minimumHeight) return undefined;
  const center = (bounds.top + bounds.bottom) / 2;
  const tops = new Set([
    center - minimumHeight / 2,
    bounds.top,
    bounds.bottom - minimumHeight,
    ...points.flatMap(([, y]) => [y, y - minimumHeight]),
  ]);
  let best: Pick<CommunityMapLot, "label" | "labelWidth"> | undefined;
  for (const top of tops) {
    const bottom = top + minimumHeight;
    if (top < bounds.top || bottom > bounds.bottom) continue;
    /* 凹口顶点的上下两侧都检查；只取顶点本身会漏掉水平台阶上方的窄区间。 */
    const samples = [
      top,
      bottom,
      ...points.flatMap(([, y]) => [y - 0.000001, y, y + 0.000001]),
    ].filter((y) => y >= top && y <= bottom);
    const spans = samples.map((y) => horizontalSpan(points, y));
    const left = Math.max(...spans.map((span) => span.left));
    const right = Math.min(...spans.map((span) => span.right));
    const labelWidth = (right - left) * 0.84;
    const y = top + minimumHeight / 2;
    if (
      !best ||
      labelWidth > best.labelWidth + 0.000001 ||
      (Math.abs(labelWidth - best.labelWidth) < 0.000001 &&
        Math.abs(y - center) < Math.abs(best.label[1] - center))
    ) {
      best = { label: [(left + right) / 2, y], labelWidth };
    }
  }
  return best;
}

/**
 * 从河岸围合的整片土地开始，以随机方向、比例递归划街道，而不是移动固定格子。
 * 随机选择可分割街块，允许保留大片土地并继续细分邻地，避免最大面积优先导致平均分栏。
 */
function generateMap(seed: number, mobile: boolean): CommunityMapTemplate | undefined {
  const random = createCommunityRandom(seed);
  const width = mobile ? 600 : 1200;
  const height = mobile ? 1080 : 780;
  const gap = mobile ? 18 : 24;
  /* 320px 手机地图宽 236px，56px 标注需约143逻辑单位；768px桌面需约120。额外留出字形/舍入余量。 */
  const minimumLabelHeight = mobile ? 156 : 128;
  const minimumLabelWidth = mobile ? 110 : 130;
  const bends = 3 + Math.floor(random() * 3);
  const bank: CommunityMapPoint[] = [[width * 0.9, 0]];
  for (let i = 1; i < bends; i++)
    bank.push([width * (0.7 + random() * 0.18), height * (i / bends + (random() - 0.5) * 0.08)]);
  bank.push([width * 0.9, height]);
  const land = clipPolygon(
    clipPolygon(
      [[0, 0], ...bank.map(([x, y]): CommunityMapPoint => [x - gap, y]), [0, height]],
      1,
      gap,
      false,
    ),
    1,
    height - gap,
    true,
  );
  const parcels: CommunityMapPoint[][] = [land];
  while (parcels.length < 8) {
    const candidates = parcels
      .map((points, index) => {
        const b = boundsOf(points);
        return {
          points,
          index,
          b,
          score: Math.sqrt((b.right - b.left) * (b.bottom - b.top)) * (0.15 + random() * 1.7),
        };
      })
      .sort((a, b) => b.score - a.score);
    let divided = false;
    for (const candidate of candidates) {
      const { points, index, b } = candidate;
      const w = b.right - b.left,
        h = b.bottom - b.top;
      const preferred: 0 | 1 = w / h > (mobile ? 0.85 : 1.3) * (0.5 + random() * 1.2) ? 0 : 1;
      for (const axis of [preferred, 1 - preferred] as (0 | 1)[]) {
        const min = axis === 0 ? (mobile ? 140 : 170) : mobile ? 165 : 140;
        const low = (axis === 0 ? b.left : b.top) + min + gap / 2;
        const high = (axis === 0 ? b.right : b.bottom) - min - gap / 2;
        if (low > high) continue;
        const cut = low + (high - low) * (0.08 + random() * 0.84);
        const first = clipPolygon(points, axis, cut - gap / 2, true);
        const second = clipPolygon(points, axis, cut + gap / 2, false);
        if (
          [first, second].some(
            (part) =>
              part.length < 3 ||
              (labelFor(part, minimumLabelHeight)?.labelWidth ?? 0) < minimumLabelWidth,
          )
        )
          continue;
        parcels.splice(index, 1, first, second);
        divided = true;
        break;
      }
      if (divided) break;
    }
    if (!divided) return undefined;
  }
  const lots = parcels.map((points): CommunityMapLot => ({
    points,
    ...labelFor(points, minimumLabelHeight)!,
  }));
  const rectangular = lots
    .map((lot, index) => ({ lot, index, rank: random() }))
    .filter(({ lot }) =>
      lot.points.every(([x, y], i) => {
        const next = lot.points[(i + 1) % lot.points.length];
        return x === next[0] || y === next[1];
      }),
    )
    .sort((a, b) => a.rank - b.rank);
  const landscapes: CommunityMapPoint[][] = [];
  for (const { lot, index } of rectangular) {
    if (landscapes.length === 2) break;
    const b = boundsOf(lot.points);
    const cutX = b.right - (b.right - b.left) * (0.28 + random() * 0.12);
    const cutY = b.top + (b.bottom - b.top) * 0.28;
    const points: CommunityMapPoint[] = [
      [b.left, b.top],
      [cutX, b.top],
      [cutX, cutY],
      [b.right, cutY],
      [b.right, b.bottom],
      [b.left, b.bottom],
    ];
    const label = labelFor(points, minimumLabelHeight);
    /* 小地块切出公园后可能无法容纳标注；保留原轮廓，改从另一块合适土地围合。 */
    if (!label || label.labelWidth < minimumLabelWidth) continue;
    lots[index] = { points, ...label };
    landscapes.push([
      [cutX + gap / 2, b.top],
      [b.right, b.top],
      [b.right, cutY - gap / 2],
      [cutX + gap / 2, cutY - gap / 2],
    ]);
  }
  return {
    width,
    height,
    lots,
    park: landscapes[0] ?? [],
    plaza: landscapes[1] ?? [],
    river: [...bank, [width, height], [width, 0]],
  };
}

/** 同一访问种子生成两种响应式几何，窗口缩放只切换视图，不触发新的随机分配。 */
export function createCommunityMaps(seed: number): {
  desktop: CommunityMapTemplate;
  mobile: CommunityMapTemplate;
} {
  /** 极端分叉可能不足八块；有界重试整图，不以缩小触控区域强行塞入成员。 */
  const generateSafe = (mobile: boolean): CommunityMapTemplate => {
    for (let attempt = 0; attempt < 32; attempt++) {
      const map = generateMap((seed + Math.imul(attempt, 2654435761)) >>> 0, mobile);
      if (map) return map;
    }
    return generateMap(20260907, mobile)!;
  };
  return { desktop: generateSafe(false), mobile: generateSafe(true) };
}

/** SSG 与无脚本访问使用稳定后备地图；访客增强后在首次交互前生成本次布局。 */
export const communityDesktopMap = createCommunityMaps(20260907).desktop;
export const communityMobileMap = createCommunityMaps(20260907).mobile;
