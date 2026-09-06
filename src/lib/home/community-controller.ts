import {
  HOME_COMMUNITY_LAST_MEMORY_SESSION_KEY,
  HOME_COMMUNITY_LAST_PRESENCE_SESSION_KEY,
  getHomeCommunityMainStoryMotionState,
  homeCommunityStories,
  selectHomeCommunityMemoryStoryId,
  selectHomeCommunityPresenceStoryId,
} from "@/data/home-community";
import { getHomePageFrameCoordinator } from "@/data/home-route-viewport";

let disposeHomeCommunity: (() => void) | undefined;

/**
 * 在同岸章节进入预加载视口后初始化其随机故事与滚动叙事。
 * 控制器以单例方式运行，并向懒加载协调器返回可撤销的完整生命周期。
 */
export function setupHomeCommunity(): () => void {
  if (disposeHomeCommunity) return disposeHomeCommunity;

  const communitySection = document.querySelector<HTMLElement>("[data-home-community]");
  if (!communitySection) return () => {};

  const eventController = new AbortController();
  const disposeSection = setupHomeCommunitySection(communitySection, eventController.signal);
  const dispose = (): void => {
    eventController.abort();
    disposeSection();
    disposeHomeCommunity = undefined;
  };

  disposeHomeCommunity = dispose;
  return dispose;
}

/** 同岸主故事从统一 read 阶段传到 write 阶段的纯数值状态。 */
interface HomeCommunityFrameMeasurement {
  /** 只有桌面且未启用减少动态时才由脚本提交逐帧视觉。 */
  enhanced: boolean;
  /** 图片舞台的受控滚动进度。 */
  sceneProgress: number;
  /** 深色遮罩的过渡进度。 */
  veilProgress: number;
  /** 详情正文的显现进度。 */
  detailProgress: number;
}

/** 为页面中的同岸实例轮换两个短故事池，并初始化主故事滚动交互。 */
function setupHomeCommunitySection(communitySection: HTMLElement, signal: AbortSignal): () => void {
  /** 把构建期候选从延迟描述提交给浏览器；src 最后写入，避免中间态发出错误请求。 */
  const loadStoryImages = (storyElement: HTMLElement): void => {
    storyElement
      .querySelectorAll<HTMLImageElement>("img[data-home-community-deferred-src]")
      .forEach((image) => {
        const { homeCommunityDeferredAlt, homeCommunityDeferredSrc, homeCommunityDeferredSrcset } =
          image.dataset;

        if (!homeCommunityDeferredSrc) return;

        // 媒体图的标准 alt 已在静态 HTML 中；只有装饰头像才从延迟描述补写空替代文本。
        if (homeCommunityDeferredAlt !== undefined) {
          image.alt = homeCommunityDeferredAlt;
        }
        if (image.dataset.homeCommunityDeferredSizes) {
          image.sizes = image.dataset.homeCommunityDeferredSizes;
        }
        if (homeCommunityDeferredSrcset) {
          image.srcset = homeCommunityDeferredSrcset;
        }
        image.src = homeCommunityDeferredSrc;
        image.removeAttribute("data-home-community-deferred-src");
        image.removeAttribute("data-home-community-deferred-srcset");
        image.removeAttribute("data-home-community-deferred-sizes");
        image.removeAttribute("data-home-community-deferred-alt");
      });
  };

  /** 选中故事即将显示时提升其图片优先级，避免用户抵达同岸后仍等待短故事解码。 */
  const preloadSelectedStoryImages = (storyElement: HTMLElement): void => {
    storyElement.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
      image.loading = "eager";
    });
  };

  communitySection
    .querySelectorAll<HTMLDetailsElement>(".home-community__story-details")
    .forEach((details) => {
      details.addEventListener(
        "toggle",
        () => {
          const storyElement = details.closest<HTMLElement>(".home-community__short-story");
          if (details.open && storyElement) loadStoryImages(storyElement);
        },
        { signal },
      );
    });

  const memoryStoryElements = Array.from(
    communitySection.querySelectorAll<HTMLElement>("[data-home-community-memory-story]"),
  );

  if (memoryStoryElements.length > 0) {
    const validMemoryStoryIds = new Set<string>(
      homeCommunityStories.memory.map((story) => story.id),
    );
    let previousMemoryStoryId: (typeof homeCommunityStories.memory)[number]["id"] | undefined;

    try {
      const storedStoryId = window.sessionStorage.getItem(HOME_COMMUNITY_LAST_MEMORY_SESSION_KEY);

      if (storedStoryId && validMemoryStoryIds.has(storedStoryId)) {
        previousMemoryStoryId = storedStoryId as typeof previousMemoryStoryId;
      }
    } catch {
      // 禁用储存时仍展示一则共同经历，只是不再保证刷新后避开上一则。
    }

    const selectedMemoryStoryId = selectHomeCommunityMemoryStoryId(
      homeCommunityStories.memory,
      Math.random(),
      previousMemoryStoryId,
    );

    try {
      window.sessionStorage.setItem(HOME_COMMUNITY_LAST_MEMORY_SESSION_KEY, selectedMemoryStoryId);
    } catch {
      // 所有共同经历都已随页面发布，储存不可用不会阻断当前内容。
    }

    memoryStoryElements.forEach((storyElement) => {
      const selected = storyElement.dataset.homeCommunityMemoryStory === selectedMemoryStoryId;
      if (selected) {
        loadStoryImages(storyElement);
        preloadSelectedStoryImages(storyElement);
      }
      storyElement.hidden = !selected;
    });
    communitySection.dataset.homeCommunityActiveMemoryStory = selectedMemoryStoryId;
  }

  const presenceStoryElements = Array.from(
    communitySection.querySelectorAll<HTMLElement>("[data-home-community-presence-story]"),
  );

  if (presenceStoryElements.length > 0) {
    const validStoryIds = new Set<string>(homeCommunityStories.presence.map((story) => story.id));
    let previousStoryId: (typeof homeCommunityStories.presence)[number]["id"] | undefined;

    try {
      const storedStoryId = window.sessionStorage.getItem(HOME_COMMUNITY_LAST_PRESENCE_SESSION_KEY);

      if (storedStoryId && validStoryIds.has(storedStoryId)) {
        previousStoryId = storedStoryId as typeof previousStoryId;
      }
    } catch {
      // 禁用储存时仍随机显示本次页面的一条故事，只是不再保证刷新后避开上一条。
    }

    const selectedStoryId = selectHomeCommunityPresenceStoryId(
      homeCommunityStories.presence,
      Math.random(),
      previousStoryId,
    );

    try {
      window.sessionStorage.setItem(HOME_COMMUNITY_LAST_PRESENCE_SESSION_KEY, selectedStoryId);
    } catch {
      // 头像与故事都已随页面发布，储存不可用不会阻断当前内容。
    }

    presenceStoryElements.forEach((storyElement) => {
      const selected = storyElement.dataset.homeCommunityPresenceStory === selectedStoryId;
      if (selected) {
        loadStoryImages(storyElement);
        preloadSelectedStoryImages(storyElement);
      }
      storyElement.hidden = !selected;
    });
    communitySection.dataset.homeCommunityActivePresenceStory = selectedStoryId;
  }

  const mainStory = communitySection.querySelector<HTMLElement>("[data-home-community-main-story]");
  const mainStage = mainStory?.querySelector<HTMLElement>(".home-community__main-stage");
  const mainVeil = mainStage?.querySelector<HTMLElement>(".home-community__main-veil");
  const mainNarrative = mainStage?.querySelector<HTMLElement>(".home-community__main-narrative");
  if (!mainStory || !mainStage || !mainVeil || !mainNarrative) return () => {};

  const desktopQuery = window.matchMedia("(min-width: 1024px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const frameCoordinator = getHomePageFrameCoordinator();
  let isCommunityActive = true;

  /** 在统一帧 read 阶段读取主故事几何并计算纯数值动画状态。 */
  const readMainStoryFrame = (): HomeCommunityFrameMeasurement => {
    const enhanced = desktopQuery.matches && !reducedMotionQuery.matches;
    let rawProgress = 1;

    if (enhanced) {
      const bounds = mainStory.getBoundingClientRect();
      const scrollTravel = Math.max(1, bounds.height - mainStage.offsetHeight);
      rawProgress = -bounds.top / scrollTravel;
    }

    return { enhanced, ...getHomeCommunityMainStoryMotionState(rawProgress) };
  };

  /** 只在动画目标值改变时写入行内样式，避免重复触发局部样式失效。 */
  const setAnimatedStyle = (
    element: HTMLElement,
    property: "opacity" | "transform",
    value: string,
  ): void => {
    if (element.style[property] !== value) {
      element.style[property] = value;
    }
  };

  /** 在统一帧 write 阶段直接更新消费元素，不让父节点变量使整棵故事子树失效。 */
  const writeMainStoryFrame = (state: HomeCommunityFrameMeasurement): void => {
    if (!state.enhanced) {
      mainVeil.style.removeProperty("opacity");
      mainNarrative.style.removeProperty("opacity");
      mainNarrative.style.removeProperty("transform");
    } else {
      setAnimatedStyle(mainVeil, "opacity", String(state.veilProgress * 0.76));
      setAnimatedStyle(mainNarrative, "opacity", String(state.detailProgress));
      setAnimatedStyle(
        mainNarrative,
        "transform",
        `translateY(${(1 - state.detailProgress) * 34}px)`,
      );
    }

    const phase = state.detailProgress >= 0.5 ? "detail" : "scene";
    if (mainStory.dataset.homeCommunityMainPhase !== phase) {
      mainStory.dataset.homeCommunityMainPhase = phase;
    }
  };

  const unregisterFrameParticipant = frameCoordinator.register({
    isActive: () => isCommunityActive,
    read: readMainStoryFrame,
    write: writeMainStoryFrame,
  });
  const requestMainStoryFrame = (): void => frameCoordinator.request();
  const communityVisibilityObserver = new IntersectionObserver(
    (entries) => {
      /* 同一章节的入屏记录可能与旧的离屏记录合批，以最新状态恢复故事叙事。 */
      const entry = entries.at(-1);
      isCommunityActive = entry?.isIntersecting ?? false;
      if (isCommunityActive) {
        requestMainStoryFrame();
      }
    },
    { rootMargin: "100% 0px" },
  );
  communityVisibilityObserver.observe(communitySection);

  /* 响应式或减少动态边界切换时同步校正，避免 CSS 已换分支而进度仍停留一帧。 */
  desktopQuery.addEventListener("change", requestMainStoryFrame, { signal });
  reducedMotionQuery.addEventListener("change", requestMainStoryFrame, { signal });
  window.addEventListener("pageshow", requestMainStoryFrame, { signal });
  requestMainStoryFrame();

  return () => {
    communityVisibilityObserver.disconnect();
    unregisterFrameParticipant();
  };
}
