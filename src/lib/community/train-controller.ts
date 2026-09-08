import { getHomeTrainTooltipPlacement } from "../../data/home-route-train.ts";
import { bindTrainTooltipInteractions } from "../train-tooltip-interactions.ts";
import { readTrainTooltipStyle } from "../train-tooltip-layout.ts";
import { bindTrainJourneyNavigation, selectTrainJourneySection } from "../train-journey.ts";

/** 社区只提供固定列车锚点与章节进度，面板视图、输入和跳站均复用首页模块。 */
export function setupCommunityTrain(
  root: HTMLElement,
  closeMap: (dismissPreview?: boolean) => void,
  signal: AbortSignal,
) {
  const trigger = root.querySelector<HTMLButtonElement>("[data-community-train]")!;
  const panel = root.querySelector<HTMLElement>(".community-guide")!;
  const picker = panel.querySelector<HTMLElement>("[data-home-journey-picker]")!;
  const header = document.querySelector<HTMLElement>(".site-header");
  const stops = [...root.querySelectorAll<HTMLElement>("[data-community-stop]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let open = false;
  let pinned = false;
  let navigationSuppressed = false;
  let navigationTimer = 0;
  let frame = 0;
  let styleDirty = true;
  let style = readTrainTooltipStyle(panel);
  let currentId = "";
  for (const stop of stops) stop.setAttribute("tabindex", "-1");

  /** 只写变化后的尺寸和位移；字体及视口失效以外的滚动不重新测字。 */
  function position(opening = false) {
    if (signal.aborted || !open) return;
    if (styleDirty) {
      style = readTrainTooltipStyle(panel);
      styleDirty = false;
    }
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft ?? 0;
    const top = viewport?.offsetTop ?? 0;
    const width = viewport?.width ?? innerWidth;
    const height = viewport?.height ?? innerHeight;
    const bottom = top + height;
    const headerBottom = header?.getBoundingClientRect().bottom ?? top;
    const safeTop = height <= 440 ? top + 20 : Math.max(top + 20, headerBottom + 12);
    const anchor = trigger.getBoundingClientRect();
    let tooltipSize = { width: panel.offsetWidth, height: panel.offsetHeight };
    const inlineSize = `${Math.max(0, Math.min(style.preferredInlineSize, width - 40))}px`;
    const blockSize = `${Math.max(0, bottom - safeTop - 20 - style.borderBlockSize)}px`;
    let sizeChanged = false;
    for (const [key, value] of [
      ["--home-arrival-tooltip-inline-size", inlineSize],
      ["--home-arrival-tooltip-content-max-block-size", blockSize],
    ]) {
      if (panel.style.getPropertyValue(key) !== value) {
        panel.style.setProperty(key, value);
        sizeChanged = true;
        schedule();
      }
    }
    // 首次打开只同步读取一次新尺寸，在显现之前完成定位；滚动仍只用帧首读数。
    if (opening && sizeChanged)
      tooltipSize = { width: panel.offsetWidth, height: panel.offsetHeight };
    const placement = getHomeTrainTooltipPlacement({
      anchorBounds: anchor,
      tooltipSize,
      viewportBounds: { left, top, width, height, right: left + width, bottom },
      preferredSafeTop: safeTop,
      preferBlockPlacement: false,
      edge: 20,
      gap: style.anchorGap,
    });
    const translate = `${placement.left}px ${placement.top}px`;
    if (panel.style.translate !== translate) panel.style.translate = translate;
    if (panel.dataset.placement !== placement.placement)
      panel.dataset.placement = placement.placement;
  }

  /** 明确打开列车时关闭地图资料；关闭状态同时撤销可聚焦性，保持与首页相同的 ARIA 契约。 */
  function setOpen(next: boolean, explicit = false) {
    if ((signal.aborted && next) || (next && navigationSuppressed && !explicit)) return;
    const mode = next ? (pinned ? "pinned" : "preview") : "closed";
    if (open === next && trigger.dataset.tooltipMode === mode) return;
    if (next && !open) closeMap();
    open = next;
    if (!open) pinned = false;
    if (open) position(true);
    trigger.dataset.tooltipOpen = String(open);
    trigger.dataset.tooltipMode = mode;
    trigger.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    panel.inert = !open;
    if (open) schedule();
  }
  const interactions = bindTrainTooltipInteractions({
    triggers: [trigger],
    panel,
    activateTrigger: () => {},
    getActiveTrigger: () => trigger,
    isOpen: () => open,
    isPinned: () => pinned,
    setPinned: (value) => {
      pinned = value;
    },
    setOpen,
    canPreview: () => !navigationSuppressed,
    signal,
  });

  /** 固定同一章节时不重复写 DOM；两页复用线路色、站名及 aria-current 的同步过程。 */
  function selectSection(id: string) {
    if (id !== currentId && selectTrainJourneySection(picker, id)) {
      currentId = id;
      schedule();
    }
  }
  /** 以阅读中线选站，短页尾到达页面底部时选中最后一站。 */
  function updateChapter() {
    if (navigationSuppressed) return;
    const current =
      root.getBoundingClientRect().bottom <= innerHeight + 2
        ? stops.at(-1)
        : (stops.filter((stop) => stop.getBoundingClientRect().top <= innerHeight * 0.5).at(-1) ??
          stops[0]);
    if (current) selectSection(current.id);
  }
  bindTrainJourneyNavigation({
    picker,
    selectSection,
    beforeNavigate: () => {
      closeMap(true);
      interactions.cancelOpen();
      interactions.cancelClose();
      navigationSuppressed = true;
      window.clearTimeout(navigationTimer);
      navigationTimer = window.setTimeout(
        () => {
          navigationSuppressed = false;
          schedule();
        },
        reducedMotion.matches ? 0 : 1500,
      );
    },
    close: () => setOpen(false),
    signal,
  });

  /** 汇入社区原有滚动帧；仅尺寸变化另排下一帧，避免测量与写入在同帧反复交错。 */
  function update() {
    if (signal.aborted) return;
    updateChapter();
    position();
  }
  /** ResizeObserver、字体和输入动作共用一个可取消的帧请求。 */
  function schedule() {
    if (signal.aborted || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  }
  const observer = new ResizeObserver(schedule);
  observer.observe(panel);
  if (header) observer.observe(header);
  window.addEventListener(
    "resize",
    () => {
      styleDirty = true;
      schedule();
    },
    { signal },
  );
  document.fonts.ready.then(() => {
    if (!signal.aborted) {
      styleDirty = true;
      schedule();
    }
  });
  document.fonts.addEventListener(
    "loadingdone",
    () => {
      styleDirty = true;
      schedule();
    },
    { signal },
  );
  window.addEventListener(
    "pagehide",
    () => {
      window.clearTimeout(navigationTimer);
      navigationSuppressed = false;
      cancelAnimationFrame(frame);
      frame = 0;
    },
    { signal },
  );
  signal.addEventListener(
    "abort",
    () => {
      observer.disconnect();
      window.clearTimeout(navigationTimer);
      cancelAnimationFrame(frame);
    },
    { once: true },
  );
  setOpen(false);
  updateChapter();
  return { update, close: () => setOpen(false) };
}
