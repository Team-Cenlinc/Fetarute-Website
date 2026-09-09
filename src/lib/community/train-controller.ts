import { getHomeTrainTooltipPlacement } from "../../data/home-route-train.ts";
import { bindTrainTooltipInteractions } from "../train-tooltip-interactions.ts";
import { readTrainTooltipStyle, type TrainTooltipStyle } from "../train-tooltip-layout.ts";
import { bindTrainJourneyNavigation, selectTrainJourneySection } from "../train-journey.ts";

/** 社区概念图中可承载列车和 Tooltip 的三条已绘制线路。 */
type CommunityTrainLine = "route" | "arrival" | "connection";

/** 用于滚动帧写入的列车节点；线路身份决定其在地图中的旅行几何。 */
interface CommunityTrainTrigger {
  line: CommunityTrainLine;
  trigger: HTMLButtonElement;
}

/** 一帧开头采集的社区列车几何；后续章节、线路和 Tooltip 写入只能消费这份快照。 */
interface CommunityTrainFrameSnapshot {
  viewport: {
    innerHeight: number;
    left: number;
    top: number;
    width: number;
    height: number;
    bottom: number;
  };
  rootBottom: number;
  stops: readonly { id: string; top: number }[];
  routeOffset: string;
  arrival?: { x: string; y: string; angle: string };
  connectionOffset?: string;
  tooltip?: {
    anchor: DOMRect;
    headerBottom: number;
    size: { width: number; height: number };
    style: TrainTooltipStyle;
  };
}

/** 将不受信任的几何进度收束在可见路线的 0→1 区间内。 */
function clampCommunityTrainProgress(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** 只在数值改变时写入 CSS 变量，避免滚动帧制造无意义的样式失效。 */
function setCommunityTrainStyle(
  element: HTMLElement | null | undefined,
  name: string,
  value: string,
): void {
  if (element && element.style.getPropertyValue(name) !== value)
    element.style.setProperty(name, value);
}

/**
 * 社区页的列车控制器：三条实际绘制的线路共享首页 Tooltip 输入契约，
 * 而位置、当前章节和 URL hash 都从同一条滚动进度链路更新。
 */
export function setupCommunityTrain(
  root: HTMLElement,
  closeMap: (dismissPreview?: boolean) => void,
  signal: AbortSignal,
) {
  const triggers: CommunityTrainTrigger[] = [
    ...root.querySelectorAll<HTMLButtonElement>("[data-community-train]"),
  ].flatMap((trigger) => {
    const line = trigger.dataset.communityTrainLine;
    return line === "route" || line === "arrival" || line === "connection"
      ? [{ line, trigger }]
      : [];
  });
  const panelElement = root.querySelector<HTMLElement>(".community-guide");
  const pickerElement = panelElement?.querySelector<HTMLElement>("[data-home-journey-picker]");
  const header = document.querySelector<HTMLElement>(".site-header");
  const stops = [...root.querySelectorAll<HTMLElement>("[data-community-stop]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const routeTrain = root.querySelector<HTMLElement>(".community-train--route");
  const arrivalTrain = root.querySelector<HTMLElement>(".community-train--arrival");
  const connectionTrain = root.querySelector<HTMLElement>(".community-train--connection");
  const landing = root.querySelector<HTMLElement>(".community-landing");
  const arrivalPath = root.querySelector<SVGPathElement>("[data-community-arrival-path]");
  const crossing = root.querySelector<HTMLElement>(".community-district__crossing");

  if (!triggers.length || !panelElement || !pickerElement) {
    return { update: () => {}, close: () => {} };
  }
  const panel = panelElement;
  const picker = pickerElement;

  let activeTrigger =
    triggers.find((candidate) => candidate.line === "route")?.trigger ?? triggers[0].trigger;
  let open = false;
  let pinned = false;
  let navigationSuppressed = false;
  let navigationTimer = 0;
  let frame = 0;
  let styleDirty = true;
  let style = readTrainTooltipStyle(panel);
  let currentId = "";
  for (const stop of stops) stop.setAttribute("tabindex", "-1");

  /** 同一张 Tooltip 只属于当前列车；其余列车保持可预览但不伪装为已展开。 */
  function setTriggerOpenState(trigger: HTMLButtonElement, next: boolean, mode: string): void {
    trigger.dataset.tooltipOpen = String(next);
    trigger.dataset.tooltipMode = mode;
    trigger.setAttribute("aria-expanded", String(next));
  }

  /** 指针、键盘或触摸进入另一条线时，平滑交接 Tooltip 的真实几何锚点。 */
  function activateTrigger(trigger: HTMLElement): void {
    if (!(trigger instanceof HTMLButtonElement) || activeTrigger === trigger) return;
    setTriggerOpenState(activeTrigger, false, "closed");
    activeTrigger = trigger;
    setTriggerOpenState(activeTrigger, open, open ? (pinned ? "pinned" : "preview") : "closed");
    if (open) schedule();
  }

  /** 将帧内所有窗口、路径和 DOMRect 读取集中在写入前，避免滚动时触发强制回流。 */
  function readFrameSnapshot(): CommunityTrainFrameSnapshot {
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft ?? 0;
    const top = viewport?.offsetTop ?? 0;
    const width = viewport?.width ?? innerWidth;
    const height = viewport?.height ?? innerHeight;
    const bottom = top + height;
    const viewportSnapshot = { innerHeight, left, top, width, height, bottom };
    const stopSnapshot = stops.map((stop) => ({
      id: stop.id,
      top: stop.getBoundingClientRect().top,
    }));
    const rootBottom = root.getBoundingClientRect().bottom;
    const firstStop = stopSnapshot[0];
    const lastStop = stopSnapshot.at(-1);
    const routeProgress =
      firstStop && lastStop
        ? clampCommunityTrainProgress(
            (innerHeight * 0.5 - firstStop.top) / Math.max(1, lastStop.top - firstStop.top),
          )
        : 0.5;
    const stableProgress = reducedMotion.matches ? 0.5 : routeProgress;
    let arrival: CommunityTrainFrameSnapshot["arrival"];
    if (landing && arrivalPath && root.dataset.communityArrivalReady === "true") {
      const landingBounds = landing.getBoundingClientRect();
      const landingProgress = reducedMotion.matches
        ? 0.5
        : clampCommunityTrainProgress(
            (innerHeight * 0.66 - landingBounds.top) /
              Math.max(1, landingBounds.height + innerHeight * 0.35),
          );
      const length = arrivalPath.getTotalLength();
      if (Number.isFinite(length) && length > 0) {
        /* 静态路径的大半在画面外；从可见斜段进入，才会在 Landing 内完成到站而非突然出现。 */
        const distance = length * (0.8 + landingProgress * 0.2);
        const point = arrivalPath.getPointAtLength(distance);
        /* 用相邻路径点的切线校正车体；未走到弯折处时为斜向，到站竖轨时自然转正。 */
        const tangentSpan = Math.min(12, Math.max(1, length * 0.002));
        const before = arrivalPath.getPointAtLength(Math.max(0, distance - tangentSpan));
        const after = arrivalPath.getPointAtLength(Math.min(length, distance + tangentSpan));
        const tangentAngle =
          Math.atan2(after.y - before.y, after.x - before.x) * (180 / Math.PI) - 90;
        arrival = { x: `${point.x}px`, y: `${point.y}px`, angle: `${tangentAngle}deg` };
      }
    }
    let connectionOffset: string | undefined;
    if (crossing) {
      const crossingBounds = crossing.getBoundingClientRect();
      const crossingProgress = reducedMotion.matches
        ? 0.5
        : clampCommunityTrainProgress(
            (innerHeight * 0.72 - crossingBounds.top) /
              Math.max(1, innerHeight * 1.42 + crossingBounds.height),
          );
      connectionOffset = `${10 + crossingProgress * 80}%`;
    }
    let tooltip: CommunityTrainFrameSnapshot["tooltip"];
    if (open) {
      if (styleDirty) {
        style = readTrainTooltipStyle(panel);
        styleDirty = false;
      }
      tooltip = {
        anchor: activeTrigger.getBoundingClientRect(),
        headerBottom: header?.getBoundingClientRect().bottom ?? top,
        size: { width: panel.offsetWidth, height: panel.offsetHeight },
        style,
      };
    }
    return {
      viewport: viewportSnapshot,
      rootBottom,
      stops: stopSnapshot,
      routeOffset: `${Math.round((stableProgress - 0.5) * Math.min(innerHeight * 0.36, 280))}px`,
      arrival,
      connectionOffset,
      tooltip,
    };
  }

  /** 明确打开列车时关闭地图资料；关闭状态同时撤销可聚焦性，保持与首页相同的 ARIA 契约。 */
  function setOpen(next: boolean, explicit = false) {
    if ((signal.aborted && next) || (next && navigationSuppressed && !explicit)) return;
    const mode = next ? (pinned ? "pinned" : "preview") : "closed";
    if (open === next && activeTrigger.dataset.tooltipMode === mode) return;
    if (next && !open) closeMap();
    open = next;
    if (!open) pinned = false;
    for (const { trigger } of triggers)
      setTriggerOpenState(
        trigger,
        open && trigger === activeTrigger,
        trigger === activeTrigger ? mode : "closed",
      );
    panel.setAttribute("aria-hidden", String(!open));
    panel.inert = !open;
    if (open) update();
  }

  const interactions = bindTrainTooltipInteractions({
    triggers: triggers.map(({ trigger }) => trigger),
    panel,
    activateTrigger,
    getActiveTrigger: () => activeTrigger,
    isOpen: () => open,
    isPinned: () => pinned,
    setPinned: (value) => {
      pinned = value;
    },
    setOpen,
    canPreview: () => !navigationSuppressed,
    signal,
  });

  /** 被动滚动只改写当前历史条目；快选点击仍由共享导航器创建一条可返回的记录。 */
  function replaceActiveJourneyHash(sectionId: string): void {
    if (navigationSuppressed) return;
    const nextHash = `#${sectionId}`;
    if (window.location.hash !== nextHash) {
      const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
      window.history.replaceState(window.history.state, "", nextUrl);
    }
  }

  /** 固定同一章节时不重复写 DOM；当前站、路线图和 URL 通过同一选择点保持一致。 */
  function selectSection(id: string, shouldSyncHash = false) {
    if (id !== currentId && selectTrainJourneySection(picker, id)) {
      currentId = id;
      schedule();
    }
    if (shouldSyncHash && currentId === id) replaceActiveJourneyHash(id);
  }

  /** 以阅读中线选站，短页尾到达页面底部时选中最后一站。 */
  function updateChapter(snapshot: CommunityTrainFrameSnapshot) {
    if (navigationSuppressed) return;
    const current =
      snapshot.rootBottom <= snapshot.viewport.innerHeight + 2
        ? snapshot.stops.at(-1)
        : (snapshot.stops
            .filter((stop) => stop.top <= snapshot.viewport.innerHeight * 0.5)
            .at(-1) ?? snapshot.stops[0]);
    if (current) selectSection(current.id, true);
  }

  /** 让已绘制的 DS、WS、PN 三线列车消费同一份帧首快照；此阶段禁止读取布局。 */
  function writeTravel(snapshot: CommunityTrainFrameSnapshot) {
    setCommunityTrainStyle(routeTrain, "--community-route-train-offset", snapshot.routeOffset);
    if (snapshot.arrival) {
      setCommunityTrainStyle(arrivalTrain, "--community-arrival-train-x", snapshot.arrival.x);
      setCommunityTrainStyle(arrivalTrain, "--community-arrival-train-y", snapshot.arrival.y);
      setCommunityTrainStyle(
        arrivalTrain,
        "--community-arrival-train-angle",
        snapshot.arrival.angle,
      );
    }
    if (snapshot.connectionOffset)
      setCommunityTrainStyle(
        connectionTrain,
        "--community-connection-train-offset",
        snapshot.connectionOffset,
      );
  }

  /** Tooltip 写入只消费帧首测得的锚点与尺寸；尺寸变化留到下一帧重新测量。 */
  function writeTooltipPosition(snapshot: CommunityTrainFrameSnapshot) {
    const tooltip = snapshot.tooltip;
    if (!tooltip) return;
    const { left, top, width, height, bottom } = snapshot.viewport;
    const safeTop = height <= 440 ? top + 20 : Math.max(top + 20, tooltip.headerBottom + 12);
    const inlineSize = `${Math.max(0, Math.min(tooltip.style.preferredInlineSize, width - 40))}px`;
    const blockSize = `${Math.max(0, bottom - safeTop - 20 - tooltip.style.borderBlockSize)}px`;
    let sizeChanged = false;
    for (const [key, value] of [
      ["--home-arrival-tooltip-inline-size", inlineSize],
      ["--home-arrival-tooltip-content-max-block-size", blockSize],
    ]) {
      if (panel.style.getPropertyValue(key) !== value) {
        panel.style.setProperty(key, value);
        sizeChanged = true;
      }
    }
    const placement = getHomeTrainTooltipPlacement({
      anchorBounds: tooltip.anchor,
      tooltipSize: tooltip.size,
      viewportBounds: { left, top, width, height, right: left + width, bottom },
      preferredSafeTop: safeTop,
      preferBlockPlacement: false,
      edge: 20,
      gap: tooltip.style.anchorGap,
    });
    const translate = `${placement.left}px ${placement.top}px`;
    if (panel.style.translate !== translate) panel.style.translate = translate;
    if (panel.dataset.placement !== placement.placement)
      panel.dataset.placement = placement.placement;
    if (sizeChanged) schedule();
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

  /** 汇入社区原有滚动帧；先收集几何，再写章节、列车和 Tooltip，禁止帧内读写交错。 */
  function update() {
    if (signal.aborted) return;
    const snapshot = readFrameSnapshot();
    updateChapter(snapshot);
    writeTravel(snapshot);
    writeTooltipPosition(snapshot);
  }

  /** ResizeObserver、字体、动态偏好和输入动作共用一个可取消的帧请求。 */
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
  if (landing) observer.observe(landing);
  if (crossing) observer.observe(crossing);
  window.addEventListener(
    "resize",
    () => {
      styleDirty = true;
      schedule();
    },
    { signal },
  );
  reducedMotion.addEventListener("change", schedule, { signal });
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
  update();
  return { update, close: () => setOpen(false) };
}
