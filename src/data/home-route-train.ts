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

/** 小屏换乘站内单辆列车的滚动状态所需参数。 */
export interface HomeMobileTransferTrainStateOptions {
  /** 换乘 section 顶边相对 visual viewport 顶边的实时坐标。 */
  sectionTop: number;
  /** 当前 visual viewport 高度，用于在不同手机高度下保持一致的进入时机。 */
  viewportHeight: number;
  /** 减少动态时固定车身位置，只保留线路语义色切换。 */
  prefersReducedMotion?: boolean;
}

/** 小屏换乘站内单辆列车的位置、线路与换色进度。 */
export interface HomeMobileTransferTrainState {
  /** 从 section 顶边进入约四成视口到最终对齐视口顶边的 0→1 行进进度。 */
  routeProgress: number;
  /** 车身顶边在 section 高度中的比例，直接供绝对定位消费。 */
  topSectionRatio: number;
  /** 从进入线路派生色过渡到离开线路派生色的 0→1 进度。 */
  colorProgress: number;
}

/** 续行桌面双车在当前滚动拍点中的叙事阶段。 */
export type HomeOnwardTrainPhase = "arriving" | "transfer" | "departing";

/** 续行桌面双车各自路径与交接停顿的独立进度。 */
export interface HomeOnwardTrainChoreography {
  /** 当前由湾岸进站、线路交接或探索离站中的哪一拍主导。 */
  phase: HomeOnwardTrainPhase;
  /** 湾岸支线列车沿下层轨道减速进站的 0→1 进度。 */
  incomingProgress: number;
  /** 两车静止时用于强调换乘站牌的 0→1 交接进度。 */
  handoffProgress: number;
  /** 探索线列车从上层轨道加速离站的 0→1 进度。 */
  outgoingProgress: number;
}

/** 续行出发厅左侧 PIDS 当前承担的内容语义。 */
export type HomeOnwardDepartureBoardState = "destinations" | "help";

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

/** 续行正文列车经过介绍并停驻 PIDS 时所需的滚动边界。 */
export interface HomeOnwardContentTrainProgressOptions {
  /** 当前页面滚动位置。 */
  scrollY: number;
  /** 续行正文 section 的文档顶边。 */
  contentTop: number;
  /** PIDS sticky 行程开始的文档顶边。 */
  boardJourneyTop: number;
  /** 列车停驻在 PIDS 舞台时的竖轨进度，默认避开导向牌停在下方。 */
  boardProgress?: number;
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

/** Tooltip 定位使用的视口矩形；字段与 DOMRect 对齐，便于浏览器层直接传入实测结果。 */
export interface HomeTrainTooltipBounds {
  /** 矩形左边缘的布局视口坐标。 */
  left: number;
  /** 矩形上边缘的布局视口坐标。 */
  top: number;
  /** 矩形右边缘的布局视口坐标。 */
  right: number;
  /** 矩形下边缘的布局视口坐标。 */
  bottom: number;
  /** 矩形宽度。 */
  width: number;
  /** 矩形高度。 */
  height: number;
}

/** Tooltip 完成布局后的实际尺寸。 */
export interface HomeTrainTooltipSize {
  /** Tooltip 外边框宽度。 */
  width: number;
  /** Tooltip 外边框高度。 */
  height: number;
}

/** Tooltip 可选的贴附方向；corner 表示四周均放不下时的安全区回退。 */
export type HomeTrainTooltipPlacement = "above" | "below" | "left" | "right" | "corner";

/** 列车 Tooltip 在 visual viewport 内选择贴附方向所需的响应式几何。 */
export interface HomeTrainTooltipPlacementOptions {
  /** 当前触发列车的真实可点击边界。 */
  anchorBounds: HomeTrainTooltipBounds;
  /** Tooltip 在本轮排版后的实际尺寸。 */
  tooltipSize: HomeTrainTooltipSize;
  /** visual viewport 的完整布局坐标边界。 */
  viewportBounds: HomeTrainTooltipBounds;
  /** 固定 Header 与视口边距共同确定的首选安全顶边。 */
  preferredSafeTop: number;
  /** 横轨列车优先尝试上下方；竖轨列车优先尝试页面内侧。 */
  preferBlockPlacement: boolean;
  /** Tooltip 与视口边缘的最小距离。 */
  edge?: number;
  /** Tooltip 与列车车体之间的呼吸距离。 */
  gap?: number;
}

/** 列车 Tooltip 应优先选择上下或左右方向时所需的语义与几何。 */
export interface HomeTrainTooltipPreferenceOptions {
  /** 全局路径列车按真实轨段决定方向，局部站台车按换乘构图决定。 */
  usesPathAnchor: boolean;
  /** 当前列车所处轨段；horizontal 与 curve 代表上下方更贴近车身。 */
  routeSegment: string;
  /** 局部换乘站的构图；compact 必须保留同岸既有的侧边 Tooltip。 */
  transferComposition?: "compact" | "open";
  /** 当前 Tooltip 锚点的实际宽度。 */
  anchorWidth: number;
  /** 当前 Tooltip 锚点的实际高度。 */
  anchorHeight: number;
}

/** Tooltip 最终写回 fixed overlay 的位置与贴附方向。 */
export interface HomeTrainTooltipPlacementResult {
  /** Tooltip 左边缘的布局视口坐标。 */
  left: number;
  /** Tooltip 上边缘的布局视口坐标。 */
  top: number;
  /** 本次成功使用的贴附方向。 */
  placement: HomeTrainTooltipPlacement;
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
 * 把续行的单段滚动拆成“湾岸进站—短暂停顿—探索离站”三拍。
 * 进站使用减速曲线，离站使用加速曲线；两条线路不会同时成为运动主角。
 */
export const getHomeOnwardTrainChoreography = (
  routeProgress: number,
): HomeOnwardTrainChoreography => {
  const clampedProgress = Math.min(Math.max(routeProgress, 0), 1);
  const arrivalEnd = 0.38;
  const departureStart = 0.52;
  const normalizePhase = (start: number, end: number) =>
    Math.min(Math.max((clampedProgress - start) / Math.max(Number.EPSILON, end - start), 0), 1);
  const arrivalProgress = normalizePhase(0, arrivalEnd);
  const departureProgress = normalizePhase(departureStart, 1);
  const incomingProgress = 1 - (1 - arrivalProgress) ** 2;
  const outgoingProgress = departureProgress ** 2;
  const handoffProgress = normalizePhase(arrivalEnd, departureStart);
  const phase: HomeOnwardTrainPhase =
    clampedProgress < arrivalEnd
      ? "arriving"
      : clampedProgress < departureStart
        ? "transfer"
        : "departing";

  return {
    phase,
    incomingProgress,
    handoffProgress,
    outgoingProgress,
  };
};

/**
 * 把独立续行内容页的滚动进度映射成两个 PIDS 阅读拍点。
 * 页面先完整展示目的地，再由首次到访帮助接管；减少动态只停用空间位移，不隐藏第二页信息。
 */
export const getHomeOnwardDepartureBoardState = (
  routeProgress: number,
): HomeOnwardDepartureBoardState => {
  const clampedProgress = Number.isFinite(routeProgress)
    ? Math.min(Math.max(routeProgress, 0), 1)
    : 0;

  return clampedProgress >= 0.62 ? "help" : "destinations";
};

/**
 * 让续行列车在介绍段驶向站台，并在 PIDS 两个状态期间保持静止。
 * 离场由 Footer 的真实可见行程接管，避免把整段位移挤进正文与 Footer 之间的一像素边界。
 */
export const getHomeOnwardContentTrainProgress = ({
  scrollY,
  contentTop,
  boardJourneyTop,
  boardProgress = 0.78,
}: HomeOnwardContentTrainProgressOptions) => {
  const clampedBoardProgress = Math.min(Math.max(boardProgress, 0), 1);

  if (scrollY < boardJourneyTop) {
    const approachProgress = Math.min(
      Math.max((scrollY - contentTop) / Math.max(1, boardJourneyTop - contentTop), 0),
      1,
    );

    return approachProgress * clampedBoardProgress;
  }

  return clampedBoardProgress;
};

/** 把 Footer 的原生滚动进度映射为列车从 PIDS 停驻点到视口底部的连续离场进度。 */
export const getHomeOnwardFooterTrainProgress = (
  contentTrainProgress: number,
  footerProgress: number,
) => {
  const clampedContentProgress = Number.isFinite(contentTrainProgress)
    ? Math.min(Math.max(contentTrainProgress, 0), 1)
    : 0;
  const clampedFooterProgress = Number.isFinite(footerProgress)
    ? Math.min(Math.max(footerProgress, 0), 1)
    : 0;

  return clampedContentProgress + (1 - clampedContentProgress) * clampedFooterProgress;
};

/**
 * 让小屏收尾站只保留一辆沿左轨下行的列车，并把换色发生点留在可见区内。
 * 动画在 section 顶边进入约四成视口后启动：无需拉长最后一节，760px 最小高度在短屏上也能给分界帧留出底部余量。
 */
export const getHomeMobileTransferTrainState = ({
  sectionTop,
  viewportHeight,
  prefersReducedMotion = false,
}: HomeMobileTransferTrainStateOptions): HomeMobileTransferTrainState => {
  const safeViewportHeight = Math.max(Number.EPSILON, viewportHeight);
  const animationStartTop = safeViewportHeight * 0.4;
  const routeProgress = Math.min(
    Math.max((animationStartTop - sectionTop) / animationStartTop, 0),
    1,
  );
  const colorProgress = prefersReducedMotion
    ? routeProgress >= 0.5
      ? 1
      : 0
    : getHomeTrainColorTransitionProgress({
        routeProgress,
        transitionStart: 0.42,
        transitionEnd: 0.58,
      });

  return {
    routeProgress,
    topSectionRatio: prefersReducedMotion ? 0.46 : 0.3 + routeProgress * 0.32,
    colorProgress,
  };
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

/**
 * 保留同岸 compact 站台车的既有侧边 Tooltip；只有全局横/弯轨列车与续行 open 横车优先上下贴附。
 */
export const getHomeTrainTooltipPreferBlockPlacement = ({
  usesPathAnchor,
  routeSegment,
  transferComposition,
  anchorWidth,
  anchorHeight,
}: HomeTrainTooltipPreferenceOptions) =>
  usesPathAnchor
    ? /horizontal|curve/.test(routeSegment)
    : transferComposition === "open"
      ? anchorWidth >= anchorHeight
      : /horizontal|curve/.test(routeSegment);

/**
 * 按列车朝向尝试上下或左右贴附，并保证 Tooltip 完整留在 visual viewport 与 Header 安全区内。
 * 四周空间都不足时回退到安全区左上角；调用方只负责测量 DOM，不再重复维护方向分支。
 */
export const getHomeTrainTooltipPlacement = ({
  anchorBounds,
  tooltipSize,
  viewportBounds,
  preferredSafeTop,
  preferBlockPlacement,
  edge = 20,
  gap = 16,
}: HomeTrainTooltipPlacementOptions): HomeTrainTooltipPlacementResult => {
  const clampPosition = (value: number, minimum: number, maximum: number) =>
    Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
  const safeTop = clampPosition(
    preferredSafeTop,
    viewportBounds.top + edge,
    viewportBounds.bottom - tooltipSize.height - edge,
  );
  const safeLeft = viewportBounds.left + edge;
  const safeRight = viewportBounds.right - edge;
  const safeBottom = viewportBounds.bottom - edge;
  const maxLeft = safeRight - tooltipSize.width;
  const maxTop = safeBottom - tooltipSize.height;
  const anchorCenterX = anchorBounds.left + anchorBounds.width / 2;
  const canFitVertically = maxTop >= safeTop;
  const sidePlacements: readonly HomeTrainTooltipPlacement[] =
    anchorCenterX <= viewportBounds.left + viewportBounds.width / 2
      ? ["right", "left"]
      : ["left", "right"];
  const placementCandidates: readonly HomeTrainTooltipPlacement[] = preferBlockPlacement
    ? ["above", "below", ...sidePlacements]
    : [...sidePlacements, "above", "below"];
  let left = safeLeft;
  let top = safeTop;
  let placement: HomeTrainTooltipPlacement = "corner";

  const didPlace = placementCandidates.some((candidate) => {
    if (
      candidate === "right" &&
      canFitVertically &&
      anchorBounds.right + gap + tooltipSize.width <= safeRight
    ) {
      left = anchorBounds.right + gap;
      top = clampPosition(
        anchorBounds.top + anchorBounds.height / 2 - tooltipSize.height / 2,
        safeTop,
        maxTop,
      );
    } else if (
      candidate === "left" &&
      canFitVertically &&
      anchorBounds.left - gap - tooltipSize.width >= safeLeft
    ) {
      left = anchorBounds.left - gap - tooltipSize.width;
      top = clampPosition(
        anchorBounds.top + anchorBounds.height / 2 - tooltipSize.height / 2,
        safeTop,
        maxTop,
      );
    } else if (candidate === "above" && anchorBounds.top - gap - tooltipSize.height >= safeTop) {
      left = clampPosition(anchorCenterX - tooltipSize.width / 2, safeLeft, maxLeft);
      top = anchorBounds.top - gap - tooltipSize.height;
    } else if (
      candidate === "below" &&
      anchorBounds.bottom + gap + tooltipSize.height <= safeBottom
    ) {
      left = clampPosition(anchorCenterX - tooltipSize.width / 2, safeLeft, maxLeft);
      top = Math.max(safeTop, anchorBounds.bottom + gap);
    } else {
      return false;
    }

    placement = candidate;
    return true;
  });

  return didPlace ? { left, top, placement } : { left: safeLeft, top: safeTop, placement };
};

/** 让竖轨车身在底部安全留白之前完整停下，而不是只保留较短的车身厚度。 */
export const getHomeVerticalTrainBottomCenterY = ({
  viewportBottom,
  trainLength,
  edgeGap,
}: HomeVerticalTrainBottomCenterOptions) =>
  Math.max(0, viewportBottom - Math.max(0, trainLength) / 2 - Math.max(0, edgeGap));
