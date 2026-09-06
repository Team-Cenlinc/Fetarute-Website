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

/** 小屏续行局部车在 visual viewport 中追向全局列车交接中心所需的纯几何。 */
export interface HomeMobileTransferTrainViewportCenterOptions {
  /** 换乘 section 顶边相对 visual viewport 顶边的实时坐标。 */
  sectionTop: number;
  /** 当前局部舞台高度，用于还原车身未位移时的中心。 */
  stageHeight: number;
  /** 竖向局部车身高度。 */
  trainBlockSize: number;
  /** 局部车在当前 section 内已经完成的 0→1 路线进度。 */
  routeProgress: number;
  /** 全局正文列车第一帧使用的可见视口中心。 */
  handoffCenterY: number;
}

/** 小屏续行从同岸全局来车交给局部单车时的互斥边界。 */
export interface HomeMobileOnwardIncomingPhaseOptions {
  /** 当前文档滚动坐标。 */
  scrollY: number;
  /** 同岸正文列车完成可见行程的文档坐标。 */
  communityJourneyEnd: number;
  /** 探索线正文列车开始接管的文档坐标。 */
  contentRevealStart: number;
  /** 上一 read 阶段取得的续行局部车可见中心。 */
  localTrainCenterY: number;
  /** 全局来车与局部车共同使用的底部交接中心。 */
  handoffCenterY: number;
  /** 局部单车从湾岸色过渡到探索色的当前进度。 */
  localTrainColorProgress: number;
}

/** 换乘站局部车与全局数值路径车之间的视觉绘制所有权。 */
export type HomeTransferTrainVisualOwner = "local" | "global-incoming" | "global-outgoing";

/** 根据响应式构图决定换乘站两个局部车身是否仍应参与绘制。 */
export interface HomeTransferTrainVisibilityOptions {
  /** 当前由局部 DOM 车或某一方向的全局有界车身承担视觉。 */
  owner: HomeTransferTrainVisualOwner;
  /** 小屏单线构图以 incoming DOM 节点承载两条线路，不能按桌面双车分别隐藏。 */
  singleTrainComposition: boolean;
}

/** 换乘站局部车身的最终可见性；单车构图中 outgoing 节点始终不参与绘制。 */
export interface HomeTransferTrainVisibility {
  /** incoming DOM 车身是否应可见。 */
  incomingVisible: boolean;
  /** outgoing DOM 车身是否应可见。 */
  outgoingVisible: boolean;
}

/** 减少动态时用于选择续行局部车或全局路径车的可见几何状态。 */
export interface HomeReducedMotionOnwardTrainOwnerOptions {
  /** 续行站牌是否覆盖当前视口阅读线。 */
  routeContainsReadingLine: boolean;
  /** 续行正文是否覆盖当前视口阅读线。 */
  contentContainsReadingLine: boolean;
  /** 页尾是否覆盖当前视口阅读线。 */
  footerContainsReadingLine: boolean;
  /** 单一局部车身是否仍有任何部分落在可见视口内。 */
  localTrainWithinViewport: boolean;
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

/** 纯数值路线上的累计里程采样点，用于避开 WebKit 的同步 SVG 几何查询。 */
export interface HomeTrainPathSample extends HomeTrainPathPoint {
  /** 从路径起点走到当前采样点的累计距离。 */
  distance: number;
}

/** 从首页生成的 M/L/Q/C 路径派生出的浏览器无关几何。 */
export interface HomeTrainPathGeometry {
  /** 按路线顺序排列、带累计里程的折线采样点。 */
  points: readonly HomeTrainPathSample[];
  /** 整条路线的近似长度，供滚动进度、车身中心与命中区共享同一度量。 */
  totalLength: number;
  /** 每条 L 或 C 绘制指令结束时的累计距离，用于判断列车所在轨段。 */
  segmentEndDistances: readonly number[];
}

/** 有界刚性列车沿纯数值路线移动时的中心与切线姿态。 */
export interface HomeTrainPathPose {
  /** 车身中心在布局视口中的坐标。 */
  center: HomeTrainPathPoint;
  /** 路径切线相对水平向右的角度，直接供 CSS rotate 消费。 */
  angleDegrees: number;
}

/** 弯曲列车完整点击包围盒所需的路径采样参数。 */
export interface HomeTrainPathHitAreaOptions {
  /** 从车尾到车头依次取得的路径采样点。 */
  points: readonly HomeTrainPathPoint[];
  /** 车身厚度，用于把中心线边界扩展到视觉边缘。 */
  trainThickness: number;
  /** 即使车身更窄也必须保留的最小点击尺寸。 */
  minimumTargetSize?: number;
}

/** 小屏直轨列车无需访问 SVG 几何即可完成绘制与命中的数值输入。 */
export interface HomeVerticalTrainRenderGeometryOptions {
  /** 轨道中心的视口横坐标。 */
  trackX: number;
  /** 供数值车身定位的直线路径起点。 */
  routeStartY: number;
  /** 供数值车身定位的直线路径终点。 */
  routeEndY: number;
  /** 当前车身中心的视口纵坐标。 */
  trainCenterY: number;
  /** 列车沿轨道方向的长度。 */
  trainLength: number;
  /** 列车垂直轨道方向的厚度。 */
  trainThickness: number;
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

/** Footer 终段持续持有全局列车时所需的滚动边界。 */
export interface HomeFooterRouteStateOptions {
  /** 当前页面滚动位置；移动 Safari 弹性回弹时可能暂时超过文档终点。 */
  scrollY: number;
  /** 续行正文完成并把列车交给 Footer 的文档滚动位置。 */
  onwardContentJourneyEnd: number;
  /** Footer 正常滚动行程的终点，只用于封顶进度，不能撤销列车所有权。 */
  footerJourneyEnd: number;
}

/** Footer 终段的列车所有权与封顶后的滚动进度。 */
export interface HomeFooterRouteState {
  /** Footer 是否已经接管列车；接管后在页面终点弹性越界期间仍保持为真。 */
  active: boolean;
  /** Footer 正常行程内的 0→1 进度；越过文档终点后保持为 1。 */
  progress: number;
}

/** Footer 接替续行 sticky 舞台时所需的真实容器几何。 */
export interface HomeFooterStickyReleaseOptions {
  /** sticky 行程容器在文档中的顶边。 */
  journeyTop: number;
  /** sticky 行程容器的实际布局高度。 */
  journeyHeight: number;
  /** sticky 舞台的实际布局高度；短桌面可能高于 visual viewport。 */
  stageHeight: number;
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

/**
 * 桌面把 Footer 原生进度映射为列车的连续离场；小屏可保持 PIDS 终点，避免单车在页面底部继续下坠。
 */
export const getHomeOnwardFooterTrainProgress = (
  contentTrainProgress: number,
  footerProgress: number,
  holdAtContentTerminus = false,
) => {
  const clampedContentProgress = Number.isFinite(contentTrainProgress)
    ? Math.min(Math.max(contentTrainProgress, 0), 1)
    : 0;
  /* 小屏单车在 PIDS 终点停驻，让 Footer 自己进入视口而不是继续把列车推向浏览器手势边缘。 */
  if (holdAtContentTerminus) {
    return clampedContentProgress;
  }
  const clampedFooterProgress = Number.isFinite(footerProgress)
    ? Math.min(Math.max(footerProgress, 0), 1)
    : 0;

  return clampedContentProgress + (1 - clampedContentProgress) * clampedFooterProgress;
};

/**
 * 让 Footer 一旦接管便持续持有终点列车，同时只把视觉进度封顶。
 * Safari 底部弹性滚动会短暂报告超出文档终点的 scrollY，不能把这种越界解释为离开 Footer。
 */
export const getHomeFooterRouteState = ({
  scrollY,
  onwardContentJourneyEnd,
  footerJourneyEnd,
}: HomeFooterRouteStateOptions): HomeFooterRouteState => {
  const safeScrollY = Number.isFinite(scrollY) ? scrollY : 0;
  const safeJourneyStart = Number.isFinite(onwardContentJourneyEnd) ? onwardContentJourneyEnd : 0;
  const safeJourneyEnd = Number.isFinite(footerJourneyEnd)
    ? Math.max(footerJourneyEnd, safeJourneyStart)
    : safeJourneyStart;
  const active = safeScrollY > safeJourneyStart;

  return {
    active,
    progress: active
      ? Math.min(
          Math.max(
            (safeScrollY - safeJourneyStart) / Math.max(1, safeJourneyEnd - safeJourneyStart),
            0,
          ),
          1,
        )
      : 0,
  };
};

/**
 * 返回 sticky 舞台开始随容器底边离场的文档滚动位置。
 * 使用舞台实高而不是视口高度，避免低于 680px 的桌面产生一段未补偿的反向上移。
 */
export const getHomeFooterStickyReleaseScrollY = ({
  journeyTop,
  journeyHeight,
  stageHeight,
}: HomeFooterStickyReleaseOptions) => {
  const safeJourneyTop = Number.isFinite(journeyTop) ? journeyTop : 0;
  const safeJourneyHeight = Number.isFinite(journeyHeight) ? Math.max(0, journeyHeight) : 0;
  const safeStageHeight = Number.isFinite(stageHeight) ? Math.max(0, stageHeight) : 0;

  return safeJourneyTop + Math.max(0, safeJourneyHeight - safeStageHeight);
};

/**
 * 把 Footer 的原生可见进度转换成首尾速度为零的连续曲线。
 * 线路仍严格跟随滚动，只有末屏物件与页尾文案消费缓动，避免 sticky 解锁时像硬推屏。
 */
export const getHomeFooterRevealProgress = (footerProgress: number) => {
  const clampedProgress = Number.isFinite(footerProgress)
    ? Math.min(Math.max(footerProgress, 0), 1)
    : 0;

  return clampedProgress * clampedProgress * (3 - 2 * clampedProgress);
};

/**
 * 先在 Footer 出现前缓慢下沉末屏物件，再用与真实滚动等量的位移抵消 sticky 解锁上移。
 * 最后一小段仍使用首尾速度为零的缓动，令 PIDS、支柱和导视牌完成同一方向的收尾动作。
 */
export const getHomeFooterTransitionShift = (
  preparationProgress: number,
  footerProgress: number,
  footerTravel: number,
  preparationShift = 96,
  followThroughShift = 32,
) => {
  const easedPreparationProgress = getHomeFooterRevealProgress(preparationProgress);
  const clampedFooterProgress = Number.isFinite(footerProgress)
    ? Math.min(Math.max(footerProgress, 0), 1)
    : 0;
  const safeFooterTravel = Number.isFinite(footerTravel) ? Math.max(0, footerTravel) : 0;
  const safePreparationShift = Number.isFinite(preparationShift)
    ? Math.max(0, preparationShift)
    : 0;
  const safeFollowThroughShift = Number.isFinite(followThroughShift)
    ? Math.max(0, followThroughShift)
    : 0;

  return (
    easedPreparationProgress * safePreparationShift +
    clampedFooterProgress * safeFooterTravel +
    getHomeFooterRevealProgress(footerProgress) * safeFollowThroughShift
  );
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
 * 将小屏局部车从 Figma 初始车位连续送到全局正文列车的同一中心。
 * 终点由调用方的真实可见视口安全锚点决定，避免用固定 section 比例制造所有权跃迁。
 */
export const getHomeMobileTransferTrainViewportCenterY = ({
  sectionTop,
  stageHeight,
  trainBlockSize,
  routeProgress,
  handoffCenterY,
}: HomeMobileTransferTrainViewportCenterOptions) => {
  const safeSectionTop = Number.isFinite(sectionTop) ? sectionTop : 0;
  const safeStageHeight = Number.isFinite(stageHeight) ? Math.max(0, stageHeight) : 0;
  const safeTrainBlockSize = Number.isFinite(trainBlockSize) ? Math.max(0, trainBlockSize) : 0;
  const safeHandoffCenterY = Number.isFinite(handoffCenterY) ? handoffCenterY : 0;
  const clampedRouteProgress = Number.isFinite(routeProgress)
    ? Math.min(Math.max(routeProgress, 0), 1)
    : 0;
  const initialCenterY = safeSectionTop + safeStageHeight * 0.3 + safeTrainBlockSize / 2;

  return initialCenterY + (safeHandoffCenterY - initialCenterY) * clampedRouteProgress;
};

/**
 * 判断小屏是否仍应由湾岸全局来车接近续行局部车。
 * 正文边界具有更高优先级，并用半像素容差吸收 read/write 跨帧后的浮点噪声，避免反向惯性滚动把 DS 误判回 BS。
 */
export const isHomeMobileOnwardIncomingPhase = ({
  scrollY,
  communityJourneyEnd,
  contentRevealStart,
  localTrainCenterY,
  handoffCenterY,
  localTrainColorProgress,
}: HomeMobileOnwardIncomingPhaseOptions) =>
  scrollY > communityJourneyEnd &&
  scrollY <= contentRevealStart + 1 &&
  localTrainColorProgress < 1 &&
  localTrainCenterY - handoffCenterY > 0.5;

/**
 * 将视觉所有权收敛为局部车身可见性。
 * 小屏续行的一辆 DOM 车同时代表 incoming/outgoing；任一全局车接管时都必须隐藏它。
 */
export const getHomeTransferTrainVisibility = ({
  owner,
  singleTrainComposition,
}: HomeTransferTrainVisibilityOptions): HomeTransferTrainVisibility => {
  if (singleTrainComposition) {
    return {
      incomingVisible: owner === "local",
      outgoingVisible: false,
    };
  }

  return {
    incomingVisible: owner !== "global-incoming",
    outgoingVisible: owner !== "global-outgoing",
  };
};

/**
 * 为减少动态构图选择唯一列车视觉所有者。
 * 阅读线进入站牌前继续显示来车；局部车滚出视口时则提前交给正文路径，避免交界双车或空档。
 */
export const getHomeReducedMotionOnwardTrainOwner = ({
  routeContainsReadingLine,
  contentContainsReadingLine,
  footerContainsReadingLine,
  localTrainWithinViewport,
}: HomeReducedMotionOnwardTrainOwnerOptions): HomeTransferTrainVisualOwner => {
  if (
    contentContainsReadingLine ||
    footerContainsReadingLine ||
    (routeContainsReadingLine && !localTrainWithinViewport)
  ) {
    return "global-outgoing";
  }

  return routeContainsReadingLine ? "local" : "global-incoming";
};

/** 以偶数采样保留对称曲线的几何中点，并限制单段计算量。 */
const getHomePathCurveSampleCount = (controlPolygonLength: number) =>
  Math.min(48, Math.max(8, Math.ceil(controlPolygonLength / 24) * 2));

/**
 * 把首页内部生成的绝对 M/L/Q/C SVG path 转换为纯数值折线几何。
 * 曲线采样密度随控制多边形长度增长；JavaScript 因此无需触发 WebKit 的同步 SVG 布局查询。
 */
export const getHomeTrainPathGeometry = (pathData: string): HomeTrainPathGeometry => {
  const tokens = pathData.match(/[MLQC]|[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) ?? [];
  const points: HomeTrainPathSample[] = [];
  const segmentEndDistances: number[] = [];
  let tokenIndex = 0;
  let currentPoint: HomeTrainPathPoint = { x: 0, y: 0 };
  let totalLength = 0;

  /** 读取一项有限数值；内部路径格式异常时立即暴露，而不是把 NaN 带进动画帧。 */
  const readNumber = () => {
    const token = tokens[tokenIndex++];
    const value = Number(token);

    if (token === undefined || !Number.isFinite(value)) {
      throw new Error(`无法解析首页列车路径：${pathData}`);
    }

    return value;
  };
  /** 追加采样点并累计折线里程。 */
  const appendPoint = (point: HomeTrainPathPoint) => {
    if (points.length > 0) {
      totalLength += Math.hypot(point.x - currentPoint.x, point.y - currentPoint.y);
    }
    currentPoint = point;
    points.push({ ...point, distance: totalLength });
  };

  while (tokenIndex < tokens.length) {
    const command = tokens[tokenIndex++]?.toUpperCase();

    if (command === "M") {
      const movePoint = { x: readNumber(), y: readNumber() };
      currentPoint = movePoint;
      points.push({ ...movePoint, distance: totalLength });
      continue;
    }

    if (command === "L") {
      appendPoint({ x: readNumber(), y: readNumber() });
      segmentEndDistances.push(totalLength);
      continue;
    }

    if (command === "Q") {
      const curveStart = currentPoint;
      const controlPoint = { x: readNumber(), y: readNumber() };
      const curveEnd = { x: readNumber(), y: readNumber() };
      const controlPolygonLength =
        Math.hypot(controlPoint.x - curveStart.x, controlPoint.y - curveStart.y) +
        Math.hypot(curveEnd.x - controlPoint.x, curveEnd.y - controlPoint.y);
      const sampleCount = getHomePathCurveSampleCount(controlPolygonLength);

      for (let sampleIndex = 1; sampleIndex <= sampleCount; sampleIndex += 1) {
        const progress = sampleIndex / sampleCount;
        const inverseProgress = 1 - progress;
        appendPoint({
          x:
            inverseProgress ** 2 * curveStart.x +
            2 * inverseProgress * progress * controlPoint.x +
            progress ** 2 * curveEnd.x,
          y:
            inverseProgress ** 2 * curveStart.y +
            2 * inverseProgress * progress * controlPoint.y +
            progress ** 2 * curveEnd.y,
        });
      }
      segmentEndDistances.push(totalLength);
      continue;
    }

    if (command === "C") {
      const curveStart = currentPoint;
      const controlPointA = { x: readNumber(), y: readNumber() };
      const controlPointB = { x: readNumber(), y: readNumber() };
      const curveEnd = { x: readNumber(), y: readNumber() };
      const controlPolygonLength =
        Math.hypot(controlPointA.x - curveStart.x, controlPointA.y - curveStart.y) +
        Math.hypot(controlPointB.x - controlPointA.x, controlPointB.y - controlPointA.y) +
        Math.hypot(curveEnd.x - controlPointB.x, curveEnd.y - controlPointB.y);
      const sampleCount = getHomePathCurveSampleCount(controlPolygonLength);

      for (let sampleIndex = 1; sampleIndex <= sampleCount; sampleIndex += 1) {
        const progress = sampleIndex / sampleCount;
        const inverseProgress = 1 - progress;
        appendPoint({
          x:
            inverseProgress ** 3 * curveStart.x +
            3 * inverseProgress ** 2 * progress * controlPointA.x +
            3 * inverseProgress * progress ** 2 * controlPointB.x +
            progress ** 3 * curveEnd.x,
          y:
            inverseProgress ** 3 * curveStart.y +
            3 * inverseProgress ** 2 * progress * controlPointA.y +
            3 * inverseProgress * progress ** 2 * controlPointB.y +
            progress ** 3 * curveEnd.y,
        });
      }
      segmentEndDistances.push(totalLength);
      continue;
    }

    throw new Error(`首页列车路径只支持绝对 M/L/Q/C 指令：${pathData}`);
  }

  if (points.length === 0) {
    points.push({ x: 0, y: 0, distance: 0 });
  }

  return { points, totalLength, segmentEndDistances };
};

/**
 * 平移已缓存的路线采样点，同时复用累计里程与轨段阈值。
 * 滚动只改变 fixed 图层在视口中的原点时无需再次解析或采样 Bézier。
 */
export const getHomeTrainPathTranslatedGeometry = (
  geometry: HomeTrainPathGeometry,
  offsetX: number,
  offsetY: number,
): HomeTrainPathGeometry => {
  if (offsetX === 0 && offsetY === 0) {
    return geometry;
  }

  return {
    points: geometry.points.map((point) => ({
      x: point.x + offsetX,
      y: point.y + offsetY,
      distance: point.distance,
    })),
    totalLength: geometry.totalLength,
    segmentEndDistances: geometry.segmentEndDistances,
  };
};

/** 按累计里程从纯数值路线取点；超出路线的距离会夹在首尾端点。 */
export const getHomeTrainPathPointAtLength = (
  geometry: HomeTrainPathGeometry,
  distance: number,
): HomeTrainPathPoint => {
  const points = geometry.points;
  const firstPoint = points[0] ?? { x: 0, y: 0, distance: 0 };
  const lastPoint = points.at(-1) ?? firstPoint;
  const clampedDistance = Math.min(
    Math.max(Number.isFinite(distance) ? distance : 0, 0),
    geometry.totalLength,
  );

  if (clampedDistance <= firstPoint.distance) {
    return { x: firstPoint.x, y: firstPoint.y };
  }
  if (clampedDistance >= lastPoint.distance) {
    return { x: lastPoint.x, y: lastPoint.y };
  }

  let lowerIndex = 0;
  let upperIndex = points.length - 1;
  while (lowerIndex + 1 < upperIndex) {
    const middleIndex = Math.floor((lowerIndex + upperIndex) / 2);
    if ((points[middleIndex]?.distance ?? 0) < clampedDistance) {
      lowerIndex = middleIndex;
    } else {
      upperIndex = middleIndex;
    }
  }

  const lowerPoint = points[lowerIndex] ?? firstPoint;
  const upperPoint = points[upperIndex] ?? lastPoint;
  const segmentLength = Math.max(Number.EPSILON, upperPoint.distance - lowerPoint.distance);
  const segmentProgress = (clampedDistance - lowerPoint.distance) / segmentLength;

  return {
    x: lowerPoint.x + (upperPoint.x - lowerPoint.x) * segmentProgress,
    y: lowerPoint.y + (upperPoint.y - lowerPoint.y) * segmentProgress,
  };
};

/**
 * 从缓存的数值路线取得车身中心与局部切线；浏览器层只需据此写一次 transform。
 * 切线在中心两侧取样，首尾会自动收束到有效里程，零长度路径稳定回退为 0°。
 */
export const getHomeTrainPathPoseAtLength = (
  geometry: HomeTrainPathGeometry,
  distance: number,
  tangentSampleRadius: number,
): HomeTrainPathPose => {
  const centerDistance = Math.min(
    Math.max(Number.isFinite(distance) ? distance : 0, 0),
    geometry.totalLength,
  );
  const safeSampleRadius = Math.min(
    Math.max(Number.isFinite(tangentSampleRadius) ? tangentSampleRadius : 1, 1),
    Math.max(1, geometry.totalLength / 2),
  );
  const center = getHomeTrainPathPointAtLength(geometry, centerDistance);
  const tangentStart = getHomeTrainPathPointAtLength(
    geometry,
    Math.max(0, centerDistance - safeSampleRadius),
  );
  const tangentEnd = getHomeTrainPathPointAtLength(
    geometry,
    Math.min(geometry.totalLength, centerDistance + safeSampleRadius),
  );
  const deltaX = tangentEnd.x - tangentStart.x;
  const deltaY = tangentEnd.y - tangentStart.y;
  const angleDegrees =
    deltaX === 0 && deltaY === 0 ? 0 : (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

  return { center, angleDegrees };
};

/**
 * 把一个车长的采样点转成以车身中心为原点的小画布曲线；直轨返回 null，继续使用合成层平移。
 * 任一点距沿程中点至多半个车长，加上半个车厚即可包住描边，画布不随视口或完整线路扩大。
 */
export const getHomeTrainPathCurveGeometry = (
  points: readonly HomeTrainPathPoint[],
  center: HomeTrainPathPoint,
  trainLength: number,
  trainThickness: number,
) => {
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last || points.length < 3) return null;

  const deltaX = last.x - first.x;
  const deltaY = last.y - first.y;
  const chordLength = Math.hypot(deltaX, deltaY);
  if (chordLength < Number.EPSILON) return null;

  const bends = points.some(
    (point) =>
      Math.abs(deltaX * (point.y - first.y) - deltaY * (point.x - first.x)) / chordLength > 0.2,
  );
  if (!bends) return null;

  // 描边首尾为平口、折点为圆连接；额外 2px 只容纳画布边缘的抗锯齿。
  const size = Math.ceil(trainLength + trainThickness + 2);
  const pathData = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${(point.x - center.x + size / 2).toFixed(3)} ${(point.y - center.y + size / 2).toFixed(3)}`,
    )
    .join(" ");
  return { size, pathData };
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
 * 直接计算竖直路径的车身里程、命中区和 Tooltip 中心。
 * Safari 不必在每个滚动帧重算 SVG 几何，直轨视觉仍与通用路径结果一致。
 */
export const getHomeVerticalTrainRenderGeometry = ({
  trackX,
  routeStartY,
  routeEndY,
  trainCenterY,
  trainLength,
  trainThickness,
}: HomeVerticalTrainRenderGeometryOptions) => {
  const journeyLength = Math.max(0, routeEndY - routeStartY);
  const safeTrainLength = Math.max(0, trainLength);
  const maxTrainTailDistance = Math.max(0, journeyLength - safeTrainLength);
  const trainTailDistance = Math.min(
    Math.max(0, trainCenterY - routeStartY - safeTrainLength / 2),
    maxTrainTailDistance,
  );
  const trainHeadDistance = Math.min(journeyLength, trainTailDistance + safeTrainLength);
  const trainTailY = routeStartY + trainTailDistance;
  const trainHeadY = routeStartY + trainHeadDistance;
  const hitArea = getHomeTrainPathHitArea({
    points: [
      { x: trackX, y: trainTailY },
      { x: trackX, y: trainHeadY },
    ],
    trainThickness,
  });

  return {
    journeyLength,
    trainTailDistance,
    trainHeadDistance,
    hitArea,
    trainMidpoint: {
      x: trackX,
      y: trainTailY + (trainHeadY - trainTailY) / 2,
    },
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
