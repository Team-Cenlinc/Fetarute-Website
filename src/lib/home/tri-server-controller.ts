import {
  getHomeTriServerCarouselAutoplayNextIndex,
  homeTriServerCarouselAutoplayIntervalMs,
  prepareHomeTriServerImage,
  shuffleHomeTriServerItems,
} from "@/data/home-tri-server-media";
import { getHomePageFrameCoordinator } from "@/data/home-route-viewport";

let cleanup: (() => void) | undefined;

export function setupHomeTriServer() {
  if (cleanup) return cleanup;
  const homeTriServer = document.querySelector<HTMLElement>("[data-home-tri-server]");

  if (homeTriServer) {
    const desktopTriServerQuery = window.matchMedia("(min-width: 1024px)");
    const reducedTriServerMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fineTriServerPointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const desktopMediaHost = homeTriServer.querySelector<HTMLElement>(
      "[data-home-tri-server-desktop-media-host]",
    );
    const serverLoading = homeTriServer.querySelector<HTMLElement>(
      "[data-home-tri-server-server-loading]",
    );
    const serverLoadingCopy = serverLoading?.querySelector<HTMLElement>(
      "[data-home-tri-server-server-loading-copy]",
    );
    const serverStops = Array.from(
      homeTriServer.querySelectorAll<HTMLElement>("[data-home-tri-server-stop]"),
    );
    const triServerStage = homeTriServer.querySelector<HTMLElement>(".home-tri-server__stage");
    const mediaPanels = Array.from(
      homeTriServer.querySelectorAll<HTMLElement>("[data-home-tri-server-media-panel]"),
    );
    const mobileMediaHostById = new Map(
      Array.from(
        homeTriServer.querySelectorAll<HTMLElement>("[data-home-tri-server-mobile-media-host]"),
      ).map((host) => [host.dataset.homeTriServerMobileMediaHost, host]),
    );
    const mapLaunchButtonById = new Map(
      Array.from(
        homeTriServer.querySelectorAll<HTMLButtonElement>("[data-home-tri-server-map-launch]"),
      ).map((button) => [button.dataset.homeTriServerMapLaunch, button]),
    );
    const preparePanelForDisplayById = new Map<string, () => Promise<boolean>>();
    const frameCoordinator = getHomePageFrameCoordinator();
    let activeServerId = serverStops[0]?.dataset.homeTriServerStop;
    let requestedServerId = activeServerId;
    let isTriServerActive = true;
    let activeServerRequest = 0;
    let pendingActiveServerPromise: Promise<boolean> | undefined;
    let serverLoadingResetTimer = 0;
    let activeServerTransitionTimer = 0;
    let activeServerTransitionSerial = 0;
    let settleActiveServerTransition: ((didComplete: boolean) => void) | undefined;

    /**
     * 取消尚未完成的桌面换景，并恢复唯一活动面板。
     * 快速滚过多个服务器时必须先清理旧动画，否则两个目标面板可能同时停留在车窗里。
     */
    const cancelActiveServerTransition = () => {
      activeServerTransitionSerial += 1;
      window.clearTimeout(activeServerTransitionTimer);
      activeServerTransitionTimer = 0;

      const settleTransition = settleActiveServerTransition;
      settleActiveServerTransition = undefined;

      mediaPanels.forEach((panel) => {
        delete panel.dataset.serverTransition;
        panel.hidden = panel.dataset.homeTriServerMediaPanel !== activeServerId;
      });

      settleTransition?.(false);
    };

    /** 让桌面服务器切换的等待与失败反馈复用同一状态胶囊，旧车窗始终留在原位。 */
    const setServerLoadingState = (state: "idle" | "loading" | "error") => {
      window.clearTimeout(serverLoadingResetTimer);

      if (!serverLoading || !serverLoadingCopy) {
        return;
      }

      serverLoading.hidden = state === "idle";
      serverLoading.dataset.state = state;
      serverLoadingCopy.textContent =
        state === "error"
          ? (serverLoading.dataset.errorLabel ?? "")
          : (serverLoading.dataset.loadingLabel ?? "");

      if (state === "error") {
        serverLoadingResetTimer = window.setTimeout(() => setServerLoadingState("idle"), 1800);
      }
    };

    /** 同步地图卡片的启动与退出状态，让文字、图标和辅助技术表达同一个动作。 */
    const setMapCardState = (panel: HTMLElement, isOpen: boolean) => {
      const serverId = panel.dataset.homeTriServerMediaPanel;
      const launchButton = serverId ? mapLaunchButtonById.get(serverId) : undefined;
      const card = serverId
        ? homeTriServer.querySelector<HTMLElement>(`[data-home-tri-server-map-card="${serverId}"]`)
        : undefined;
      const label = launchButton?.querySelector<HTMLElement>(
        "[data-home-tri-server-map-launch-label]",
      );
      const launchIcon = launchButton?.querySelector<HTMLElement>(
        '[data-map-button-icon="launch"]',
      );
      const closeIcon = launchButton?.querySelector<HTMLElement>('[data-map-button-icon="close"]');

      if (!launchButton || !label) {
        return;
      }

      label.textContent = isOpen
        ? (launchButton.dataset.mapCloseLabel ?? "")
        : (launchButton.dataset.mapLaunchLabel ?? "");
      launchButton.setAttribute("aria-pressed", String(isOpen));
      launchIcon?.toggleAttribute("hidden", isOpen);
      closeIcon?.toggleAttribute("hidden", !isOpen);
      card?.toggleAttribute("data-map-open", isOpen);
    };

    /** 关闭按需创建的 iframe，释放地图切片与事件监听，并把焦点还给启动卡。 */
    const closeInteractiveMap = (panel: HTMLElement, restoreFocus = false) => {
      const overlay = panel.querySelector<HTMLElement>("[data-home-tri-server-map-overlay]");
      const frameHost = panel.querySelector<HTMLElement>("[data-home-tri-server-map-frame]");
      const loading = panel.querySelector<HTMLElement>("[data-home-tri-server-map-loading]");
      const serverId = panel.dataset.homeTriServerMediaPanel;
      const launchButton = serverId ? mapLaunchButtonById.get(serverId) : undefined;

      if (!overlay || !frameHost) {
        return;
      }

      frameHost.replaceChildren();
      overlay.hidden = true;
      loading?.removeAttribute("hidden");
      delete panel.dataset.mapInteractive;
      delete panel.dataset.mapLoadState;
      setMapCardState(panel, false);

      if (restoreFocus) {
        launchButton?.focus();
      }
    };

    /** 提交当前文本站和桌面车窗；调用前必须确认目标面板首帧已经可绘制。 */
    const commitActiveServer = (serverId: string) => {
      activeServerId = serverId;
      requestedServerId = serverId;
      homeTriServer.dataset.activeServer = serverId;

      serverStops.forEach((stop) => {
        stop.dataset.active = String(stop.dataset.homeTriServerStop === serverId);
      });

      let shouldMoveFocus = false;
      let activePanel: HTMLElement | undefined;

      mediaPanels.forEach((panel) => {
        const isActive = panel.dataset.homeTriServerMediaPanel === serverId;

        if (!isActive) {
          shouldMoveFocus ||= panel.contains(document.activeElement);
          closeInteractiveMap(panel);
        } else {
          activePanel = panel;
        }

        panel.hidden = !isActive;
      });

      if (shouldMoveFocus) {
        activePanel
          ?.querySelector<HTMLElement>("[data-home-tri-server-carousel]")
          ?.focus({ preventScroll: true });
      }
    };

    /**
     * 在目标首图可绘制后交接桌面车窗：旧景先加速退场，新景稍后减速落位。
     * 移动端和减少动态偏好继续即时提交，避免为原生纵向阅读增加不必要的运动。
     */
    const transitionActiveServer = (serverId: string, requestId: number): Promise<boolean> => {
      const previousPanel = mediaPanels.find(
        (panel) => panel.dataset.homeTriServerMediaPanel === activeServerId,
      );
      const nextPanel = mediaPanels.find(
        (panel) => panel.dataset.homeTriServerMediaPanel === serverId,
      );

      if (
        !desktopTriServerQuery.matches ||
        reducedTriServerMotionQuery.matches ||
        !previousPanel ||
        !nextPanel
      ) {
        commitActiveServer(serverId);
        return Promise.resolve(true);
      }

      cancelActiveServerTransition();
      const previousIndex = mediaPanels.indexOf(previousPanel);
      const nextIndex = mediaPanels.indexOf(nextPanel);
      const direction = nextIndex >= previousIndex ? "forward" : "backward";
      const transitionSerial = activeServerTransitionSerial;

      nextPanel.hidden = false;
      previousPanel.dataset.serverTransition = `leaving-${direction}`;
      nextPanel.dataset.serverTransition = `entering-${direction}`;

      return new Promise((resolve) => {
        settleActiveServerTransition = resolve;
        // CSS 换景最长 360ms；额外 20ms 只用于确保最终 hidden 状态落在动画完成之后。
        activeServerTransitionTimer = window.setTimeout(() => {
          if (
            transitionSerial !== activeServerTransitionSerial ||
            requestId !== activeServerRequest
          ) {
            resolve(false);
            return;
          }

          activeServerTransitionTimer = 0;
          settleActiveServerTransition = undefined;
          commitActiveServer(serverId);
          mediaPanels.forEach((panel) => delete panel.dataset.serverTransition);
          resolve(true);
        }, 380);
      });
    };

    /**
     * 切换服务器前等待目标车窗的当前图片完成解码。
     * 小屏同时展示三组媒体，无需隐藏面板；桌面则保留旧车窗并显示等待反馈。
     */
    const setActiveServer = (serverId: string | undefined): Promise<boolean> => {
      if (!serverId) {
        return Promise.resolve(false);
      }

      if (!desktopTriServerQuery.matches) {
        if (serverId !== activeServerId) {
          activeServerId = serverId;
          requestedServerId = serverId;
          homeTriServer.dataset.activeServer = serverId;
          serverStops.forEach((stop) => {
            stop.dataset.active = String(stop.dataset.homeTriServerStop === serverId);
          });
        }

        return Promise.resolve(true);
      }

      if (serverId === requestedServerId && pendingActiveServerPromise) {
        return pendingActiveServerPromise;
      }

      if (serverId === activeServerId) {
        cancelActiveServerTransition();
        requestedServerId = serverId;
        activeServerRequest += 1;
        pendingActiveServerPromise = undefined;
        setServerLoadingState("idle");
        return Promise.resolve(true);
      }

      cancelActiveServerTransition();
      requestedServerId = serverId;
      const requestId = ++activeServerRequest;
      const preparePanel = preparePanelForDisplayById.get(serverId);
      setServerLoadingState("loading");

      let serverRequestPromise: Promise<boolean>;
      serverRequestPromise = (preparePanel?.() ?? Promise.resolve(true))
        .then((isReady) => {
          if (requestId !== activeServerRequest || requestedServerId !== serverId) {
            return false;
          }

          if (!isReady) {
            requestedServerId = activeServerId;
            setServerLoadingState("error");
            return false;
          }

          setServerLoadingState("idle");
          return transitionActiveServer(serverId, requestId);
        })
        .then((didComplete) => {
          if (pendingActiveServerPromise === serverRequestPromise) {
            pendingActiveServerPromise = undefined;
          }

          return didComplete;
        });

      pendingActiveServerPromise = serverRequestPromise;
      return serverRequestPromise;
    };

    /**
     * 在统一帧 read 阶段用列车中心选择子服务器；列车未进站时回退正文阅读线。
     * 每个 stop 只读一次矩形，避免 reduce 内重复触发布局查询。
     */
    const readActiveServerFromScroll = () => {
      const routeTrain = document.querySelector<HTMLElement>(
        '[data-home-arrival-train][data-route-segment="tri-server"]',
      );
      const routeTrainBounds = routeTrain?.getBoundingClientRect();
      const readingLine =
        routeTrainBounds && routeTrain?.dataset.routeVisible === "true"
          ? routeTrainBounds.top + routeTrainBounds.height / 2
          : Math.max(120, (triServerStage?.offsetHeight ?? window.innerHeight) * 0.34);
      const measuredStops = serverStops.map((stop) => ({
        stop,
        bounds: stop.getBoundingClientRect(),
      }));
      const stopAtReadingLine = measuredStops.find(
        ({ bounds }) => bounds.top <= readingLine && bounds.bottom > readingLine,
      );
      const activeStop =
        stopAtReadingLine ??
        measuredStops.reduce((closestStop, candidate) => {
          const distance = Math.abs(
            candidate.bounds.top + candidate.bounds.height / 2 - readingLine,
          );
          const closestDistance = Math.abs(
            closestStop.bounds.top + closestStop.bounds.height / 2 - readingLine,
          );

          return distance < closestDistance ? candidate : closestStop;
        }, measuredStops[0]);

      return activeStop?.stop.dataset.homeTriServerStop;
    };

    /** 将同一份媒体面板放到桌面 sticky 车窗或小屏对应正文下方，避免重复图片请求。 */
    const syncMediaPlacement = () => {
      cancelActiveServerTransition();
      mediaPanels.forEach((panel) => closeInteractiveMap(panel));
      activeServerRequest += 1;
      pendingActiveServerPromise = undefined;
      requestedServerId = activeServerId;
      setServerLoadingState("idle");

      if (desktopTriServerQuery.matches && desktopMediaHost) {
        mediaPanels.forEach((panel) => desktopMediaHost.append(panel));
        mediaPanels.forEach((panel) => {
          panel.hidden = panel.dataset.homeTriServerMediaPanel !== activeServerId;
        });

        const prepareActivePanel = activeServerId
          ? preparePanelForDisplayById.get(activeServerId)
          : undefined;

        if (prepareActivePanel) {
          const requestId = activeServerRequest;
          setServerLoadingState("loading");
          void prepareActivePanel().then(() => {
            if (requestId === activeServerRequest) {
              setServerLoadingState("idle");
            }
          });
        }
      } else {
        mediaPanels.forEach((panel) => {
          const serverId = panel.dataset.homeTriServerMediaPanel;
          const mobileHost = serverId ? mobileMediaHostById.get(serverId) : undefined;

          if (mobileHost) {
            mobileHost.append(panel);
            panel.hidden = false;
          }
        });
      }

      frameCoordinator.request({ measureGeometry: true });
    };

    const unregisterFrameParticipant = frameCoordinator.register({
      isActive: () => isTriServerActive,
      read: readActiveServerFromScroll,
      write: (serverId) => void setActiveServer(serverId),
    });
    const triServerVisibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isTriServerActive = entry?.isIntersecting ?? false;
        if (isTriServerActive) {
          frameCoordinator.request();
        }
      },
      { rootMargin: "100% 0px" },
    );
    triServerVisibilityObserver.observe(homeTriServer);

    /** 每个媒体面板把 IntersectionObserver 结果映射回自己的自动播放状态。 */
    const panelVisibilityHandlers = new Map<Element, (entry: IntersectionObserverEntry) => void>();
    const panelVisibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => panelVisibilityHandlers.get(entry.target)?.(entry));
      },
      { threshold: [0, 0.55, 1] },
    );
    const mediaPanelObserverCleanup = new Set<() => void>();

    mediaPanels.forEach((panel) => {
      const carousel = panel.querySelector<HTMLElement>("[data-home-tri-server-carousel]");
      const slides = shuffleHomeTriServerItems(
        Array.from(panel.querySelectorAll<HTMLElement>("[data-home-tri-server-slide]")),
      );
      const previousButton = panel.querySelector<HTMLButtonElement>(
        "[data-home-tri-server-previous]",
      );
      const nextButton = panel.querySelector<HTMLButtonElement>("[data-home-tri-server-next]");
      const status = panel.querySelector<HTMLElement>("[data-home-tri-server-slide-status]");
      const imageLoading = panel.querySelector<HTMLElement>("[data-home-tri-server-image-loading]");
      const imageLoadingCopy = imageLoading?.querySelector<HTMLElement>(
        "[data-home-tri-server-image-loading-copy]",
      );
      const autoplayProgressFill = panel.querySelector<HTMLElement>(
        "[data-home-tri-server-autoplay-progress-fill]",
      );
      const serverId = panel.dataset.homeTriServerMediaPanel;
      const launchButton = serverId ? mapLaunchButtonById.get(serverId) : undefined;
      let pendingCarouselFrame = 0;
      let carouselScrollSettleTimer = 0;
      let imageLoadRequest = 0;
      let imageLoadResetTimer = 0;
      let isImageLoading = false;
      let imageLoadOwner: "autoplay" | "manual" | null = null;
      let autoplayTimer = 0;
      let autoplayCycleStartedAt = 0;
      let autoplayRemainingMs = homeTriServerCarouselAutoplayIntervalMs;
      let autoplayCycleRequest = 0;
      let autoplayAdvanceRequest = 0;
      let isAutoplayAdvancing = false;
      let isPanelMostlyVisible = false;
      let isPointerInsidePanel = false;
      let isPointerInteractingWithCarousel = false;
      let isFocusInsidePanel = false;

      if (!carousel || !previousButton || !nextButton || !status || slides.length === 0) {
        return;
      }

      const slidesList = panel.querySelector<HTMLOListElement>("[data-home-tri-server-slides]");

      if (slidesList && slides.length > 1) {
        slidesList.append(...slides);
      }

      /** 翻页请求期间锁住两个方向，避免重复点击启动相互竞争的图片解码。 */
      const updateCarouselControlState = (index: number) => {
        const isManualImageLoading = isImageLoading && imageLoadOwner !== "autoplay";
        previousButton.disabled = isManualImageLoading || index === 0;
        nextButton.disabled = isManualImageLoading || index === slides.length - 1;
      };

      /** 在车窗右下角同步 loading/error/idle；当前图片始终保留到目标帧可绘制为止。 */
      const setImageLoadState = (state: "idle" | "loading" | "error") => {
        window.clearTimeout(imageLoadResetTimer);
        isImageLoading = state === "loading";
        panel.dataset.imageLoadState = state;
        panel.setAttribute("aria-busy", String(isImageLoading));
        updateCarouselControlState(Number(panel.dataset.activeSlide ?? 0));
        syncAutoplayState();

        if (!imageLoading || !imageLoadingCopy) {
          return;
        }

        imageLoading.hidden = state === "idle";
        imageLoadingCopy.textContent =
          state === "error"
            ? (imageLoading.dataset.errorLabel ?? "")
            : (imageLoading.dataset.loadingLabel ?? "");
      };

      /** 让后完成的旧 decode 失效；用于手动操作抢占正在等待的自动翻页。 */
      const cancelPendingSlideRequest = () => {
        imageLoadRequest += 1;
        imageLoadOwner = null;
        autoplayAdvanceRequest += 1;
        isAutoplayAdvancing = false;

        if (isImageLoading) {
          setImageLoadState("idle");
        }
      };

      /** 更新公开序号、控制边界与状态文案；Carousel 不循环回绕。 */
      const setSlideIndex = (
        index: number,
        shouldScroll: boolean,
        scrollBehavior?: ScrollBehavior,
        shouldAnnounce = true,
      ) => {
        const nextIndex = Math.min(Math.max(index, 0), slides.length - 1);
        const slideStatusTemplate = status.dataset.slideStatusTemplate ?? "{current} / {total}";

        panel.dataset.activeSlide = String(nextIndex);
        updateCarouselControlState(nextIndex);
        status.setAttribute("aria-live", shouldAnnounce ? "polite" : "off");
        status.textContent = slideStatusTemplate
          .replace("{current}", String(nextIndex + 1))
          .replace("{total}", String(slides.length));

        if (shouldScroll) {
          carousel.scrollTo({
            left: slides[nextIndex]?.offsetLeft ?? 0,
            behavior: scrollBehavior ?? (reducedTriServerMotionQuery.matches ? "auto" : "smooth"),
          });
        }
      };

      /** 等待指定图片完成 decode，并统一维护 loading/error 状态。 */
      const prepareSlideIndex = async (
        index: number,
        requestOwner: "autoplay" | "manual" = "manual",
      ) => {
        const targetImage = slides[index]?.querySelector<HTMLImageElement>("img");

        if (!targetImage || (targetImage.complete && targetImage.naturalWidth > 0)) {
          return true;
        }

        const requestId = ++imageLoadRequest;
        imageLoadOwner = requestOwner;
        setImageLoadState("loading");
        const isReady = await prepareHomeTriServerImage(targetImage);

        if (requestId !== imageLoadRequest) {
          return false;
        }

        imageLoadOwner = null;
        setImageLoadState(isReady ? "idle" : "error");

        if (!isReady) {
          imageLoadResetTimer = window.setTimeout(() => setImageLoadState("idle"), 1800);
        }

        return isReady;
      };

      /** 用户请求新页时先完成目标图片 decode；失败时恢复到当前可用图片。 */
      const requestSlideIndex = async (
        index: number,
        shouldScroll = true,
        scrollBehavior?: ScrollBehavior,
        shouldAnnounce = true,
        requestOwner: "autoplay" | "manual" = "manual",
      ) => {
        const currentIndex = Number(panel.dataset.activeSlide ?? 0);
        const nextIndex = Math.min(Math.max(index, 0), slides.length - 1);

        if (isImageLoading || nextIndex === currentIndex) {
          return false;
        }

        const isReady = await prepareSlideIndex(nextIndex, requestOwner);

        if (isReady) {
          setSlideIndex(nextIndex, shouldScroll, scrollBehavior, shouldAnnounce);
          return true;
        }

        if (!shouldScroll) {
          setSlideIndex(currentIndex, true);
        }

        return false;
      };

      /** 重新从零绘制微型进度条；强制读取只发生在每个 6 秒周期或用户明确翻页后。 */
      function restartAutoplayProgress() {
        if (!autoplayProgressFill) {
          return;
        }

        autoplayProgressFill.style.animationName = "none";
        void autoplayProgressFill.offsetWidth;
        autoplayProgressFill.style.removeProperty("animation-name");
      }

      /** 只有用户正在观看且没有表达交互意图时才推进自动轮播。 */
      function shouldRunAutoplay() {
        return (
          slides.length > 1 &&
          Boolean(autoplayProgressFill) &&
          isPanelMostlyVisible &&
          !panel.hidden &&
          (!desktopTriServerQuery.matches ||
            !serverId ||
            homeTriServer?.dataset.activeServer === serverId) &&
          document.visibilityState === "visible" &&
          !reducedTriServerMotionQuery.matches &&
          !isImageLoading &&
          !isAutoplayAdvancing &&
          panel.dataset.mapInteractive !== "true" &&
          !isPointerInsidePanel &&
          !isPointerInteractingWithCarousel &&
          !isFocusInsidePanel
        );
      }

      /** 暂停时扣除已经流逝的时间，让进度条与下一次恢复保持同一剩余时长。 */
      function pauseAutoplayCycle() {
        if (autoplayTimer !== 0) {
          autoplayRemainingMs = Math.max(
            0,
            autoplayRemainingMs - (performance.now() - autoplayCycleStartedAt),
          );
          window.clearTimeout(autoplayTimer);
          autoplayTimer = 0;
        }

        panel.dataset.autoplayState =
          slides.length <= 1 || reducedTriServerMotionQuery.matches ? "disabled" : "paused";
      }

      /** 从当前剩余时间继续计时；自动回绕首张时瞬时归位，避免跨越整条长图片带。 */
      function resumeAutoplayCycle() {
        if (!shouldRunAutoplay()) {
          pauseAutoplayCycle();
          return;
        }

        if (autoplayTimer !== 0) {
          return;
        }

        panel.dataset.autoplayState = "running";
        autoplayCycleStartedAt = performance.now();
        const cycleRequest = ++autoplayCycleRequest;
        autoplayTimer = window.setTimeout(
          async () => {
            autoplayTimer = 0;
            autoplayRemainingMs = homeTriServerCarouselAutoplayIntervalMs;
            panel.dataset.autoplayState = "paused";

            const currentIndex = Number(panel.dataset.activeSlide ?? 0);
            const nextIndex = getHomeTriServerCarouselAutoplayNextIndex(
              currentIndex,
              slides.length,
            );
            const isWrappingToStart = currentIndex === slides.length - 1 && nextIndex === 0;
            const advanceRequest = ++autoplayAdvanceRequest;
            isAutoplayAdvancing = true;
            await requestSlideIndex(
              nextIndex,
              true,
              isWrappingToStart ? "auto" : undefined,
              false,
              "autoplay",
            );

            if (advanceRequest === autoplayAdvanceRequest) {
              isAutoplayAdvancing = false;
            }

            if (cycleRequest === autoplayCycleRequest) {
              resetAutoplayCycle();
            } else {
              syncAutoplayState();
            }
          },
          Math.max(0, autoplayRemainingMs),
        );
      }

      /** 根据可见性、交互与系统动态偏好，在原地暂停或恢复同一个计时周期。 */
      function syncAutoplayState() {
        if (shouldRunAutoplay()) {
          resumeAutoplayCycle();
        } else {
          pauseAutoplayCycle();
        }
      }

      /** 用户换图或自动换图完成后重置完整 6 秒周期，防止紧接着再次跳页。 */
      function resetAutoplayCycle(shouldCancelPendingSlide = false) {
        autoplayCycleRequest += 1;
        window.clearTimeout(autoplayTimer);
        autoplayTimer = 0;
        autoplayRemainingMs = homeTriServerCarouselAutoplayIntervalMs;

        if (shouldCancelPendingSlide) {
          cancelPendingSlideRequest();
        }

        restartAutoplayProgress();
        syncAutoplayState();
      }

      /** 原生拖动稳定后再请求最近图片，触屏与按钮共享同一 decode 门控。 */
      const updateSlideIndexFromScroll = () => {
        window.cancelAnimationFrame(pendingCarouselFrame);
        window.clearTimeout(carouselScrollSettleTimer);
        pendingCarouselFrame = window.requestAnimationFrame(() => {
          carouselScrollSettleTimer = window.setTimeout(() => {
            const carouselCenter = carousel.scrollLeft + carousel.clientWidth / 2;
            const activeIndex = slides.reduce((closestIndex, slide, index) => {
              const center = slide.offsetLeft + slide.offsetWidth / 2;
              const closestSlide = slides[closestIndex];
              const closestCenter = closestSlide.offsetLeft + closestSlide.offsetWidth / 2;

              return Math.abs(center - carouselCenter) < Math.abs(closestCenter - carouselCenter)
                ? index
                : closestIndex;
            }, 0);

            void requestSlideIndex(activeIndex, false);
          }, 96);
        });
      };

      previousButton.addEventListener("click", () => {
        resetAutoplayCycle(true);
        void requestSlideIndex(Number(panel.dataset.activeSlide ?? 0) - 1);
      });
      nextButton.addEventListener("click", () => {
        resetAutoplayCycle(true);
        void requestSlideIndex(Number(panel.dataset.activeSlide ?? 0) + 1);
      });
      /** 长按或拖动期间持续暂停；释放后从完整周期重新计时。 */
      const endCarouselPointerInteraction = () => {
        if (!isPointerInteractingWithCarousel) {
          return;
        }

        isPointerInteractingWithCarousel = false;
        resetAutoplayCycle();
      };

      carousel.addEventListener("pointerdown", () => {
        isPointerInteractingWithCarousel = true;
        resetAutoplayCycle(true);
      });
      window.addEventListener("pointerup", endCarouselPointerInteraction);
      window.addEventListener("pointercancel", endCarouselPointerInteraction);
      carousel.addEventListener("wheel", () => resetAutoplayCycle(true), { passive: true });
      carousel.addEventListener("scroll", updateSlideIndexFromScroll, { passive: true });
      carousel.addEventListener("keydown", (event) => {
        if (event.target !== carousel) {
          return;
        }

        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          resetAutoplayCycle(true);
          void requestSlideIndex(
            Number(panel.dataset.activeSlide ?? 0) + (event.key === "ArrowLeft" ? -1 : 1),
          );
        }
      });
      panel.addEventListener("pointerenter", () => {
        if (fineTriServerPointerQuery.matches) {
          isPointerInsidePanel = true;
          syncAutoplayState();
        }
      });
      panel.addEventListener("pointerleave", () => {
        if (fineTriServerPointerQuery.matches) {
          isPointerInsidePanel = false;
          syncAutoplayState();
        }
      });
      panel.addEventListener("focusin", () => {
        isFocusInsidePanel = true;
        syncAutoplayState();
      });
      panel.addEventListener("focusout", () => {
        window.requestAnimationFrame(() => {
          isFocusInsidePanel = panel.contains(document.activeElement);
          syncAutoplayState();
        });
      });

      /** 只让至少 55% 可见且未隐藏的面板运行 Carousel，滚动时不再主动读矩形。 */
      const updatePanelVisibilityFromObserver = (entry: IntersectionObserverEntry) => {
        isPanelMostlyVisible =
          !panel.hidden && entry.isIntersecting && entry.intersectionRatio >= 0.55;
        syncAutoplayState();
      };
      panelVisibilityHandlers.set(panel, updatePanelVisibilityFromObserver);
      panelVisibilityObserver.observe(panel);

      /** 响应式搬移或 hidden 变化后重新观察该节点，不沿用搬移前的可见性记录。 */
      const refreshPanelObservation = () => {
        if (panel.hidden) {
          isPanelMostlyVisible = false;
        }
        panelVisibilityObserver.unobserve(panel);
        panelVisibilityObserver.observe(panel);
        syncAutoplayState();
      };

      const panelAutoplayStateObserver = new MutationObserver(refreshPanelObservation);
      const activeServerAutoplayObserver = new MutationObserver(syncAutoplayState);

      panelAutoplayStateObserver.observe(panel, {
        attributes: true,
        attributeFilter: ["data-map-interactive", "hidden"],
      });
      activeServerAutoplayObserver.observe(homeTriServer, {
        attributes: true,
        attributeFilter: ["data-active-server"],
      });
      document.addEventListener("visibilitychange", syncAutoplayState);
      reducedTriServerMotionQuery.addEventListener("change", () => resetAutoplayCycle());
      desktopTriServerQuery.addEventListener("change", refreshPanelObservation);
      mediaPanelObserverCleanup.add(() => {
        panelAutoplayStateObserver.disconnect();
        activeServerAutoplayObserver.disconnect();
        panelVisibilityHandlers.delete(panel);
      });

      if (serverId) {
        preparePanelForDisplayById.set(serverId, () =>
          prepareSlideIndex(Number(panel.dataset.activeSlide ?? 0)),
        );
      }

      launchButton?.addEventListener("click", async () => {
        if (!desktopTriServerQuery.matches || !serverId) {
          return;
        }

        if (panel.dataset.mapInteractive === "true") {
          closeInteractiveMap(panel);
          return;
        }

        if (!(await setActiveServer(serverId))) {
          return;
        }

        const mapHref = launchButton.dataset.mapHref;
        const mapFrameTitle = launchButton.dataset.mapFrameTitle;
        const overlay = panel.querySelector<HTMLElement>("[data-home-tri-server-map-overlay]");
        const frameHost = panel.querySelector<HTMLElement>("[data-home-tri-server-map-frame]");
        const loading = panel.querySelector<HTMLElement>("[data-home-tri-server-map-loading]");

        if (!mapHref || !mapFrameTitle || !overlay || !frameHost || !loading) {
          return;
        }

        const iframe = document.createElement("iframe");
        const mapLoadStartedAt = performance.now();
        iframe.src = mapHref;
        iframe.title = mapFrameTitle;
        iframe.loading = "eager";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allow = "fullscreen";
        iframe.addEventListener(
          "load",
          () => {
            const remainingLoadingTime = Math.max(0, 480 - (performance.now() - mapLoadStartedAt));

            window.setTimeout(() => {
              if (!iframe.isConnected) {
                return;
              }

              loading.hidden = true;
              panel.dataset.mapLoadState = "ready";
            }, remainingLoadingTime);
          },
          { once: true },
        );
        overlay.hidden = false;
        panel.dataset.mapInteractive = "true";
        panel.dataset.mapLoadState = "loading";
        setMapCardState(panel, true);
        frameHost.replaceChildren(iframe);
      });
      panel.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && panel.dataset.mapInteractive === "true") {
          event.preventDefault();
          closeInteractiveMap(panel, true);
        }
      });

      setSlideIndex(0, false);
      resetAutoplayCycle();
      refreshPanelObservation();
    });

    if (activeServerId) {
      homeTriServer.dataset.activeServer = activeServerId;
    }

    desktopTriServerQuery.addEventListener("change", syncMediaPlacement);
    window.addEventListener("pageshow", () => frameCoordinator.request({ measureGeometry: true }));
    window.addEventListener("pagehide", (event) => {
      cancelActiveServerTransition();
      mediaPanels.forEach((panel) => closeInteractiveMap(panel));
      window.clearTimeout(serverLoadingResetTimer);

      if (!event.persisted) {
        triServerVisibilityObserver.disconnect();
        panelVisibilityObserver.disconnect();
        mediaPanelObserverCleanup.forEach((cleanup) => cleanup());
        unregisterFrameParticipant();
      }
    });

    syncMediaPlacement();
  }

  cleanup = () => {
    cleanup = undefined;
  };
  return cleanup;
}
