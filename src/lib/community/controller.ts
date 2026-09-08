import { placeCommunityPanel } from "./layout.ts";
import { initializeCommunityMap, updateCommunityArrival } from "./map-runtime.ts";
import { setupCommunityTrain } from "./train-controller.ts";

/** 一处可展开的地图地点；列车由共享 Tooltip 控制器提供相同的输入规则。 */
interface CommunityDisclosure {
  details: HTMLDetailsElement;
  trigger: HTMLElement;
  panel: HTMLElement;
  /** 承载白色渐变的简介外框，数据属性不会随正文滚动离开可见区域。 */
  description?: HTMLElement;
  /** 实际接收滚动的简介正文；与外框分离以保持提示固定在边缘。 */
  descriptionScroller?: HTMLElement;
}

/** 渐进增强原生 details：无脚本仍能读取资料，增强后支持 hover、键盘和触屏固定展开。 */
export function setupCommunityPage(root: HTMLElement): () => void {
  if (root.dataset.communityEnhanced === "true") return () => {};
  initializeCommunityMap(root);
  updateCommunityArrival(root);
  const lifecycle = new AbortController();
  const { signal } = lifecycle;
  const entries: CommunityDisclosure[] = [];
  let active: CommunityDisclosure | undefined;
  let pinned = false;
  let disposed = false;
  let closeTimer = 0;
  let frame = 0;
  let pointerKind = "";
  let suppressFocus = false;
  let suppressHover = false;
  let pointerX = -1;
  let pointerY = -1;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const supportsPopover = "showPopover" in HTMLElement.prototype;
  const header = document.querySelector<HTMLElement>(".site-header");
  const train = setupCommunityTrain(root, (dismissPreview) => close(false, dismissPreview), signal);
  /* 字体加载或章节正文换行会移动河口；仅更新连接几何，保留本次地图种子和成员位置。 */
  const mapObserver = new ResizeObserver(() => {
    if (!disposed) updateCommunityArrival(root);
  });
  const atlas = root.querySelector<HTMLElement>("[data-community-atlas]");
  if (atlas) mapObserver.observe(atlas);

  for (const details of root.querySelectorAll<HTMLDetailsElement>("[data-community-disclosure]")) {
    const trigger = details.querySelector<HTMLElement>(":scope > summary");
    const panel = details.querySelector<HTMLElement>(":scope > [data-community-panel]");
    if (!trigger || !panel) continue;
    entries.push({
      details,
      trigger,
      panel,
      description: panel.querySelector<HTMLElement>("[data-community-description]") ?? undefined,
      descriptionScroller:
        panel.querySelector<HTMLElement>(".community-profile__description") ?? undefined,
    });
    panel.dataset.floating = "true";
    if (supportsPopover) panel.setAttribute("popover", "manual");
    trigger.setAttribute("aria-expanded", "false");
  }

  /** 清理延迟关闭，使光标从地块跨过小间隙进入面板时不会丢失正在阅读的内容。 */
  function cancelClose() {
    window.clearTimeout(closeTimer);
    closeTimer = 0;
  }

  /** 仅在简介实际溢出时标出可继续阅读的方向，渐变不遮挡无滚动内容的卡片。 */
  function updateDescriptionScrollHint(entry: CommunityDisclosure) {
    const description = entry.description;
    const scroller = entry.descriptionScroller;
    if (!description || !scroller) return;
    const overflow = scroller.scrollHeight - scroller.clientHeight > 1;
    const hint = [
      overflow && scroller.scrollTop > 1 ? "top" : "",
      overflow && scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1
        ? "bottom"
        : "",
    ]
      .filter(Boolean)
      .join(" ");
    if (hint) description.dataset.scrollHint = hint;
    else delete description.dataset.scrollHint;
  }

  /** 关闭后可恢复触发点焦点；同步抑制恢复焦点导致的再次预览。 */
  function close(restoreFocus = false, dismissPreview = false) {
    cancelClose();
    if (dismissPreview) suppressHover = true;
    const previous = active;
    active = undefined;
    pinned = false;
    if (!previous) return;
    /* 原生 popover 自身也可能恢复焦点，必须覆盖 hidePopover 的同步焦点事件。 */
    suppressFocus = true;
    if (supportsPopover && previous.panel.matches(":popover-open")) previous.panel.hidePopover();
    previous.details.open = false;
    previous.trigger.setAttribute("aria-expanded", "false");
    delete previous.details.dataset.pinned;
    if (restoreFocus) {
      previous.trigger.focus({ preventScroll: true });
    }
    suppressFocus = false;
  }

  /** 只在面板打开时读取几何；滚动帧仅以 translate 定位，不改变地图或其他地块尺寸。 */
  function position() {
    if (!active || disposed) return;
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft ?? 0;
    const viewportTop = viewport?.offsetTop ?? 0;
    const width = viewport?.width ?? window.innerWidth;
    const height = viewport?.height ?? window.innerHeight;
    const headerBottom = header?.getBoundingClientRect().bottom ?? viewportTop;
    const top = Math.max(viewportTop, Math.min(headerBottom + 8, viewportTop + height - 180));
    const available = { left, top, width, height: viewportTop + height - top };
    const anchor = (
      active.trigger.querySelector(".community-plot__label") ?? active.trigger
    ).getBoundingClientRect();
    if (anchor.bottom < viewportTop || anchor.top > viewportTop + height) {
      close();
      return;
    }
    active.panel.style.maxHeight = Math.max(120, available.height - 16) + "px";
    const point = placeCommunityPanel(anchor, active.panel.getBoundingClientRect(), available);
    active.panel.style.setProperty("--community-panel-x", point.x + "px");
    active.panel.style.setProperty("--community-panel-y", point.y + "px");
    updateDescriptionScrollHint(active);
  }

  /** 自动聚焦/悬停只作预览，首次点击总是固定展开，避免 touch 的 focus→click 双重翻转。 */
  function open(entry: CommunityDisclosure, shouldPin: boolean) {
    if (disposed) return;
    train.close();
    cancelClose();
    if (active !== entry) {
      close();
      active = entry;
      entry.details.open = true;
      entry.trigger.setAttribute("aria-expanded", "true");
      if (supportsPopover) entry.panel.showPopover();
    }
    pinned = shouldPin || pinned;
    entry.details.dataset.pinned = String(pinned);
    position();
  }

  /** 同时检查光标与键盘焦点，保证 hover 内容可进入、可持续阅读且可被显式关闭。 */
  function scheduleClose(entry: CommunityDisclosure) {
    cancelClose();
    if (pinned) return;
    closeTimer = window.setTimeout(() => {
      if (disposed || active !== entry || pinned) return;
      const focused = document.activeElement;
      if (entry.details.contains(focused)) return;
      close();
    }, 180);
  }

  for (const entry of entries) {
    entry.trigger.addEventListener(
      "pointerdown",
      (event) => {
        pointerKind = event.pointerType;
      },
      { signal },
    );
    entry.trigger.addEventListener(
      "pointerenter",
      (event) => {
        if (finePointer.matches && event.pointerType === "mouse" && !pinned && !suppressHover)
          open(entry, false);
      },
      { signal },
    );
    entry.trigger.addEventListener(
      "pointermove",
      (event) => {
        /* 跳转造成的地块穿过静止光标不是新的预览意图；真实移动后才恢复 hover。 */
        if (!finePointer.matches || event.pointerType !== "mouse" || pinned) return;
        if (suppressHover) return;
        if (active !== entry) open(entry, false);
      },
      { signal },
    );
    entry.trigger.addEventListener("pointerleave", () => scheduleClose(entry), { signal });
    entry.trigger.addEventListener(
      "keydown",
      (event) => {
        /* WebKit 在 details 内重新显示顶层 popover 后可能跳过内部控件；显式接入正常 Tab 顺序。 */
        if (event.key !== "Tab" || event.shiftKey || active !== entry) return;
        const firstControl = entry.panel.querySelector<HTMLElement>("button, a[href]");
        if (!firstControl) return;
        event.preventDefault();
        firstControl.focus({ preventScroll: true });
      },
      { signal },
    );
    entry.trigger.addEventListener(
      "focus",
      () => {
        if (suppressFocus || pointerKind === "touch") return;
        /* 键盘按外框顺序聚焦时，异形地块的姓名可能仍在屏外；先让实际标注可见再定位面板。 */
        if (!pointerKind) {
          const label = entry.trigger.querySelector<HTMLElement>(".community-plot__label");
          const bounds = label?.getBoundingClientRect();
          const viewport = window.visualViewport;
          const top = Math.max(
            viewport?.offsetTop ?? 0,
            (header?.getBoundingClientRect().bottom ?? 0) + 8,
          );
          const bottom = (viewport?.offsetTop ?? 0) + (viewport?.height ?? innerHeight);
          if (bounds && (bounds.top < top || bounds.bottom > bottom))
            label!.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
        }
        open(entry, false);
      },
      { signal },
    );
    entry.trigger.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        if (active === entry && pinned) close(false, true);
        else open(entry, true);
        pointerKind = "";
      },
      { signal },
    );
    entry.panel.addEventListener("pointerenter", cancelClose, { signal });
    entry.panel.addEventListener("pointerleave", () => scheduleClose(entry), { signal });
    entry.panel.addEventListener("focusin", cancelClose, { signal });
    entry.panel
      .querySelector("[data-community-close]")
      ?.addEventListener("click", () => close(true, true), { signal });
    entry.descriptionScroller?.addEventListener(
      "scroll",
      () => updateDescriptionScrollHint(entry),
      { passive: true, signal },
    );
  }

  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") return;
      /* 使用视口坐标比较，兼容 movementX/Y 始终为零的浏览器；滚动不会解除暂停。 */
      if (event.clientX !== pointerX || event.clientY !== pointerY) suppressHover = false;
      pointerX = event.clientX;
      pointerY = event.clientY;
    },
    { capture: true, passive: true, signal },
  );
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (
        active &&
        event.target instanceof Node &&
        !active.details.contains(event.target) &&
        !active.panel.contains(event.target)
      )
        close(false, true);
    },
    { signal },
  );
  document.addEventListener(
    "keydown",
    (event) => {
      pointerKind = "";
      if (event.key === "Escape" && active) {
        event.preventDefault();
        event.stopPropagation();
        close(true, true);
      }
    },
    { signal },
  );
  document.addEventListener(
    "focusin",
    (event) => {
      if (active && event.target instanceof Node && !active.details.contains(event.target)) close();
    },
    { signal },
  );
  /** 合并滚动和视口变化，离开页面后不再提交帧或写入已释放的 DOM。 */
  function scheduleFrame() {
    if (disposed || frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      if (disposed) return;
      train.update();
      position();
    });
  }
  window.addEventListener("scroll", scheduleFrame, { passive: true, signal });
  window.addEventListener(
    "resize",
    () => {
      updateCommunityArrival(root);
      scheduleFrame();
    },
    { passive: true, signal },
  );
  window.visualViewport?.addEventListener("resize", scheduleFrame, { passive: true, signal });
  window.visualViewport?.addEventListener("scroll", scheduleFrame, { passive: true, signal });

  const copyButton = root.querySelector<HTMLButtonElement>("[data-community-copy]");
  const feedback = root.querySelector<HTMLElement>("[data-community-copy-feedback]");
  copyButton?.addEventListener(
    "click",
    async () => {
      try {
        await navigator.clipboard.writeText(copyButton.dataset.communityCopy ?? "");
        if (disposed || signal.aborted || !root.isConnected) return;
        if (feedback) feedback.textContent = copyButton.dataset.copiedLabel ?? "";
      } catch {
        if (disposed || signal.aborted || !root.isConnected) return;
        if (feedback) feedback.textContent = copyButton.dataset.copyFailedLabel ?? "";
      }
    },
    { signal },
  );

  /** BFCache 只收起瞬时浮层；真正卸载时取消监听器、计时器和未提交的帧。 */
  function dispose() {
    close();
    disposed = true;
    lifecycle.abort();
    mapObserver.disconnect();
    window.cancelAnimationFrame(frame);
    frame = 0;
    delete root.dataset.communityEnhanced;
  }
  window.addEventListener(
    "pagehide",
    (event) => {
      close();
      window.cancelAnimationFrame(frame);
      frame = 0;
      if (!event.persisted) dispose();
    },
    { signal },
  );
  window.addEventListener("pageshow", scheduleFrame, { signal });
  root.dataset.communityEnhanced = "true";
  train.update();
  return dispose;
}
