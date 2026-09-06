import { getHomeOnwardDepartureBoardState } from "@/data/home-route-train";
import { getHomePageFrameCoordinator } from "@/data/home-route-viewport";

let disposeHomeOnward: (() => void) | undefined;

/**
 * 在续行章节进入预加载视口后启用 PIDS、复制和滚动导览。
 * 返回的清理器撤销事件、计时器与帧协调器注册，供页面卸载时统一调用。
 */
export function setupHomeOnward(): () => void {
  if (disposeHomeOnward) return disposeHomeOnward;

  const section = document.querySelector<HTMLElement>("[data-home-onward-content]");
  if (!section) return () => {};

  const eventController = new AbortController();
  const disposeSection = initialiseHomeOnwardContent(section, eventController.signal);
  const dispose = (): void => {
    eventController.abort();
    disposeSection();
    disposeHomeOnward = undefined;
  };

  disposeHomeOnward = dispose;
  return dispose;
}

/** 续行 PIDS 在统一帧 read 阶段锁定、交给 write 阶段提交的状态。 */
interface HomeOnwardFrameMeasurement {
  /** 手动选择在阅读期间保留；整个行程离开视口后才恢复滚动导览。 */
  journeyVisible: boolean;
  /** 本帧唯一可见的 PIDS 面板。 */
  boardState: "destinations" | "help";
}

/** 把每个续行内容页自己的滚动行程映射到 PIDS 状态，不借用前一段 Section Breaker 的列车进度。 */
const initialiseHomeOnwardContent = (section: HTMLElement, signal: AbortSignal): (() => void) => {
  const journey = section.querySelector<HTMLElement>("[data-home-onward-journey]");
  const destinationBoard = section.querySelector<HTMLElement>(
    "[data-home-onward-destination-board]",
  );
  const helpBoard = section.querySelector<HTMLElement>("[data-home-onward-help-board]");
  const stage = section.querySelector<HTMLElement>(".home-onward__stage");
  const scrollHint = section.querySelector<HTMLButtonElement>("[data-home-onward-scroll-hint]");
  const copyQqButton = section.querySelector<HTMLButtonElement>("[data-home-onward-copy-qq]");
  const copyQqLabel = copyQqButton?.querySelector<HTMLElement>("[data-home-onward-copy-label]");
  const copyFeedback = section.querySelector<HTMLElement>("[data-home-onward-copy-feedback]");
  const boardNavigation = section.querySelector<HTMLElement>("[data-home-onward-board-navigation]");
  const boardButtons = Array.from(
    section.querySelectorAll<HTMLButtonElement>("[data-home-onward-select-board]"),
  );

  if (!journey || !stage || !destinationBoard || !helpBoard) {
    return () => {};
  }

  let copyResetTimer: number | undefined;
  /** 显式选择优先于滚动进度，避免用户刚返回目的地就被下一帧切回帮助。 */
  let selectedBoard: HomeOnwardFrameMeasurement["boardState"] | null = null;
  let isOnwardActive = true;
  const frameCoordinator = getHomePageFrameCoordinator();

  /** 在统一帧 read 阶段取得路程进度，不改变面板或辅助技术状态。 */
  const readFrame = (): HomeOnwardFrameMeasurement => {
    const journeyRect = journey.getBoundingClientRect();
    const scrollDistance = Math.max(0, journey.offsetHeight - stage.offsetHeight);
    /* 短屏的自然排版没有额外滚动行程，直接用按钮换页，不把一像素滚动误判为读完。 */
    const progress =
      scrollDistance > 0 ? Math.min(Math.max(-journeyRect.top / scrollDistance, 0), 1) : 0;
    const journeyVisible = journeyRect.top < window.innerHeight && journeyRect.bottom > 0;
    const boardState =
      (journeyVisible ? selectedBoard : null) ?? getHomeOnwardDepartureBoardState(progress);

    return { journeyVisible, boardState };
  };

  /** 在统一帧 write 阶段只提交变化后的 PIDS 与可访问性状态。 */
  const writeFrame = ({ journeyVisible, boardState }: HomeOnwardFrameMeasurement) => {
    if (!journeyVisible) {
      selectedBoard = null;
    }
    const showsDestinations = boardState === "destinations";

    if (section.dataset.homeOnwardBoardState !== boardState) {
      section.dataset.homeOnwardBoardState = boardState;
    }
    if (destinationBoard.ariaHidden !== String(!showsDestinations)) {
      destinationBoard.ariaHidden = String(!showsDestinations);
    }
    if (destinationBoard.inert !== !showsDestinations) {
      destinationBoard.inert = !showsDestinations;
    }
    if (helpBoard.ariaHidden !== String(showsDestinations)) {
      helpBoard.ariaHidden = String(showsDestinations);
    }
    if (helpBoard.inert !== showsDestinations) {
      helpBoard.inert = showsDestinations;
    }
    for (const button of boardButtons) {
      const pressed = String(button.dataset.homeOnwardSelectBoard === boardState);
      if (button.getAttribute("aria-pressed") !== pressed) {
        button.setAttribute("aria-pressed", pressed);
      }
    }
  };

  const unregisterFrameParticipant = frameCoordinator.register({
    isActive: () => isOnwardActive,
    read: readFrame,
    write: writeFrame,
  });

  /** 所有连续滚动由首页唯一入口申请；组件事件只声明需要下一帧。 */
  const requestRender = () => {
    frameCoordinator.request();
  };

  /** 在同一块屏内双向切换；焦点停在始终可见的按钮上，不随旧面板进入 inert。 */
  const selectBoard = (state: HomeOnwardFrameMeasurement["boardState"]) => {
    selectedBoard = state;
    const selectedButton = boardButtons.find(
      (button) => button.dataset.homeOnwardSelectBoard === state,
    );
    selectedButton?.focus({ preventScroll: true });
    requestRender();
  };

  /** 使用临时输入框兼容不提供 Clipboard API，或明确拒绝写入权限的浏览器。 */
  const copyTextWithLegacyField = (value: string) => {
    // 权限拒绝可能晚于页面卸载；必须在创建输入框及尝试复制之前停止回退。
    if (signal.aborted) return false;
    const previousFocus = document.activeElement;
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    try {
      field.select();
      const legacyCopy = Reflect.get(document, "execCommand");
      return typeof legacyCopy === "function" && Reflect.apply(legacyCopy, document, ["copy"]);
    } finally {
      // 复制被拒绝或抛出异常时也释放临时输入框，避免留下不可见的键盘焦点。
      field.remove();
      if (!signal.aborted && previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    }
  };

  /** 在安全上下文优先使用 Clipboard API；权限拒绝时仍尝试兼容复制。 */
  const copyText = async (value: string) => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch {
        return copyTextWithLegacyField(value);
      }
    }

    return copyTextWithLegacyField(value);
  };

  /** 同步复制按钮图标、可见反馈与数据状态，并在短暂确认后恢复默认文案。 */
  const setCopyState = (state: "idle" | "copied" | "failed") => {
    if (!copyQqButton || !copyQqLabel || !copyFeedback) {
      return;
    }

    const label =
      state === "copied"
        ? copyQqButton.dataset.copiedLabel
        : state === "failed"
          ? copyQqButton.dataset.copyFailedLabel
          : copyQqButton.dataset.copyLabel;

    copyQqButton.dataset.copyState = state;
    copyQqLabel.textContent = label ?? "";
    copyFeedback.textContent = state === "idle" ? "" : (label ?? "");
  };

  scrollHint?.addEventListener("click", () => selectBoard("help"), { signal });
  for (const button of boardButtons) {
    button.addEventListener(
      "click",
      () => {
        const state = button.dataset.homeOnwardSelectBoard;
        if (state === "destinations" || state === "help") selectBoard(state);
      },
      { signal },
    );
  }
  /* 键盘正在操作的面板保持可见，滚动不能藏起当前焦点所在的链接或复制按钮。 */
  destinationBoard.addEventListener(
    "focusin",
    () => {
      selectedBoard = "destinations";
    },
    { signal },
  );
  helpBoard.addEventListener(
    "focusin",
    () => {
      selectedBoard = "help";
    },
    { signal },
  );
  if (boardNavigation) {
    boardNavigation.hidden = false;
    section.dataset.homeOnwardEnhanced = "true";
  }
  copyQqButton?.addEventListener(
    "click",
    async () => {
      if (copyResetTimer !== undefined) {
        window.clearTimeout(copyResetTimer);
      }

      let copyState: "copied" | "failed";
      try {
        const copied = await copyText(copyQqButton.dataset.copyValue ?? "");
        copyState = copied ? "copied" : "failed";
      } catch {
        copyState = "failed";
      }

      // Clipboard 权限弹窗可能跨越 pagehide；恢复后不能再触碰已卸载页面的按钮或计时器。
      if (signal.aborted) return;
      setCopyState(copyState);
      copyResetTimer = window.setTimeout(() => setCopyState("idle"), 2400);
    },
    { signal },
  );

  const onwardVisibilityObserver = new IntersectionObserver(
    (entries) => {
      /* 深链定位可能同批送达离屏与入屏记录；单目标观察器必须采用最后状态，才能恢复按钮更新。 */
      const entry = entries.at(-1);
      isOnwardActive = entry?.isIntersecting ?? false;
      if (isOnwardActive) {
        requestRender();
      }
    },
    { rootMargin: "100% 0px" },
  );
  onwardVisibilityObserver.observe(section);

  window.addEventListener("pageshow", requestRender, { signal });
  requestRender();

  return () => {
    window.clearTimeout(copyResetTimer);
    onwardVisibilityObserver.disconnect();
    unregisterFrameParticipant();
  };
};
