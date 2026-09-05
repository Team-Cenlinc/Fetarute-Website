/** 首页列车与 Tooltip 在同一动画帧内共享的布局视口和可见视口快照。 */
export interface HomeRouteViewportSnapshot {
  /** CSS 布局视口宽度，用于判断真实响应式断点变化。 */
  layoutWidth: number;
  /** CSS 布局视口高度；Safari 浏览器栏策略可能改变该值。 */
  layoutHeight: number;
  /** 用户当前真正可见的视口宽度。 */
  visualWidth: number;
  /** 用户当前真正可见的视口高度。 */
  visualHeight: number;
  /** 可见视口相对布局视口左边的偏移。 */
  visualOffsetLeft: number;
  /** 可见视口相对布局视口顶边的偏移。 */
  visualOffsetTop: number;
  /** VisualViewport 缩放比例，用于识别双指缩放。 */
  visualScale: number;
  /** 当前屏幕方向角度；无法读取时使用 0。 */
  orientationAngle: number;
}

/** 浏览器 viewport 读取器所需的最小 Window 形状，测试无需构造完整 DOM。 */
export interface HomeRouteViewportSource {
  /** CSS 布局视口宽度。 */
  innerWidth: number;
  /** CSS 布局视口高度。 */
  innerHeight: number;
  /** 支持时提供用户真正可见的 VisualViewport 数值。 */
  visualViewport?: {
    /** 可见宽度。 */
    width: number;
    /** 可见高度。 */
    height: number;
    /** 相对布局视口左边的偏移。 */
    offsetLeft: number;
    /** 相对布局视口顶边的偏移。 */
    offsetTop: number;
    /** 当前缩放比例。 */
    scale: number;
  } | null;
  /** 现代浏览器提供的屏幕方向。 */
  screen?: { orientation?: { angle: number } | null };
  /** 旧版 Safari 的方向角度回退。 */
  orientation?: number;
}

/** Tooltip 与列车共同消费的可见视口矩形。 */
export interface HomeRouteVisibleViewportBounds {
  /** 可见区域左边。 */
  left: number;
  /** 可见区域顶边。 */
  top: number;
  /** 可见区域右边。 */
  right: number;
  /** 可见区域底边。 */
  bottom: number;
  /** 可见区域宽度。 */
  width: number;
  /** 可见区域高度。 */
  height: number;
}

/** 地址栏动画期间选择路线实际消费哪一份 viewport 快照的输入。 */
export interface HomeRouteRenderViewportSnapshotOptions {
  /** 上一次已经稳定并参与路线布局的快照。 */
  stableSnapshot: HomeRouteViewportSnapshot;
  /** 浏览器事件最近报告、等待稳定确认的候选快照。 */
  pendingSnapshot: HomeRouteViewportSnapshot;
  /** 当前是否仍处在只允许连续滚动、不允许重排路线的浏览器栏暂态。 */
  transient: boolean;
}

/** 首页路线面对 viewport 变化时需要采取的语义处理类别。 */
export type HomeRouteViewportChangeKind = "none" | "transient" | "effective";

/** 一帧路线更新中需要合并执行的浏览器工作。 */
export interface HomeRouteFrameRequest {
  /** 是否需要重新测量仅在真实响应式变化后才失效的页面几何。 */
  measureGeometry: boolean;
  /** 是否允许根据当前阅读位置提交章节与 URL hash。 */
  syncJourney: boolean;
  /** 是否需要在 Tooltip 打开时刷新其可见视口位置。 */
  placeTooltip: boolean;
}

/** 首页路线帧调度器的浏览器适配参数。 */
export interface HomeRouteFrameSchedulerOptions {
  /** 浏览器的动画帧入口；测试可传入可控队列。 */
  requestFrame: (callback: (timestamp: number) => void) => number;
  /** 每帧唯一的消费函数，接收该帧合并后的更新需求。 */
  update: (request: HomeRouteFrameRequest) => void;
}

/** 首页路线帧调度器暴露给 scroll、resize 与 VisualViewport 监听器的最小接口。 */
export interface HomeRouteFrameScheduler {
  /** 合并当前帧的更新需求；省略字段表示只要求连续列车绘制。 */
  request: (request?: Partial<HomeRouteFrameRequest>) => void;
}

/** 首页统一帧中一个可暂停的读写参与者；泛型值只在它自己的两个阶段之间传递。 */
export interface HomePageFrameParticipant<Measurement> {
  /** IntersectionObserver 等外部状态可让离屏章节完全跳过本帧。 */
  isActive?: () => boolean;
  /** 读取本帧所需 DOM 几何并返回不可变结果；这里不得写 DOM。 */
  read: (request: Readonly<HomeRouteFrameRequest>, timestamp: number) => Measurement;
  /** 在所有参与者完成读取后提交状态；这里消费自己的测量结果。 */
  write: (
    measurement: Measurement,
    request: Readonly<HomeRouteFrameRequest>,
    timestamp: number,
  ) => void;
}

/** 首页统一帧协调器的浏览器适配参数。 */
export interface HomePageFrameCoordinatorOptions {
  /** 唯一的浏览器动画帧入口；测试传入可控队列以证明合帧顺序。 */
  requestFrame: (callback: (timestamp: number) => void) => number;
  /** 当前文档滚动坐标；连续采样让 Safari 稀疏 scroll 事件之间仍能取得合成器位置。 */
  readScrollPosition?: () => { x: number; y: number };
}

/** 首页各滚动章节共享的最小协调接口。 */
export interface HomePageFrameCoordinator extends HomeRouteFrameScheduler {
  /** 注册一个读写参与者；返回函数用于页面卸载或测试时解除注册。 */
  register: <Measurement>(participant: HomePageFrameParticipant<Measurement>) => () => void;
  /** 启动有界连续滚动采样；位置稳定后协调器自动休眠。 */
  requestScroll: (request?: Partial<HomeRouteFrameRequest>) => void;
}

/** 协调器内部以 unknown 保存不同参与者的测量类型，再由各自适配闭包恢复具体类型。 */
interface RegisteredHomePageFrameParticipant {
  /** 当前参与者是否需要消费本帧。 */
  isActive?: () => boolean;
  /** 擦除泛型后的读取阶段。 */
  read: (request: Readonly<HomeRouteFrameRequest>, timestamp: number) => unknown;
  /** 擦除泛型后的写入阶段。 */
  write: (
    measurement: unknown,
    request: Readonly<HomeRouteFrameRequest>,
    timestamp: number,
  ) => void;
}

/** VisualViewport 连续事件中的亚像素抖动不会构成新的布局或语义状态。 */
const HOME_ROUTE_VIEWPORT_EPSILON = 0.5;

/** 稀疏 scroll 事件后继续观察约七帧，覆盖 iPhone Safari 的事件间隔并在停稳后及时休眠。 */
const HOME_PAGE_SCROLL_IDLE_MS = 120;

/** 惯性滚动的累积位移阈值远小于一个设备像素，既保留衰减尾段，也忽略浮点读数噪声。 */
const HOME_PAGE_SCROLL_POSITION_EPSILON = 0.01;

/** 建立新的空请求，避免已消费批次与下一帧共享可变对象。 */
const createEmptyHomeRouteFrameRequest = (): HomeRouteFrameRequest => ({
  measureGeometry: false,
  syncJourney: false,
  placeTooltip: false,
});

/** 用 OR 合并同一帧的工作需求，后到的轻量事件不能覆盖较强请求。 */
const mergeHomeRouteFrameRequest = (
  current: HomeRouteFrameRequest,
  next: Partial<HomeRouteFrameRequest>,
): HomeRouteFrameRequest => ({
  measureGeometry: current.measureGeometry || next.measureGeometry === true,
  syncJourney: current.syncJourney || next.syncJourney === true,
  placeTooltip: current.placeTooltip || next.placeTooltip === true,
});

/** 在动画帧开头一次读取布局视口与 VisualViewport，后续路线计算只消费这份不可变快照。 */
export const readHomeRouteViewportSnapshot = (
  browserWindow: HomeRouteViewportSource = window,
): HomeRouteViewportSnapshot => {
  const visualViewport = browserWindow.visualViewport;

  return {
    layoutWidth: browserWindow.innerWidth,
    layoutHeight: browserWindow.innerHeight,
    visualWidth: visualViewport?.width ?? browserWindow.innerWidth,
    visualHeight: visualViewport?.height ?? browserWindow.innerHeight,
    visualOffsetLeft: visualViewport?.offsetLeft ?? 0,
    visualOffsetTop: visualViewport?.offsetTop ?? 0,
    visualScale: visualViewport?.scale ?? 1,
    orientationAngle: browserWindow.screen?.orientation?.angle ?? browserWindow.orientation ?? 0,
  };
};

/** 从共享快照派生列车安全锚点与 Tooltip 使用的完整可见视口矩形。 */
export const getHomeRouteVisibleViewportBounds = (
  snapshot: HomeRouteViewportSnapshot,
): HomeRouteVisibleViewportBounds => ({
  left: snapshot.visualOffsetLeft,
  top: snapshot.visualOffsetTop,
  right: snapshot.visualOffsetLeft + snapshot.visualWidth,
  bottom: snapshot.visualOffsetTop + snapshot.visualHeight,
  width: snapshot.visualWidth,
  height: snapshot.visualHeight,
});

/**
 * 区分 Safari 地址栏高度动画与真实响应式变化。
 * 暂态只允许连续视觉更新；宽度、方向或缩放变化才允许调用方重测几何并提交语义。
 */
export const classifyHomeRouteViewportChange = (
  previous: HomeRouteViewportSnapshot,
  next: HomeRouteViewportSnapshot,
): HomeRouteViewportChangeKind => {
  const changed = (left: number, right: number) =>
    Math.abs(left - right) > HOME_ROUTE_VIEWPORT_EPSILON;
  const effectiveGeometryChanged =
    changed(previous.layoutWidth, next.layoutWidth) ||
    changed(previous.visualWidth, next.visualWidth) ||
    previous.visualScale !== next.visualScale ||
    previous.orientationAngle !== next.orientationAngle;

  if (effectiveGeometryChanged) {
    return "effective";
  }

  const visibleHeightChanged =
    changed(previous.layoutHeight, next.layoutHeight) ||
    changed(previous.visualHeight, next.visualHeight) ||
    changed(previous.visualOffsetLeft, next.visualOffsetLeft) ||
    changed(previous.visualOffsetTop, next.visualOffsetTop);

  return visibleHeightChanged ? "transient" : "none";
};

/**
 * 让 Safari 地址栏暂态跨越其间的普通滚动帧，并只在稳定计时或真实响应式变化后释放。
 * 这样章节与 URL hash 不会在浏览器栏仍运动时用中间 viewport 反复切换。
 */
export const getHomeRouteViewportTransientState = (
  wasTransient: boolean,
  change: HomeRouteViewportChangeKind,
  settled = false,
): boolean => {
  if (settled || change === "effective") {
    return false;
  }

  return change === "transient" || wasTransient;
};

/**
 * Safari 地址栏动画期间冻结路线布局使用的 viewport。
 * 待稳定计时结束后再一次性采用新快照，避免局部车与全局路径车在每个工具栏帧反复交接。
 */
export const getHomeRouteRenderViewportSnapshot = ({
  stableSnapshot,
  pendingSnapshot,
  transient,
}: HomeRouteRenderViewportSnapshotOptions): HomeRouteViewportSnapshot =>
  transient ? stableSnapshot : pendingSnapshot;

/**
 * 把同一浏览器帧内的 scroll、resize 与 VisualViewport 请求收敛成一次更新。
 * 布尔需求使用 OR 合并，避免后到的轻量请求覆盖已经排队的几何或语义工作。
 */
export const createHomeRouteFrameScheduler = ({
  requestFrame,
  update,
}: HomeRouteFrameSchedulerOptions): HomeRouteFrameScheduler => {
  let framePending = false;
  let pendingRequest = createEmptyHomeRouteFrameRequest();

  /** 把不同事件入口的布尔需求收拢，保留同一批次中最强的工作。 */
  const mergeRequest = (request: Partial<HomeRouteFrameRequest>) => {
    pendingRequest = mergeHomeRouteFrameRequest(pendingRequest, request);
  };
  /** 取走当前批次并先清空状态，允许 update 内部安全排下一帧。 */
  const consumeRequest = () => {
    const requestForFrame = pendingRequest;
    pendingRequest = createEmptyHomeRouteFrameRequest();
    update(requestForFrame);
  };

  return {
    request: (request = {}) => {
      mergeRequest(request);

      if (framePending) {
        return;
      }

      framePending = true;
      requestFrame(() => {
        framePending = false;
        consumeRequest();
      });
    },
  };
};

/**
 * 建立首页唯一的两阶段帧协调器。
 * 每帧先锁定活跃参与者并完成所有 reads，随后才按同一顺序执行 writes；写阶段产生的新请求会进入下一帧。
 */
export const createHomePageFrameCoordinator = ({
  requestFrame,
  readScrollPosition = () => ({ x: window.scrollX, y: window.scrollY }),
}: HomePageFrameCoordinatorOptions): HomePageFrameCoordinator => {
  const participants = new Set<RegisteredHomePageFrameParticipant>();
  let framePending = false;
  let pendingRequest = createEmptyHomeRouteFrameRequest();
  let scrollSamplingActive = false;
  let scrollSamplingRenewed = false;
  let scrollSamplingRequest = createEmptyHomeRouteFrameRequest();
  let lastScrollPosition: { x: number; y: number } | undefined;
  let lastScrollMotionTimestamp = 0;

  /** 所有入口都只可排队同一个协调帧，避免连续采样与事件请求生成两条 rAF 链。 */
  const scheduleFrame = () => {
    if (framePending) {
      return;
    }

    framePending = true;
    requestFrame(consumeFrame);
  };

  /** 执行一个不可分割的读写批次，注册变化只影响下一帧。 */
  function consumeFrame(timestamp: number) {
    framePending = false;
    const scrollPosition = scrollSamplingActive ? readScrollPosition() : undefined;
    const scrollPositionChanged =
      scrollPosition !== undefined &&
      (lastScrollPosition === undefined ||
        Math.abs(scrollPosition.x - lastScrollPosition.x) > HOME_PAGE_SCROLL_POSITION_EPSILON ||
        Math.abs(scrollPosition.y - lastScrollPosition.y) > HOME_PAGE_SCROLL_POSITION_EPSILON);
    const requestForFrame = pendingRequest;
    pendingRequest = createEmptyHomeRouteFrameRequest();
    const activeParticipants = Array.from(participants).filter(
      (participant) => participant.isActive?.() !== false,
    );
    const measurements = activeParticipants.map((participant) =>
      participant.read(requestForFrame, timestamp),
    );

    activeParticipants.forEach((participant, index) => {
      participant.write(measurements[index], requestForFrame, timestamp);
    });

    if (!scrollSamplingActive || !scrollPosition) {
      return;
    }

    if (scrollSamplingRenewed || scrollPositionChanged) {
      lastScrollMotionTimestamp = timestamp;
    }
    scrollSamplingRenewed = false;
    if (scrollPositionChanged) {
      /* 未过阈值时保留旧基准，让连续亚像素位移累积后仍能续订采样窗口。 */
      lastScrollPosition = scrollPosition;
    }

    if (timestamp - lastScrollMotionTimestamp < HOME_PAGE_SCROLL_IDLE_MS) {
      pendingRequest = mergeHomeRouteFrameRequest(pendingRequest, scrollSamplingRequest);
      scheduleFrame();
      return;
    }

    scrollSamplingActive = false;
    scrollSamplingRequest = createEmptyHomeRouteFrameRequest();
    lastScrollPosition = undefined;
    lastScrollMotionTimestamp = 0;
  }

  return {
    register: <Measurement>(participant: HomePageFrameParticipant<Measurement>) => {
      const registeredParticipant: RegisteredHomePageFrameParticipant = {
        isActive: participant.isActive,
        read: participant.read,
        write: (measurement, request, timestamp) => {
          participant.write(measurement as Measurement, request, timestamp);
        },
      };
      participants.add(registeredParticipant);

      return () => participants.delete(registeredParticipant);
    },
    request: (request = {}) => {
      pendingRequest = mergeHomeRouteFrameRequest(pendingRequest, request);
      scheduleFrame();
    },
    requestScroll: (request = {}) => {
      pendingRequest = mergeHomeRouteFrameRequest(pendingRequest, request);
      scrollSamplingRequest = mergeHomeRouteFrameRequest(scrollSamplingRequest, {
        syncJourney: request.syncJourney,
        placeTooltip: request.placeTooltip,
      });
      scrollSamplingActive = true;
      scrollSamplingRenewed = true;
      scheduleFrame();
    },
  };
};

/** 当前静态首页生命周期内共享的浏览器协调器；Astro 多个脚本入口会复用同一 ESM 实例。 */
let sharedHomePageFrameCoordinator: HomePageFrameCoordinator | undefined;

/**
 * 取得首页唯一浏览器帧协调器。
 * 延迟创建避免 SSG 构建触碰 window，并让各 Astro 组件在客户端按任意加载顺序安全注册。
 */
export const getHomePageFrameCoordinator = (): HomePageFrameCoordinator => {
  sharedHomePageFrameCoordinator ??= createHomePageFrameCoordinator({
    requestFrame: (callback) => window.requestAnimationFrame(callback),
  });

  return sharedHomePageFrameCoordinator;
};
