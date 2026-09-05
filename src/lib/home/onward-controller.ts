import { getHomeOnwardDepartureBoardState } from "@/data/home-route-train";
import { getHomePageFrameCoordinator } from "@/data/home-route-viewport";

let cleanup: (() => void) | undefined;

export function setupHomeOnward() {
  if (cleanup) return cleanup;
  /** 续行 PIDS 在统一帧 read 阶段锁定、交给 write 阶段提交的状态。 */
  interface HomeOnwardFrameMeasurement {
    /** 路程是否尚未进入视口，用来撤销仅由提示按钮触发的帮助态。 */
    journeyTop: number;
    /** 本帧唯一可见的 PIDS 面板。 */
    boardState: "destinations" | "help";
  }

  /** 把每个续行内容页自己的滚动行程映射到 PIDS 状态，不借用前一段 Section Breaker 的列车进度。 */
  const initialiseHomeOnwardContent = (section: HTMLElement) => {
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

    if (!journey || !stage || !destinationBoard || !helpBoard) {
      return;
    }

    let copyResetTimer: number | undefined;
    let manuallyRequestedHelp = false;
    let isOnwardActive = true;
    const frameCoordinator = getHomePageFrameCoordinator();

    /** 在统一帧 read 阶段取得路程进度，不改变面板或辅助技术状态。 */
    const readFrame = (): HomeOnwardFrameMeasurement => {
      const journeyRect = journey.getBoundingClientRect();
      const scrollDistance = Math.max(1, journey.offsetHeight - stage.offsetHeight);
      const progress = Math.min(Math.max(-journeyRect.top / scrollDistance, 0), 1);
      const boardState =
        manuallyRequestedHelp && journeyRect.top <= 1
          ? "help"
          : getHomeOnwardDepartureBoardState(progress);

      return { journeyTop: journeyRect.top, boardState };
    };

    /** 在统一帧 write 阶段只提交变化后的 PIDS 与可访问性状态。 */
    const writeFrame = ({ journeyTop, boardState }: HomeOnwardFrameMeasurement) => {
      if (journeyTop > 1) {
        manuallyRequestedHelp = false;
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

    /** 底部提示按钮提供显式捷径；普通滚轮、触摸和键盘输入仍完整经过续行路程。 */
    const scrollToHelp = () => {
      manuallyRequestedHelp = true;
      requestRender();
    };

    /** 使用临时输入框兼容不提供 Clipboard API，或明确拒绝写入权限的浏览器。 */
    const copyTextWithLegacyField = (value: string) => {
      const field = document.createElement("textarea");
      field.value = value;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      const legacyCopy = Reflect.get(document, "execCommand");
      const copied =
        typeof legacyCopy === "function" && Reflect.apply(legacyCopy, document, ["copy"]);
      field.remove();
      return copied;
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

    scrollHint?.addEventListener("click", scrollToHelp);
    copyQqButton?.addEventListener("click", async () => {
      if (copyResetTimer !== undefined) {
        window.clearTimeout(copyResetTimer);
      }

      try {
        const copied = await copyText(copyQqButton.dataset.copyValue ?? "");
        setCopyState(copied ? "copied" : "failed");
      } catch {
        setCopyState("failed");
      }

      copyResetTimer = window.setTimeout(() => setCopyState("idle"), 2400);
    });

    const onwardVisibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isOnwardActive = entry?.isIntersecting ?? false;
        if (isOnwardActive) {
          requestRender();
        }
      },
      { rootMargin: "100% 0px" },
    );
    onwardVisibilityObserver.observe(section);

    window.addEventListener("pageshow", requestRender);
    window.addEventListener("pagehide", (event) => {
      if (!event.persisted) {
        onwardVisibilityObserver.disconnect();
        unregisterFrameParticipant();
      }
    });
    requestRender();
  };

  document
    .querySelectorAll<HTMLElement>("[data-home-onward-content]")
    .forEach(initialiseHomeOnwardContent);

  cleanup = () => {
    cleanup = undefined;
  };
  return cleanup;
}
