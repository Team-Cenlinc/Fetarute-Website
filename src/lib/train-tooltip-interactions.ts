/** 页面只接入列车身份和可见状态；鼠标、键盘、触屏的输入规则由两页共用。 */
export interface TrainTooltipInteractionOptions {
  triggers: readonly HTMLElement[];
  panel: HTMLElement;
  activateTrigger: (trigger: HTMLElement) => void;
  getActiveTrigger: () => HTMLElement;
  isOpen: () => boolean;
  isPinned: () => boolean;
  setPinned: (pinned: boolean) => void;
  setOpen: (open: boolean, explicit?: boolean) => void;
  canPreview?: () => boolean;
  isHandoffInProgress?: () => boolean;
  signal?: AbortSignal;
}

/**
 * 沿用首页的 140ms 悬停确认、180ms 离开缓冲、点击固定和 Escape 焦点回归。
 * 路线几何仍由页面自身提供，避免为了复用 Tooltip 引入首页的整套滚动列车。
 */
export function bindTrainTooltipInteractions(options: TrainTooltipInteractionOptions) {
  const { triggers, panel } = options;
  const lifecycle = new AbortController();
  const { signal } = lifecycle;
  const fineHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  let openTimer = 0;
  let closeTimer = 0;
  let pendingTouchOpen: boolean | undefined;
  let pendingTriggerSwitch = false;
  const isTrigger = (target: EventTarget | null) =>
    target instanceof Node && triggers.some((trigger) => trigger.contains(target));
  const isInside = (target: EventTarget | null) => target instanceof Node && panel.contains(target);

  /** 撤回待定预览，滚动或明确输入后不再执行旧的鼠标意图。 */
  function cancelOpen() {
    window.clearTimeout(openTimer);
    openTimer = 0;
  }
  /** 允许指针从车身进入面板，取消过期的离开计时。 */
  function cancelClose() {
    window.clearTimeout(closeTimer);
    closeTimer = 0;
  }
  /** 归还焦点后再关闭，保留未来真实 focus 的打开能力，不留下全局焦点抑制状态。 */
  function closeAndRestoreFocus() {
    cancelOpen();
    cancelClose();
    options.getActiveTrigger().focus({ preventScroll: true });
    options.setOpen(false);
  }
  /** 延迟预览只在页面仍允许被动打开时执行，跳站经过静止指针不能重新弹出。 */
  function scheduleOpen() {
    cancelOpen();
    if (options.canPreview?.() === false) return;
    openTimer = window.setTimeout(() => {
      openTimer = 0;
      if (options.canPreview?.() !== false) options.setOpen(true);
    }, 140);
  }
  /** 预览离开后收起；固定状态由明确点击、Escape 或外部点击关闭。 */
  function scheduleClose() {
    cancelClose();
    closeTimer = window.setTimeout(() => {
      closeTimer = 0;
      options.setOpen(false);
    }, 180);
  }

  /** 悬停、焦点和按下的事件顺序因浏览器而异；切换意图必须在改写活动锚点前统一记录。 */
  function activateTrigger(trigger: HTMLElement) {
    pendingTriggerSwitch ||= options.isOpen() && options.getActiveTrigger() !== trigger;
    options.activateTrigger(trigger);
  }

  for (const trigger of triggers) {
    trigger.addEventListener(
      "pointerenter",
      () => {
        if (!fineHover.matches) return;
        activateTrigger(trigger);
        cancelClose();
        if (!options.isPinned() && !options.isOpen()) scheduleOpen();
      },
      { signal },
    );
    trigger.addEventListener(
      "pointerleave",
      () => {
        if (fineHover.matches && !options.isPinned()) {
          cancelOpen();
          scheduleClose();
        }
      },
      { signal },
    );
    trigger.addEventListener(
      "focus",
      () => {
        activateTrigger(trigger);
        cancelOpen();
        cancelClose();
        options.setOpen(true, true);
      },
      { signal },
    );
    trigger.addEventListener(
      "blur",
      (event) => {
        if (!options.isHandoffInProgress?.() && !isInside(event.relatedTarget))
          options.setOpen(false);
      },
      { signal },
    );
    trigger.addEventListener(
      "pointerdown",
      (event) => {
        activateTrigger(trigger);
        pendingTouchOpen = event.pointerType === "touch" ? !options.isOpen() : undefined;
      },
      { signal },
    );
    trigger.addEventListener(
      "click",
      () => {
        activateTrigger(trigger);
        cancelOpen();
        cancelClose();
        const open = pendingTriggerSwitch ? true : (pendingTouchOpen ?? !options.isPinned());
        options.setPinned(open);
        options.setOpen(open, true);
        pendingTriggerSwitch = false;
        pendingTouchOpen = undefined;
      },
      { signal },
    );
    trigger.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          cancelOpen();
          cancelClose();
          options.setOpen(false);
        }
      },
      { signal },
    );
  }
  panel.addEventListener(
    "pointerenter",
    () => {
      if (fineHover.matches) {
        cancelOpen();
        cancelClose();
      }
    },
    { signal },
  );
  panel.addEventListener(
    "pointerleave",
    () => {
      if (fineHover.matches && !options.isPinned()) scheduleClose();
    },
    { signal },
  );
  panel.addEventListener(
    "focusin",
    () => {
      cancelClose();
      options.setOpen(true, true);
    },
    { signal },
  );
  panel.addEventListener(
    "focusout",
    (event) => {
      if (!isTrigger(event.relatedTarget) && !isInside(event.relatedTarget)) options.setOpen(false);
    },
    { signal },
  );
  panel.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeAndRestoreFocus();
      }
    },
    { signal },
  );
  panel
    .querySelector("[data-home-journey-close]")
    ?.addEventListener("click", closeAndRestoreFocus, { signal });
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (event.target instanceof Node && !isTrigger(event.target) && !isInside(event.target)) {
        cancelOpen();
        cancelClose();
        options.setOpen(false);
      }
    },
    { signal },
  );
  // macOS WebKit 的鼠标点击不一定聚焦按钮；固定面板仍须响应文档级 Escape。
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && options.isOpen() && !event.defaultPrevented) {
        event.preventDefault();
        closeAndRestoreFocus();
      }
    },
    { signal },
  );
  window.addEventListener(
    "scroll",
    () => {
      cancelOpen();
      cancelClose();
      if (
        !options.isPinned() &&
        !isTrigger(document.activeElement) &&
        !isInside(document.activeElement)
      )
        options.setOpen(false);
    },
    { passive: true, signal },
  );

  /** 真正卸载时移除全部监听与计时；BFCache 仅关闭面板并保留恢复后的输入能力。 */
  function dispose() {
    cancelOpen();
    cancelClose();
    options.setOpen(false);
    lifecycle.abort();
  }
  window.addEventListener(
    "pagehide",
    (event) => {
      cancelOpen();
      cancelClose();
      options.setOpen(false);
      if (!event.persisted) dispose();
    },
    { signal },
  );
  options.signal?.addEventListener("abort", dispose, { once: true, signal });
  return { cancelOpen, cancelClose, closeAndRestoreFocus, dispose };
}
