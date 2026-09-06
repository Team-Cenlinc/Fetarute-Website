import { getHomePageFrameCoordinator } from "@/data/home-route-viewport";

let disposeHomeGallery: (() => void) | undefined;

/**
 * 在 Gallery 进入预加载视口后接入横向叙事。
 * 所有监听与 observer 都由返回值释放，避免离开当前文档后保留滚动工作。
 */
export function setupHomeGallery(): () => void {
  if (disposeHomeGallery) return disposeHomeGallery;

  const homeGallery = document.querySelector<HTMLElement>("[data-home-gallery]");
  const homeGalleryStage = document.querySelector<HTMLElement>("[data-home-gallery-stage]");
  const homeGalleryTrack = document.querySelector<HTMLElement>("[data-home-gallery-track]");
  const homeGalleryItems = Array.from(
    document.querySelectorAll<HTMLElement>("[data-home-gallery-item]"),
  );

  if (!homeGallery || !homeGalleryStage || !homeGalleryTrack || homeGalleryItems.length === 0) {
    return () => {};
  }

  const eventController = new AbortController();
  const { signal } = eventController;
  /** Gallery 只在桌面映射横向轨道；小屏保留单一纵向阅读轴。 */
  const reducedGalleryMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopGalleryQuery = window.matchMedia("(min-width: 1024px)");
  let homeGalleryScrollDistance = 0;
  /** 横轴输入静默后恢复全站 smooth；连续 wheel 期间只允许一份计时器拥有清理权。 */
  let horizontalInputReleaseTimer: number | undefined;

  /** 将滚动进度限制在首尾图片之间，避免浏览器弹性滚动把图片带出轨道。 */
  const clampHomeGalleryProgress = (value: number) => Math.min(Math.max(value, 0), 1);
  /** Gallery 单帧读取结果；统一协调器会在任何章节写 DOM 之前锁定这些数值。 */
  interface HomeGalleryFrameMeasurement {
    /** 本帧是否启用桌面横向 sticky 叙事。 */
    enhanced: boolean;
    /** sticky 舞台是否正在占据当前视口。 */
    pinned: boolean;
    /** 横向轨道需要映射的完整像素距离。 */
    scrollDistance: number;
    /** 当前受控进度；小屏与减少动态回退为 undefined。 */
    progress?: number;
    /** 本帧唯一展示说明文字的图片索引。 */
    activeItemIndex: number;
  }

  /** 获取 Gallery 在文档中的稳定起点，避免 sticky 后的 viewport 坐标参与进度计算。 */
  const getHomeGalleryDocumentTop = () => homeGallery.getBoundingClientRect().top + window.scrollY;

  /** 非受控模式按当前阅读轴取得图片中心；小屏比较纵向位置，桌面回退列表比较横向位置。 */
  const getHomeGalleryItemCenter = (item: HTMLElement) => {
    const figure = item.querySelector<HTMLElement>(".home-gallery__figure");
    const bounds = (figure ?? item).getBoundingClientRect();

    return desktopGalleryQuery.matches
      ? bounds.left + bounds.width / 2
      : bounds.top + bounds.height / 2;
  };

  /** 读取当前焦点图片索引；桌面按受控进度取值，小屏按纵向阅读线选择。 */
  const getHomeGalleryActiveItemIndex = (controlledProgress?: number) => {
    const activeItem =
      controlledProgress === undefined
        ? homeGalleryItems.reduce((closestItem, item) => {
            const viewportCenter = desktopGalleryQuery.matches
              ? window.innerWidth / 2
              : window.innerHeight / 2;
            const itemDistance = Math.abs(getHomeGalleryItemCenter(item) - viewportCenter);
            const closestDistance = Math.abs(
              getHomeGalleryItemCenter(closestItem) - viewportCenter,
            );

            return itemDistance < closestDistance ? item : closestItem;
          })
        : homeGalleryItems[
            Math.min(
              homeGalleryItems.length - 1,
              Math.round(controlledProgress * (homeGalleryItems.length - 1)),
            )
          ];

    return Math.max(0, homeGalleryItems.indexOf(activeItem));
  };

  /** 只在图片焦点确实改变时更新说明文字，避免每个滚动帧重写相同 dataset。 */
  const setHomeGalleryActiveItem = (activeItemIndex: number) => {
    homeGalleryItems.forEach((item, index) => {
      if (index === activeItemIndex) {
        if (item.dataset.homeGalleryCaptionVisible !== "true") {
          item.dataset.homeGalleryCaptionVisible = "true";
        }
      } else if (item.hasAttribute("data-home-gallery-caption-visible")) {
        delete item.dataset.homeGalleryCaptionVisible;
      }
    });
  };

  /** 在统一帧 read 阶段读取 Gallery 几何，不写 sticky、位移或图片状态。 */
  const readHomeGalleryFrame = (measureGeometry: boolean): HomeGalleryFrameMeasurement => {
    const scrollDistance = measureGeometry
      ? Math.max(0, homeGalleryTrack.scrollWidth - homeGalleryStage.clientWidth)
      : homeGalleryScrollDistance;
    const enhanced =
      desktopGalleryQuery.matches && !reducedGalleryMotionQuery.matches && scrollDistance > 0;

    if (!enhanced) {
      return {
        enhanced,
        pinned: false,
        scrollDistance,
        activeItemIndex: getHomeGalleryActiveItemIndex(),
      };
    }

    const scrollRange = Math.max(1, homeGallery.offsetHeight - homeGalleryStage.clientHeight);
    const galleryTop = getHomeGalleryDocumentTop();
    const progress = clampHomeGalleryProgress((window.scrollY - galleryTop) / scrollRange);
    const galleryBounds = homeGallery.getBoundingClientRect();
    const stageBounds = homeGalleryStage.getBoundingClientRect();
    const pinned =
      Math.abs(stageBounds.top) <= 1 &&
      galleryBounds.top <= 0 &&
      galleryBounds.bottom >= window.innerHeight;

    return {
      enhanced,
      pinned,
      scrollDistance,
      progress,
      activeItemIndex: getHomeGalleryActiveItemIndex(progress),
    };
  };

  /** 在统一帧 write 阶段一次提交 Gallery sticky、位移和说明文字状态。 */
  const writeHomeGalleryFrame = (measurement: HomeGalleryFrameMeasurement) => {
    const wasEnhanced = homeGallery.dataset.homeGalleryEnhanced === "true";
    homeGalleryScrollDistance = measurement.scrollDistance;
    const scrollDistanceValue = `${measurement.scrollDistance}px`;
    const offsetValue = measurement.enhanced
      ? `${-measurement.scrollDistance * (measurement.progress ?? 0)}px`
      : "0px";

    if (
      homeGallery.style.getPropertyValue("--home-gallery-scroll-distance") !== scrollDistanceValue
    ) {
      homeGallery.style.setProperty("--home-gallery-scroll-distance", scrollDistanceValue);
    }
    if (homeGallery.dataset.homeGalleryEnhanced !== String(measurement.enhanced)) {
      homeGallery.dataset.homeGalleryEnhanced = String(measurement.enhanced);
    }
    if (homeGallery.dataset.homeGalleryCaptionReady !== "true") {
      homeGallery.dataset.homeGalleryCaptionReady = "true";
    }
    if (document.documentElement.hasAttribute("data-home-gallery-pinned") !== measurement.pinned) {
      document.documentElement.toggleAttribute("data-home-gallery-pinned", measurement.pinned);
    }
    const trackTransform = `translate3d(${offsetValue}, 0, 0)`;
    if (homeGalleryTrack.style.transform !== trackTransform) {
      homeGalleryTrack.style.transform = trackTransform;
    }
    if (measurement.enhanced && !wasEnhanced && homeGalleryStage.scrollLeft !== 0) {
      // 从原生横向回到 sticky 模式时只清理一次旧位置，不能与 transform 叠加。
      homeGalleryStage.scrollLeft = 0;
    }
    setHomeGalleryActiveItem(measurement.activeItemIndex);
  };

  const galleryFrameCoordinator = getHomePageFrameCoordinator();
  let isHomeGalleryActive = true;
  const unregisterHomeGalleryFrame = galleryFrameCoordinator.register({
    isActive: () => isHomeGalleryActive,
    read: ({ measureGeometry }) => readHomeGalleryFrame(measureGeometry),
    write: writeHomeGalleryFrame,
  });
  const homeGalleryVisibilityObserver = new IntersectionObserver(
    (entries) => {
      /* 单个相册可能同批收到离屏与入屏记录，以最后状态决定是否恢复逐帧更新。 */
      const entry = entries.at(-1);
      isHomeGalleryActive = entry?.isIntersecting ?? false;
      if (isHomeGalleryActive) {
        requestHomeGalleryMeasurement();
      }
    },
    { rootMargin: "100% 0px" },
  );
  homeGalleryVisibilityObserver.observe(homeGallery);

  /** 尺寸或媒体条件变化只声明几何失效，实际读取与写入仍进入统一帧。 */
  const requestHomeGalleryMeasurement = () => {
    galleryFrameCoordinator.request({ measureGeometry: true });
  };

  /** 连续滚动只申请统一帧，不在事件回调中同步读取 sticky 几何。 */
  const requestHomeGalleryFrame = () => {
    galleryFrameCoordinator.request();
  };

  /**
   * Gallery 固定时只接管明确以横轴为主的触控板输入。
   * 直接写入滚动根节点可绕过全局 smooth 行为；纵轴主导的手势仍完整交给浏览器。
   */
  const applyHomeGalleryHorizontalProgress = (event: WheelEvent) => {
    if (
      event.ctrlKey ||
      reducedGalleryMotionQuery.matches ||
      homeGallery.dataset.homeGalleryEnhanced !== "true" ||
      Math.abs(event.deltaX) <= Math.max(0.5, Math.abs(event.deltaY))
    ) {
      return;
    }

    const galleryBounds = homeGallery.getBoundingClientRect();
    const stageBounds = homeGalleryStage.getBoundingClientRect();
    const isGalleryPinned =
      Math.abs(stageBounds.top) <= 1 &&
      galleryBounds.top <= 0 &&
      galleryBounds.bottom >= window.innerHeight;

    if (!isGalleryPinned) {
      return;
    }

    const deltaScale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
    const scrollingElement = document.scrollingElement;

    if (!scrollingElement) {
      return;
    }

    const galleryTop = getHomeGalleryDocumentTop();
    const galleryEnd =
      galleryTop + Math.max(1, homeGallery.offsetHeight - homeGalleryStage.clientHeight);
    const nextScrollTop = Math.min(
      galleryEnd,
      Math.max(galleryTop, scrollingElement.scrollTop + event.deltaX * deltaScale),
    );

    event.preventDefault();
    document.documentElement.dataset.homeGalleryHorizontalInput = "true";
    window.clearTimeout(horizontalInputReleaseTimer);
    horizontalInputReleaseTimer = window.setTimeout(() => {
      horizontalInputReleaseTimer = undefined;
      document.documentElement.removeAttribute("data-home-gallery-horizontal-input");
    }, 80);
    scrollingElement.scrollTop = nextScrollTop;
    requestHomeGalleryFrame();
  };

  const homeGalleryResizeObserver = new ResizeObserver(requestHomeGalleryMeasurement);
  homeGalleryResizeObserver.observe(homeGalleryStage);
  homeGalleryResizeObserver.observe(homeGalleryTrack);

  homeGalleryStage.addEventListener("scroll", requestHomeGalleryFrame, { passive: true, signal });
  homeGalleryStage.addEventListener("wheel", applyHomeGalleryHorizontalProgress, {
    passive: false,
    signal,
  });
  reducedGalleryMotionQuery.addEventListener("change", requestHomeGalleryMeasurement, { signal });
  desktopGalleryQuery.addEventListener("change", requestHomeGalleryMeasurement, { signal });
  window.addEventListener("pageshow", requestHomeGalleryMeasurement, { signal });

  const dispose = (): void => {
    eventController.abort();
    document.documentElement.removeAttribute("data-home-gallery-pinned");
    document.documentElement.removeAttribute("data-home-gallery-horizontal-input");
    window.clearTimeout(horizontalInputReleaseTimer);
    homeGalleryResizeObserver.disconnect();
    homeGalleryVisibilityObserver.disconnect();
    unregisterHomeGalleryFrame();
    disposeHomeGallery = undefined;
  };

  requestHomeGalleryMeasurement();
  disposeHomeGallery = dispose;
  return dispose;
}
