import {
  HOME_COMMUNITY_LAST_MEMORY_SESSION_KEY,
  HOME_COMMUNITY_LAST_PRESENCE_SESSION_KEY,
  getHomeCommunityMainStoryMotionState,
  homeCommunityStories,
  selectHomeCommunityMemoryStoryId,
  selectHomeCommunityPresenceStoryId,
} from "@/data/home-community";
import { getHomePageFrameCoordinator } from "@/data/home-route-viewport";

let cleanup: (() => void) | undefined;

export function setupHomeCommunity() {
  if (cleanup) return cleanup;
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
  function setupHomeCommunitySection(communitySection: HTMLElement): void {
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
        window.sessionStorage.setItem(
          HOME_COMMUNITY_LAST_MEMORY_SESSION_KEY,
          selectedMemoryStoryId,
        );
      } catch {
        // 所有共同经历都已随页面发布，储存不可用不会阻断当前内容。
      }

      memoryStoryElements.forEach((storyElement) => {
        storyElement.hidden =
          storyElement.dataset.homeCommunityMemoryStory !== selectedMemoryStoryId;
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
        const storedStoryId = window.sessionStorage.getItem(
          HOME_COMMUNITY_LAST_PRESENCE_SESSION_KEY,
        );

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
        storyElement.hidden = storyElement.dataset.homeCommunityPresenceStory !== selectedStoryId;
      });
      communitySection.dataset.homeCommunityActivePresenceStory = selectedStoryId;
    }

    const mainStory = communitySection.querySelector<HTMLElement>(
      "[data-home-community-main-story]",
    );
    const mainStage = mainStory?.querySelector<HTMLElement>(".home-community__main-stage");
    const mainVeil = mainStage?.querySelector<HTMLElement>(".home-community__main-veil");
    const mainNarrative = mainStage?.querySelector<HTMLElement>(".home-community__main-narrative");
    if (!mainStory || !mainStage || !mainVeil || !mainNarrative) return;

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
      ([entry]) => {
        isCommunityActive = entry?.isIntersecting ?? false;
        if (isCommunityActive) {
          requestMainStoryFrame();
        }
      },
      { rootMargin: "100% 0px" },
    );
    communityVisibilityObserver.observe(communitySection);

    /* 响应式或减少动态边界切换时同步校正，避免 CSS 已换分支而进度仍停留一帧。 */
    desktopQuery.addEventListener("change", requestMainStoryFrame);
    reducedMotionQuery.addEventListener("change", requestMainStoryFrame);
    window.addEventListener("pageshow", requestMainStoryFrame);
    window.addEventListener("pagehide", (event) => {
      if (!event.persisted) {
        communityVisibilityObserver.disconnect();
        unregisterFrameParticipant();
      }
    });
    requestMainStoryFrame();
  }

  document
    .querySelectorAll<HTMLElement>("[data-home-community]")
    .forEach(setupHomeCommunitySection);

  cleanup = () => {
    cleanup = undefined;
  };
  return cleanup;
}
