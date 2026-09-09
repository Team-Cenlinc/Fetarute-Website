import {
  communityDesktopMap,
  createCommunityMaps,
  createCommunityRandom,
  type CommunityMapTemplate,
  type CommunityMapLot,
} from "../../data/community-map.ts";

/** HTML 热区的包围盒与实际多边形共享同一份几何，凹口不应响应地块点击。 */
export interface CommunityPlotGeometry extends CommunityMapLot {
  bounds: CommunityRect;
  clipPath: string;
}

/** 同一对象的桌面与手机地块；手机重排街区，不缩小整幅桌面地图。 */
export interface CommunityPlot {
  id: string;
  block: number;
  /** 几何槽位只用于让公共景观避开已分配的成员地块，不作为成员身份。 */
  slot: number;
  desktop: CommunityPlotGeometry;
  mobile: CommunityPlotGeometry;
}

/** 面板定位只需要的视口坐标，独立于 DOM 以便覆盖滚动、缩放及屏幕边缘。 */
export interface CommunityRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** 从真实轮廓导出定位和裁切，视图不再维护与地形脱节的另一套网格坐标。 */
export function createPlotGeometry(lot: CommunityMapLot): CommunityPlotGeometry {
  const left = Math.min(...lot.points.map(([x]) => x));
  const top = Math.min(...lot.points.map(([, y]) => y));
  const width = Math.max(...lot.points.map(([x]) => x)) - left;
  const height = Math.max(...lot.points.map(([, y]) => y)) - top;
  return {
    ...lot,
    bounds: { left, top, width, height },
    clipPath:
      "polygon(" +
      lot.points
        .map(([x, y]) => `${((x - left) / width) * 100}% ${((y - top) / height) * 100}%`)
        .join(", ") +
      ")",
  };
}

/** 用可复现种子生成并分配地块；初始化后 hover、focus 和滚动不能重排成员。 */
export function createCommunityLayout(
  ids: readonly string[],
  seed: number,
  maps = createCommunityMaps(seed),
): CommunityPlot[] {
  if (new Set(ids).size !== ids.length) throw new Error("社区成员身份不能重复。");
  const shuffled = [...ids];
  let state = seed >>> 0;
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const other = Math.floor((state / 2 ** 32) * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  const slots = Array.from({ length: communityDesktopMap.lots.length }, (_, index) => index);
  const random = createCommunityRandom(seed ^ 0x9e3779b9);
  for (let index = slots.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [slots[index], slots[other]] = [slots[other], slots[index]];
  }
  return shuffled.map((id, index) => {
    const slot = slots[index % slots.length];
    const block = Math.floor(index / communityDesktopMap.lots.length);
    return {
      id,
      block,
      slot,
      desktop: createPlotGeometry(maps.desktop.lots[slot]),
      mobile: createPlotGeometry(maps.mobile.lots[slot]),
    };
  });
}

/** 服务端和浏览器共用百分比样式，防止渲染轮廓与点击热区出现两套计算。 */
export function communityGeometryStyle(
  geometry: CommunityPlotGeometry,
  map: CommunityMapTemplate,
  suffix = "",
): string {
  const { bounds, label } = geometry;
  const values = {
    left: (bounds.left / map.width) * 100 + "%",
    top: (bounds.top / map.height) * 100 + "%",
    width: (bounds.width / map.width) * 100 + "%",
    height: (bounds.height / map.height) * 100 + "%",
    "label-x": ((label[0] - bounds.left) / bounds.width) * 100 + "%",
    "label-y": ((label[1] - bounds.top) / bounds.height) * 100 + "%",
    "label-width": (geometry.labelWidth / bounds.width) * 100 + "%",
    shape: geometry.clipPath,
  };
  return Object.entries(values)
    .map(([key, value]) => `--plot${suffix}-${key}: ${value};`)
    .join(" ");
}

/** 在目标地块旁定位等尺寸介绍面板；右侧放不下时翻到左侧，再限制于可用视口。 */
export function placeCommunityPanel(
  anchor: CommunityRect,
  panel: Pick<CommunityRect, "width" | "height">,
  viewport: CommunityRect,
): { x: number; y: number } {
  const margin = 8;
  const right = viewport.left + viewport.width;
  const preferredX = anchor.left + anchor.width + 12;
  const x =
    preferredX + panel.width <= right - margin ? preferredX : anchor.left - panel.width - 12;
  const minX = viewport.left + margin;
  const minY = viewport.top + margin;
  return {
    x: Math.max(minX, Math.min(x, right - panel.width - margin)),
    y: Math.max(
      minY,
      Math.min(
        anchor.top + anchor.height / 2 - panel.height / 2,
        viewport.top + viewport.height - panel.height - margin,
      ),
    ),
  };
}
