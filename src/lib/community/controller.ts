import { placeCommunityPanel } from "./layout.ts";
import { initializeCommunityMap, updateCommunityArrival } from "./map-runtime.ts";
import { setupCommunityTrain } from "./train-controller.ts";

/** 一处可展开的地图地点；列车由共享 Tooltip 控制器提供相同的输入规则。 */
interface CommunityDisclosure {
  details: HTMLDetailsElement;
  trigger: HTMLElement;
  panel: HTMLElement;
  /** 简介外框记录渐隐方向，滚动条独立于文字渐隐以保持清晰。 */
  description?: HTMLElement;
  /** 实际接收滚动的简介正文；与外框分离以保持提示固定在边缘。 */
  descriptionScroller?: HTMLElement;
  /** 自绘滚动条只提供鼠标拖动与位置反馈，键盘仍操作原生正文滚动区。 */
  scrollbar?: HTMLElement;
}

/** 一张资料图片的站内预览；原资料卡保持打开，关闭预览后继续从原位置阅读。 */
interface CommunityMediaDialog {
  dialog: HTMLDialogElement;
  image: HTMLImageElement;
  close: HTMLButtonElement;
  /** 当前展开来源用于反向收回和关闭后的焦点恢复。 */
  source?: HTMLButtonElement;
  /** 顶层 dialog 内的临时图片代理，承担缩略图与最终尺寸之间的空间过渡。 */
  proxy?: HTMLImageElement;
  /** 只保留当前一次过渡的控制权，新的打开或关闭会使前次异步解码失效。 */
  motionId: number;
  animation?: Animation;
}

/** 社区投稿采用无回弹的重量感动效，表达“资料内图片被展开”而非跳转到另一个页面。 */
const communityMediaMotion = {
  enterDuration: 320,
  exitDuration: 220,
  enterEasing: "cubic-bezier(0.2, 0, 0, 1)",
  exitEasing: "cubic-bezier(0.3, 0, 1, 1)",
} as const;

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
  const mediaDialogs: CommunityMediaDialog[] = Array.from(
    root.querySelectorAll<HTMLDialogElement>("[data-community-media-dialog]"),
  ).flatMap((dialog) => {
    const image = dialog.querySelector<HTMLImageElement>("[data-community-media-image]");
    const close = dialog.querySelector<HTMLButtonElement>("[data-community-media-close]");
    return image && close ? [{ dialog, image, close, motionId: 0 }] : [];
  });
  /** 原生 modal 打开后仍保留资料卡状态，避免放大图片意外关闭正在阅读的个人资料。 */
  const isInsideMediaDialog = (target: EventTarget | null) =>
    target instanceof Node && mediaDialogs.some(({ dialog }) => dialog.contains(target));
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
      scrollbar: panel.querySelector<HTMLElement>("[data-community-scrollbar]") ?? undefined,
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
    const scrollbar = entry.scrollbar;
    if (scrollbar) {
      scrollbar.hidden = !overflow;
      const height = scroller.clientHeight;
      const thumbHeight = Math.min(height, Math.max(20, (height * height) / scroller.scrollHeight));
      const progress = overflow
        ? Math.max(0, Math.min(1, scroller.scrollTop / (scroller.scrollHeight - height)))
        : 0;
      scrollbar.style.setProperty("--community-scroll-thumb-height", `${thumbHeight}px`);
      scrollbar.style.setProperty(
        "--community-scroll-thumb-top",
        `${progress * (height - thumbHeight)}px`,
      );
    }
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
    const scrollbar = entry.scrollbar;
    const scroller = entry.descriptionScroller;
    const thumbElement = scrollbar?.firstElementChild;
    if (scrollbar && scroller && thumbElement) {
      let grabOffset = 0;
      /** 把轨道上的指针位置换算为正文滚动距离；拖动滑块时保留抓取点，避免跳动。 */
      const dragDescription = (event: PointerEvent) => {
        const track = scrollbar.getBoundingClientRect();
        const thumbHeight = thumbElement.getBoundingClientRect().height;
        const travel = track.height - thumbHeight;
        const progress = travel > 0 ? (event.clientY - track.top - grabOffset) / travel : 0;
        scroller.scrollTop =
          Math.max(0, Math.min(1, progress)) * (scroller.scrollHeight - scroller.clientHeight);
        updateDescriptionScrollHint(entry);
      };
      scrollbar.addEventListener(
        "pointerdown",
        (event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          const thumb = thumbElement.getBoundingClientRect();
          grabOffset =
            event.clientY >= thumb.top && event.clientY <= thumb.bottom
              ? event.clientY - thumb.top
              : thumb.height / 2;
          scrollbar.setPointerCapture(event.pointerId);
          scroller.focus({ preventScroll: true });
          dragDescription(event);
        },
        { signal },
      );
      scrollbar.addEventListener(
        "pointermove",
        (event) => {
          if (scrollbar.hasPointerCapture(event.pointerId)) dragDescription(event);
        },
        { signal },
      );
      scrollbar.addEventListener(
        "pointerup",
        (event) => {
          if (scrollbar.hasPointerCapture(event.pointerId))
            scrollbar.releasePointerCapture(event.pointerId);
        },
        { signal },
      );
    }
  }

  /** 系统明确要求减少动态时保留同一张 modal 图片，但不制造会让辅助技术难以跟随的中间状态。 */
  function shouldReduceMediaMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /** 零尺寸的隐藏缩略图不能作为动画起点或终点，直接打开能避免从视口原点跳入。 */
  function getVisibleRect(element: Element | undefined) {
    if (!element) return undefined;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 ? rect : undefined;
  }

  /** 清理上一轮代理和 Web Animations，确保快速重复开关时只有最后一次过渡能写入 dialog。 */
  function clearMediaMotion(media: CommunityMediaDialog) {
    media.animation?.cancel();
    media.animation = undefined;
    media.proxy?.remove();
    media.proxy = undefined;
    delete media.dialog.dataset.communityMediaMotion;
  }

  /** 临时代理置于顶层 dialog 内，才能在原生 backdrop 之上连贯地穿过两种尺寸。 */
  function createMediaProxy(media: CommunityMediaDialog, source: HTMLImageElement, rect: DOMRect) {
    const proxy = source.cloneNode(false) as HTMLImageElement;
    proxy.className = "community-media-motion-proxy";
    proxy.removeAttribute("srcset");
    proxy.removeAttribute("sizes");
    proxy.removeAttribute("width");
    proxy.removeAttribute("height");
    proxy.alt = "";
    proxy.setAttribute("aria-hidden", "true");
    proxy.src = source.currentSrc || source.src;
    proxy.style.left = `${rect.left}px`;
    proxy.style.top = `${rect.top}px`;
    proxy.style.width = `${rect.width}px`;
    proxy.style.height = `${rect.height}px`;
    proxy.style.borderRadius = getComputedStyle(source).borderRadius;
    media.dialog.append(proxy);
    media.proxy = proxy;
    return proxy;
  }

  /** 立即收起用于减少动态、无可见缩略图和中途打断；焦点仍准确回到打开图片的按钮。 */
  function closeMediaImmediately(media: CommunityMediaDialog, restoreFocus: boolean) {
    media.motionId += 1;
    clearMediaMotion(media);
    if (media.dialog.open) media.dialog.close();
    if (restoreFocus) media.source?.focus({ preventScroll: true });
  }

  /** 将缩略图复制到顶层并展开至 dialog 内的同一图片，避免把阅读者带到一套新的弹窗设计。 */
  async function animateMediaOpen(
    media: CommunityMediaDialog,
    thumbnail: HTMLImageElement,
    motionId: number,
  ) {
    await media.image.decode().catch(() => undefined);
    if (disposed || media.motionId !== motionId || !media.dialog.open) return;
    const start = getVisibleRect(thumbnail);
    const end = getVisibleRect(media.image);
    if (!start || !end) {
      delete media.dialog.dataset.communityMediaMotion;
      return;
    }
    const proxy = createMediaProxy(media, thumbnail, start);
    const scaleX = end.width / start.width;
    const scaleY = end.height / start.height;
    const translateX = end.left - start.left;
    const translateY = end.top - start.top;
    const startRadius = getComputedStyle(thumbnail).borderRadius;
    window.requestAnimationFrame(() => {
      if (disposed || media.motionId !== motionId || media.proxy !== proxy || !media.dialog.open)
        return;
      media.dialog.dataset.communityMediaMotion = "active";
      const animation = proxy.animate(
        [
          { transform: "translate3d(0, 0, 0) scale(1)", borderRadius: startRadius },
          {
            transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`,
            borderRadius: "0px",
          },
        ],
        {
          duration: communityMediaMotion.enterDuration,
          easing: communityMediaMotion.enterEasing,
          fill: "forwards",
        },
      );
      media.animation = animation;
      void animation.finished
        .catch(() => undefined)
        .then(() => {
          if (media.motionId !== motionId || media.proxy !== proxy) return;
          proxy.remove();
          media.proxy = undefined;
          media.animation = undefined;
          delete media.dialog.dataset.communityMediaMotion;
        });
    });
  }

  /** 反向收回使用当前大图为代理，保持图片、背景和焦点在同一条阅读路径上返回资料卡。 */
  function dismissMedia(media: CommunityMediaDialog) {
    if (!media.dialog.open) return;
    const thumbnail = media.source?.querySelector<HTMLImageElement>("img") ?? undefined;
    if (!thumbnail) {
      closeMediaImmediately(media, true);
      return;
    }
    const start = getVisibleRect(media.image);
    const end = getVisibleRect(thumbnail);
    if (
      shouldReduceMediaMotion() ||
      !start ||
      !end ||
      media.proxy ||
      media.animation ||
      media.dialog.dataset.communityMediaMotion
    ) {
      closeMediaImmediately(media, true);
      return;
    }
    media.motionId += 1;
    const motionId = media.motionId;
    media.dialog.dataset.communityMediaMotion = "closing";
    const proxy = createMediaProxy(media, media.image, start);
    const scaleX = end.width / start.width;
    const scaleY = end.height / start.height;
    const translateX = end.left - start.left;
    const translateY = end.top - start.top;
    window.requestAnimationFrame(() => {
      if (disposed || media.motionId !== motionId || media.proxy !== proxy || !media.dialog.open)
        return;
      media.dialog.dataset.communityMediaMotion = "exit";
      const animation = proxy.animate(
        [
          { transform: "translate3d(0, 0, 0) scale(1)", borderRadius: "0px" },
          {
            transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`,
            borderRadius: getComputedStyle(thumbnail).borderRadius,
          },
        ],
        {
          duration: communityMediaMotion.exitDuration,
          easing: communityMediaMotion.exitEasing,
          fill: "forwards",
        },
      );
      media.animation = animation;
      void animation.finished
        .catch(() => undefined)
        .then(() => {
          if (media.motionId !== motionId || media.proxy !== proxy) return;
          proxy.remove();
          media.proxy = undefined;
          media.animation = undefined;
          delete media.dialog.dataset.communityMediaMotion;
          if (media.dialog.open) media.dialog.close();
          media.source?.focus({ preventScroll: true });
        });
    });
  }

  /** 打开时先取得缩略图的实际几何，再由 native dialog 承担焦点管理和 Esc 语义。 */
  function openMedia(trigger: HTMLButtonElement, media: CommunityMediaDialog) {
    const source = trigger.dataset.communityMediaSrc;
    if (!source) return;
    media.motionId += 1;
    clearMediaMotion(media);
    media.source = trigger;
    media.image.src = source;
    media.image.alt = trigger.dataset.communityMediaAlt ?? "";
    if (!media.dialog.open) media.dialog.showModal();
    media.close.focus({ preventScroll: true });
    const thumbnail = trigger.querySelector<HTMLImageElement>("img") ?? undefined;
    if (!thumbnail || shouldReduceMediaMotion() || !getVisibleRect(thumbnail)) return;
    media.dialog.dataset.communityMediaMotion = "enter";
    void animateMediaOpen(media, thumbnail, media.motionId);
  }

  for (const trigger of root.querySelectorAll<HTMLButtonElement>("[data-community-story-open]")) {
    const neighborhood = trigger.closest<HTMLElement>(".community-neighborhood");
    const dialog = neighborhood?.querySelector<HTMLDialogElement>("[data-community-media-dialog]");
    const media = mediaDialogs.find((entry) => entry.dialog === dialog);
    if (!media) continue;
    trigger.addEventListener("click", () => openMedia(trigger, media), { signal });
  }
  for (const media of mediaDialogs) {
    media.close.addEventListener("click", () => dismissMedia(media), { signal });
    media.dialog.addEventListener(
      "cancel",
      (event) => {
        event.preventDefault();
        dismissMedia(media);
      },
      { signal },
    );
    media.dialog.addEventListener(
      "click",
      (event) => {
        if (event.target === media.dialog) dismissMedia(media);
      },
      { signal },
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
        !active.panel.contains(event.target) &&
        !isInsideMediaDialog(event.target)
      )
        close(false, true);
    },
    { signal },
  );
  document.addEventListener(
    "keydown",
    (event) => {
      pointerKind = "";
      if (event.key === "Escape" && active && !isInsideMediaDialog(document.activeElement)) {
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
      if (
        active &&
        event.target instanceof Node &&
        !active.details.contains(event.target) &&
        !isInsideMediaDialog(event.target)
      )
        close();
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
    for (const media of mediaDialogs) closeMediaImmediately(media, false);
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
      for (const media of mediaDialogs) closeMediaImmediately(media, false);
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
