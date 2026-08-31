/** Section Breaker 首弯入口位置所需的交接参数。 */
export interface HomeSectionBreakerEntryPathStartOptions {
  /** Gallery 阶段结束时，列车尾部在固定视口中的纵坐标。 */
  galleryTrainTailY: number;
  /** 首个 Bézier 弯道入口在固定视口中的纵坐标。 */
  curveStartY: number;
  /** 沿路线绘制的列车长度，用于为入弯车体保留连续直轨。 */
  trainLength: number;
}

/** Section Breaker 原生滚动配速所需的几何参数。 */
export interface HomeSectionBreakerScrollDistanceOptions {
  /** 列车从首弯入口到右轨出口仍需运行的路径距离。 */
  remainingPathDistance: number;
  /** 当前视口高度，用于限制站牌被 sticky 保留的最长时间。 */
  viewportHeight: number;
  /** 路径距离换算为滚动距离的比例；越大越慢，普通 Breaker 默认接近一比一。 */
  pathToScrollRatio?: number;
  /** sticky 额外行程允许占用的最大视口倍数，避免长线路无限拉长首页。 */
  maximumViewportRatio?: number;
}

/** 列车沿线路渐变区改变派生色所需的标准化参数。 */
export interface HomeTrainColorTransitionOptions {
  /** 列车在当前轨段中的 0→1 行进进度。 */
  routeProgress: number;
  /** 线路色开始离开进入线路的轨段进度。 */
  transitionStart: number;
  /** 线路色完全进入离开线路的轨段进度。 */
  transitionEnd: number;
}

/** 一段弯曲列车路径上的视口采样点。 */
export interface HomeTrainPathPoint {
  /** 采样点在固定视口中的横坐标。 */
  x: number;
  /** 采样点在固定视口中的纵坐标。 */
  y: number;
}

/** 弯曲列车完整点击包围盒所需的路径采样参数。 */
export interface HomeTrainPathHitAreaOptions {
  /** 从车尾到车头依次取得的路径采样点。 */
  points: readonly HomeTrainPathPoint[];
  /** SVG 车身描边厚度，用于把中心线边界扩展到视觉边缘。 */
  trainThickness: number;
  /** 即使车身更窄也必须保留的最小点击尺寸。 */
  minimumTargetSize?: number;
}

/** 竖轨列车在视口底部保持完整可见所需的几何参数。 */
export interface HomeVerticalTrainBottomCenterOptions {
  /** visual viewport 在布局视口坐标中的实际底边。 */
  viewportBottom: number;
  /** 竖轨方向上的实际车身长度。 */
  trainLength: number;
  /** 车身与视口底边之间的安全留白。 */
  edgeGap: number;
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
 * 把真实路径换算为接近一比一的原生滚动节奏，并把额外 sticky 行程封顶在 1.65 个视口。
 * 0.92 倍路径对应约 1.09px 路径 / 1px 滚动；短视口即使触发封顶也不会退回原先的高速掠过。
 * 这只改变列车每像素滚动的速度，不接管浏览器滚动，也不引入强制分页。
 */
export const getHomeSectionBreakerScrollDistance = ({
  remainingPathDistance,
  viewportHeight,
  pathToScrollRatio = 0.92,
  maximumViewportRatio = 1.65,
}: HomeSectionBreakerScrollDistanceOptions) => {
  const pacedPathDistance = Math.max(0, remainingPathDistance) * Math.max(0, pathToScrollRatio);
  const maximumViewportDistance = Math.max(0, viewportHeight) * Math.max(0, maximumViewportRatio);

  return Math.min(pacedPathDistance, maximumViewportDistance);
};

/**
 * 把轨段进度映射为 0→1 的列车换色进度。
 * 起止点之外保持对应线路的完整派生色，过渡区内线性混合，避免颜色在站界突然跳变。
 */
export const getHomeTrainColorTransitionProgress = ({
  routeProgress,
  transitionStart,
  transitionEnd,
}: HomeTrainColorTransitionOptions) => {
  const transitionLength = Math.max(Number.EPSILON, transitionEnd - transitionStart);

  return Math.min(Math.max((routeProgress - transitionStart) / transitionLength, 0), 1);
};

/**
 * 从车尾到车头的路径采样点建立局部法线包围盒。
 * 每个点只向描边的左右扩展，不越过 butt linecap 的车头车尾，同时覆盖跨在直轨与 Bézier 上的车身。
 */
export const getHomeTrainPathHitArea = ({
  points,
  trainThickness,
  minimumTargetSize = 44,
}: HomeTrainPathHitAreaOptions) => {
  const safeTargetSize = Math.max(0, minimumTargetSize);
  const halfThickness = Math.max(0, trainThickness) / 2;

  if (points.length === 0) {
    return {
      left: -safeTargetSize / 2,
      top: -safeTargetSize / 2,
      width: safeTargetSize,
      height: safeTargetSize,
    };
  }

  const envelopePoints = points.flatMap((point, index) => {
    const previousPoint = points[Math.max(0, index - 1)] ?? point;
    const nextPoint = points[Math.min(points.length - 1, index + 1)] ?? point;
    const tangentX = nextPoint.x - previousPoint.x;
    const tangentY = nextPoint.y - previousPoint.y;
    const tangentMagnitude = Math.hypot(tangentX, tangentY);
    const normalX = tangentMagnitude > Number.EPSILON ? -tangentY / tangentMagnitude : 1;
    const normalY = tangentMagnitude > Number.EPSILON ? tangentX / tangentMagnitude : 0;

    return [
      {
        x: point.x + normalX * halfThickness,
        y: point.y + normalY * halfThickness,
      },
      {
        x: point.x - normalX * halfThickness,
        y: point.y - normalY * halfThickness,
      },
    ];
  });
  const xCoordinates = envelopePoints.map((point) => point.x);
  const yCoordinates = envelopePoints.map((point) => point.y);
  const rawLeft = Math.min(...xCoordinates);
  const rawRight = Math.max(...xCoordinates);
  const rawTop = Math.min(...yCoordinates);
  const rawBottom = Math.max(...yCoordinates);
  const width = Math.max(safeTargetSize, rawRight - rawLeft);
  const height = Math.max(safeTargetSize, rawBottom - rawTop);
  const centerX = (rawLeft + rawRight) / 2;
  const centerY = (rawTop + rawBottom) / 2;

  return {
    left: centerX - width / 2,
    top: centerY - height / 2,
    width,
    height,
  };
};

/** 让竖轨车身在底部安全留白之前完整停下，而不是只保留较短的车身厚度。 */
export const getHomeVerticalTrainBottomCenterY = ({
  viewportBottom,
  trainLength,
  edgeGap,
}: HomeVerticalTrainBottomCenterOptions) =>
  Math.max(0, viewportBottom - Math.max(0, trainLength) / 2 - Math.max(0, edgeGap));
