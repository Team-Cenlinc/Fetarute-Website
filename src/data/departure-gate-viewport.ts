/** Departure Gate 在移动浏览器布局视口与可见视口之间的定位输入。 */
export interface DepartureGateViewportPlacementSource {
  /** 当前布局视口在文档中的纵向起点，激活后用它锚定整屏不透明背景。 */
  scrollY: number;
  /** VisualViewport 相对布局视口顶边的偏移，用于避开 Safari 展开的顶部工具栏。 */
  visualOffsetTop: number;
  /** 用户当前真正可见的高度，交互前景只在这段区域内排版。 */
  visualHeight: number;
}

/** Departure Gate 背景与交互前景分别消费的稳定定位结果。 */
export interface DepartureGateViewportPlacement {
  /** 不透明背景在文档坐标中的顶边；不跟随 Safari 对 fixed 元素的可见视口偏移。 */
  documentTop: number;
  /** 交互前景相对整屏背景的顶部安全偏移。 */
  visibleOffsetTop: number;
  /** 交互前景可消费的当前可见高度。 */
  visibleHeight: number;
}

/**
 * 将 Gate 背景固定到布局视口，把动态工具栏影响限制在内部交互场景。
 * 这样 Safari 地址栏展开或收起时，背景仍覆盖整块页面，卡片和 Validator 则保持可见。
 */
export const getDepartureGateViewportPlacement = ({
  scrollY,
  visualOffsetTop,
  visualHeight,
}: DepartureGateViewportPlacementSource): DepartureGateViewportPlacement => ({
  documentTop: Math.max(0, scrollY),
  visibleOffsetTop: Math.max(0, visualOffsetTop),
  visibleHeight: Math.max(1, visualHeight),
});
