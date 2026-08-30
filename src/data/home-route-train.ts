/** Section Breaker 首弯入口位置所需的交接参数。 */
export interface HomeSectionBreakerEntryPathStartOptions {
  /** Gallery 阶段结束时，列车尾部在固定视口中的纵坐标。 */
  galleryTrainTailY: number;
  /** 首个 Bézier 弯道入口在固定视口中的纵坐标。 */
  curveStartY: number;
  /** 沿路线绘制的列车长度，用于为入弯车体保留连续直轨。 */
  trainLength: number;
}

/** Section Breaker 原生滚动压缩所需的几何参数。 */
export interface HomeSectionBreakerScrollDistanceOptions {
  /** 列车从首弯入口到右轨出口仍需运行的路径距离。 */
  remainingPathDistance: number;
  /** 当前视口高度，用于限制站牌被 sticky 保留的最长时间。 */
  viewportHeight: number;
}

/**
 * 保证首弯入口从上方向下顺向进入 Bézier，并为整段弯曲车体保留至少一个车长的直轨。
 * Gallery 交接点已经更高时保持原位，避免为了修复首弯而无条件拉长滚动路线。
 */
export const getHomeSectionBreakerEntryPathStartY = ({
  galleryTrainTailY,
  curveStartY,
  trainLength,
}: HomeSectionBreakerEntryPathStartOptions) =>
  Math.min(galleryTrainTailY, curveStartY - Math.max(0, trainLength));

/**
 * 把真实路径压缩为原生滚动节奏：保留路径比例，同时把额外 sticky 行程封顶在 1.1 个视口。
 * 这只改变列车每像素滚动的速度，不接管浏览器滚动，也不引入强制分页。
 */
export const getHomeSectionBreakerScrollDistance = ({
  remainingPathDistance,
  viewportHeight,
}: HomeSectionBreakerScrollDistanceOptions) => {
  const compressedPathDistance = Math.max(0, remainingPathDistance) * 0.62;
  const maximumViewportDistance = Math.max(0, viewportHeight) * 1.1;

  return Math.min(compressedPathDistance, maximumViewportDistance);
};
