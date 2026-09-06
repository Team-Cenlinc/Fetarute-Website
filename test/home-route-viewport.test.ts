import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  classifyHomeRouteViewportChange,
  createHomePageFrameCoordinator,
  createHomeRouteFrameScheduler,
  getHomeRouteVisibleViewportBounds,
  getHomeRouteViewportTransientState,
  readHomeRouteViewportSnapshot,
  type HomeRouteViewportSnapshot,
} from "../src/data/home-route-viewport.ts";

const homePageSource = readFileSync(
  new URL("../src/components/HomePage.astro", import.meta.url),
  "utf8",
);
const homeOnwardSource = readFileSync(
  new URL("../src/components/HomeOnwardSection.astro", import.meta.url),
  "utf8",
);
const homeCommunitySource = readFileSync(
  new URL("../src/components/HomeCommunitySection.astro", import.meta.url),
  "utf8",
);
const homeTriServerSource = readFileSync(
  new URL("../src/components/HomeTriServerSection.astro", import.meta.url),
  "utf8",
);
const homeGalleryControllerSource = readFileSync(
  new URL("../src/lib/home/gallery-controller.ts", import.meta.url),
  "utf8",
);
const homeOnwardControllerSource = readFileSync(
  new URL("../src/lib/home/onward-controller.ts", import.meta.url),
  "utf8",
);
const homeCommunityControllerSource = readFileSync(
  new URL("../src/lib/home/community-controller.ts", import.meta.url),
  "utf8",
);
const homeTriServerControllerSource = readFileSync(
  new URL("../src/lib/home/tri-server-controller.ts", import.meta.url),
  "utf8",
);
const siteHeaderSource = readFileSync(
  new URL("../src/components/SiteHeader.astro", import.meta.url),
  "utf8",
);
const homeStylesSource = readFileSync(new URL("../src/styles/home.css", import.meta.url), "utf8");
const homeRouteScriptStart = homePageSource.indexOf("      getHomeFooterRevealProgress,");
const homeRouteScriptEnd = homePageSource.indexOf("  </script>", homeRouteScriptStart);
const homeRouteScriptSource = homePageSource.slice(homeRouteScriptStart, homeRouteScriptEnd);

/** 建立 iPhone Safari 地址栏收放前后的最小 viewport 快照。 */
const createViewportSnapshot = (
  overrides: Partial<HomeRouteViewportSnapshot> = {},
): HomeRouteViewportSnapshot => ({
  layoutWidth: 440,
  layoutHeight: 836,
  visualWidth: 440,
  visualHeight: 836,
  visualOffsetLeft: 0,
  visualOffsetTop: 0,
  visualScale: 1,
  orientationAngle: 0,
  ...overrides,
});

test("Safari 地址栏只改变可见高度时属于暂态，响应式宽度或缩放变化才重算语义", () => {
  const expanded = createViewportSnapshot();

  assert.equal(
    classifyHomeRouteViewportChange(
      expanded,
      createViewportSnapshot({ visualHeight: 796, visualOffsetTop: 40 }),
    ),
    "transient",
  );
  assert.equal(
    classifyHomeRouteViewportChange(
      expanded,
      createViewportSnapshot({ layoutWidth: 390, visualWidth: 390 }),
    ),
    "effective",
  );
  assert.equal(
    classifyHomeRouteViewportChange(expanded, createViewportSnapshot({ visualScale: 1.25 })),
    "effective",
  );
});

test("同一帧内的滚动和 viewport 请求只渲染一次，并保留其中最强的更新需求", () => {
  const frames: FrameRequestCallback[] = [];
  const updates: Array<{
    measureGeometry: boolean;
    syncJourney: boolean;
    placeTooltip: boolean;
  }> = [];
  const scheduler = createHomeRouteFrameScheduler({
    requestFrame: (callback) => {
      frames.push(callback);
      return frames.length;
    },
    update: (request) => updates.push(request),
  });

  scheduler.request({ syncJourney: true });
  scheduler.request({ placeTooltip: true });
  scheduler.request({ measureGeometry: true });

  assert.equal(frames.length, 1);
  assert.deepEqual(updates, []);
  frames.shift()?.(16);
  assert.deepEqual(updates, [{ measureGeometry: true, syncJourney: true, placeTooltip: true }]);

  scheduler.request();
  assert.equal(frames.length, 1);
});

test("首页统一协调器先完成全部 DOM reads，再集中执行 writes", () => {
  const frames: FrameRequestCallback[] = [];
  const operations: string[] = [];
  const coordinator = createHomePageFrameCoordinator({
    requestFrame: (callback) => {
      frames.push(callback);
      return frames.length;
    },
  });

  coordinator.register({
    read: (request) => {
      operations.push(`route-read:${request.measureGeometry}`);
      return "route-measurement";
    },
    write: (measurement) => operations.push(`route-write:${measurement}`),
  });
  coordinator.register({
    read: (request) => {
      operations.push(`section-read:${request.syncJourney}`);
      return "section-measurement";
    },
    write: (measurement) => operations.push(`section-write:${measurement}`),
  });

  coordinator.request({ syncJourney: true });
  coordinator.request({ measureGeometry: true });

  assert.equal(frames.length, 1);
  assert.deepEqual(operations, []);
  frames.shift()?.(16);
  assert.deepEqual(operations, [
    "route-read:true",
    "section-read:true",
    "route-write:route-measurement",
    "section-write:section-measurement",
  ]);
});

test("首页统一协调器跳过离屏参与者，并把 write 中的新请求留到下一帧", () => {
  const frames: FrameRequestCallback[] = [];
  const operations: string[] = [];
  const coordinator = createHomePageFrameCoordinator({
    requestFrame: (callback) => {
      frames.push(callback);
      return frames.length;
    },
  });

  coordinator.register({
    isActive: () => false,
    read: () => operations.push("offscreen-read"),
    write: () => operations.push("offscreen-write"),
  });
  const unregister = coordinator.register({
    read: () => "active-measurement",
    write: () => {
      operations.push("active-write");
      coordinator.request({ placeTooltip: true });
    },
  });

  coordinator.request();
  frames.shift()?.(16);
  assert.deepEqual(operations, ["active-write"]);
  assert.equal(frames.length, 1);

  unregister();
  frames.shift()?.(32);
  assert.deepEqual(operations, ["active-write"]);
});

test("稀疏 scroll 事件启动连续采样，滚动位置仍变化时每个浏览器帧都更新并在稳定后休眠", () => {
  const frames: FrameRequestCallback[] = [];
  const sampledScrollPositions: number[] = [];
  let scrollY = 0;
  const coordinator = createHomePageFrameCoordinator({
    requestFrame: (callback) => {
      frames.push(callback);
      return frames.length;
    },
    readScrollPosition: () => ({ x: 0, y: scrollY }),
  });

  coordinator.register({
    read: () => scrollY,
    write: (measurement) => sampledScrollPositions.push(measurement),
  });

  coordinator.requestScroll({ syncJourney: true });
  frames.shift()?.(0);
  scrollY = 40;
  frames.shift()?.(16);
  scrollY = 80;
  frames.shift()?.(32);

  assert.deepEqual(sampledScrollPositions, [0, 40, 80]);
  assert.equal(frames.length, 1);

  frames.shift()?.(80);
  frames.shift()?.(128);
  frames.shift()?.(160);

  assert.equal(frames.length, 0);
});

test("惯性尾段的亚像素滚动会持续刷新采样窗口，不会每 120ms 停启一次", () => {
  const frames: FrameRequestCallback[] = [];
  const sampledScrollPositions: number[] = [];
  let scrollY = 0;
  const coordinator = createHomePageFrameCoordinator({
    requestFrame: (callback) => {
      frames.push(callback);
      return frames.length;
    },
    readScrollPosition: () => ({ x: 0, y: scrollY }),
  });

  coordinator.register({
    read: () => scrollY,
    write: (measurement) => sampledScrollPositions.push(measurement),
  });
  coordinator.requestScroll();
  frames.shift()?.(0);

  for (let timestamp = 16; timestamp <= 160; timestamp += 16) {
    scrollY += 0.004;
    frames.shift()?.(timestamp);
  }

  assert.ok(Math.abs((sampledScrollPositions.at(-1) ?? 0) - 0.04) < 0.00001);
  assert.equal(frames.length, 1);
});

test("首页路线、章节和 Header 共用唯一全局滚动帧入口", () => {
  const globalScrollListenerPattern = /window\.addEventListener\(\s*"scroll"/g;

  assert.match(homePageSource, /getHomePageFrameCoordinator\(/);
  assert.equal(homePageSource.match(globalScrollListenerPattern)?.length, 1);
  assert.doesNotMatch(homeOnwardControllerSource, globalScrollListenerPattern);
  assert.doesNotMatch(homeCommunityControllerSource, globalScrollListenerPattern);
  assert.doesNotMatch(homeTriServerControllerSource, globalScrollListenerPattern);
  assert.match(homeOnwardControllerSource, /getHomePageFrameCoordinator\(/);
  assert.match(homeCommunityControllerSource, /getHomePageFrameCoordinator\(/);
  assert.match(homeTriServerControllerSource, /getHomePageFrameCoordinator\(/);
  assert.match(siteHeaderSource, /getHomePageFrameCoordinator\(/);
  assert.match(homeCommunityControllerSource, /IntersectionObserver/);
  assert.match(homeTriServerControllerSource, /IntersectionObserver/);
});

test("窗口滚动使用协调器的连续采样入口，reduced-motion 仍只消费单次合帧", () => {
  assert.match(homeRouteScriptSource, /const requestRouteScrollUpdate =/);
  assert.match(
    homeRouteScriptSource,
    /reducedMotionQuery\.matches\s*\?\s*homePageFrameCoordinator\.request\(request\)\s*:\s*homePageFrameCoordinator\.requestScroll\(request\)/,
  );
  assert.match(
    homeRouteScriptSource,
    /window\.addEventListener\([\s\S]*?"scroll"[\s\S]*?requestRouteScrollUpdate\(\{[\s\S]*?syncJourney:\s*true/,
  );
});

test("路线参与者在统一 read 阶段冻结所需 DOM 几何，write 阶段只消费快照", () => {
  assert.ok(homeRouteScriptStart >= 0);
  assert.ok(homeRouteScriptEnd > homeRouteScriptStart);
  assert.match(homeRouteScriptSource, /const readHomeRouteFrameMeasurements/);
  assert.match(
    homeRouteScriptSource,
    /read:\s*\([^)]*\)\s*:\s*HomeRouteFrameMeasurement\s*=>\s*\{[\s\S]*?elementMeasurements:\s*readHomeRouteFrameMeasurements\(\{/,
  );
  assert.equal(homeRouteScriptSource.match(/\.getBoundingClientRect\(\)/g)?.length, 1);
  assert.equal(homeRouteScriptSource.match(/htmlElement\?\.offsetWidth\b/g)?.length, 1);
  assert.equal(homeRouteScriptSource.match(/htmlElement\?\.offsetHeight\b/g)?.length, 1);
  assert.doesNotMatch(homeRouteScriptSource, /homeArrivalTrain\.offset(?:Width|Height)/);
});

test("列车与 Tooltip 在 Safari 地址栏过渡中共用最新可见边界，只有章节语义延迟", () => {
  assert.match(
    homeRouteScriptSource,
    /const renderViewportSnapshot\s*=\s*pendingRouteViewportSnapshot/,
  );
  assert.match(homeRouteScriptSource, /routeViewportSnapshot\s*=\s*renderViewportSnapshot/);
  assert.match(homeRouteScriptSource, /getHomeRouteVisibleViewportBounds\(routeViewportSnapshot\)/);
  assert.match(homeRouteScriptSource, /if \(syncJourney && !isRouteViewportTransient\)/);
});

test("Gallery 离屏时暂停，且逐帧位移只写到实际轨道元素", () => {
  assert.match(
    homeGalleryControllerSource,
    /galleryFrameCoordinator\.register\(\{[\s\S]*?isActive:\s*\(\)\s*=>\s*isHomeGalleryActive/,
  );
  assert.match(homeGalleryControllerSource, /homeGalleryTrack\.style\.transform\s*=/);
  assert.doesNotMatch(homeGalleryControllerSource, /--home-gallery-offset/);
  assert.doesNotMatch(homeStylesSource, /--home-gallery-offset/);
});

test("社区主故事的逐帧状态只写在实际消费元素，不再从父节点扩散", () => {
  assert.doesNotMatch(
    homeCommunityControllerSource,
    /mainStory\.style\.setProperty\(\s*"--home-community-main-(?:progress|veil|detail|title-hero-weight)"/,
  );
  assert.match(homeCommunityControllerSource, /setAnimatedStyle\(mainVeil,\s*"opacity"/);
  assert.match(
    homeCommunityControllerSource,
    /setAnimatedStyle\([\s\S]*?mainNarrative,[\s\S]*?"transform"/,
  );
  assert.doesNotMatch(
    homeCommunityControllerSource,
    /setAnimatedStyle\(\s*(?:mainKicker|mainHeadingLine),\s*"color"/,
  );
  assert.match(
    homeCommunitySource,
    /data-home-community-main-phase="detail"[^}]*}[\s\S]*?color:\s*var\(--palette-text\)/,
  );
});

test("续行与 Arrival 提示只在活跃区更新，并跳过相同的目标样式写入", () => {
  assert.match(
    homeRouteScriptSource,
    /if \(isOnwardTransferRouteActive\(\)\) \{\s*renderOnwardTransferTrains\(\);\s*}/,
  );
  assert.doesNotMatch(
    homeRouteScriptSource,
    /homeArrivalRoute\.style\.setProperty\(\s*"--home-arrival-train-hint-/,
  );
  assert.match(
    homeRouteScriptSource,
    /setStylePropertyIfChanged\(\s*homeArrivalTrainHint,\s*"--home-arrival-train-hint-opacity"/,
  );
  assert.doesNotMatch(
    homeRouteScriptSource,
    /homeOnwardTransferRoute\.style\.setProperty\(\s*"--home-transfer-mobile-train-/,
  );
  assert.match(
    homeRouteScriptSource,
    /getHomeMobileTransferTrainViewportCenterY\(\{[\s\S]*?handoffCenterY:[\s\S]*?getRouteBottomTrainCenterY/,
  );
  assert.match(
    homeRouteScriptSource,
    /setOnwardTrainPose\(\s*homeOnwardMobileTrain,[\s\S]*?mobileTrainCenterY/,
  );
  assert.doesNotMatch(
    homeRouteScriptSource,
    /setStylePropertyIfChanged\(\s*homeOnwardMobileTrain,\s*"--home-transfer-mobile-train-translate-y"/,
  );
});

test("路线滚动帧只重测活跃章节，完整盒模型读取保留给真实几何失效", () => {
  assert.match(homeRouteScriptSource, /const homeRouteMeasurementGroups =/);
  assert.match(homeRouteScriptSource, /isHomeRouteMeasurementGroupActive/);
  assert.match(
    homeRouteScriptSource,
    /measureAll:\s*measureGeometry \|\| viewportChange === "effective"/,
  );
  assert.doesNotMatch(
    homeRouteScriptSource,
    /homeRouteMeasurementElements\.map\(\(element\) => \{\s*const bounds = element\.getBoundingClientRect\(\)/,
  );
});

test("Footer 与续行的帧变量直接写到消费元素，路线 dataset 统一跳过同值", () => {
  assert.doesNotMatch(
    homeRouteScriptSource,
    /homeOnwardContentRoute\.style\.setProperty\(\s*"--home-onward-footer-transition-shift"/,
  );
  assert.doesNotMatch(
    homeRouteScriptSource,
    /homeFooterRoute\.style\.setProperty\(\s*"--home-footer-content-(?:offset|opacity)"/,
  );
  assert.match(
    homeRouteScriptSource,
    /setStylePropertyIfChanged\(\s*homeFooterContent,\s*"--home-footer-content-opacity"/,
  );
  assert.match(
    homeRouteScriptSource,
    /setDatasetValueIfChanged\(\s*homeArrivalTrain,\s*"routeVisible"/,
  );
});

test("续行不在父 section 写入无人消费的诊断进度，只保留 Tooltip 使用的颜色进度", () => {
  assert.doesNotMatch(
    homeRouteScriptSource,
    /"(?:incomingTrainProgress|handoffProgress|outgoingTrainProgress|desktopTrainProgress|mobileTrainProgress)"/,
  );
  assert.match(homeRouteScriptSource, /"mobileTrainColorProgress"/);
  assert.match(homeRouteScriptSource, /dataset\.mobileTrainColorProgress/);
});

test("Footer 支撑柱用固定裁窗内的 transform 收束，不在滚动热路径动画 clip-path", () => {
  assert.match(homeOnwardSource, /class="home-onward__pids-support-fill"/);
  assert.match(homeOnwardSource, /\.home-onward__pids-support\s*\{[\s\S]*?overflow:\s*clip/);
  assert.match(
    homeOnwardSource,
    /\.home-onward__pids-support-fill\s*\{[\s\S]*?transform:\s*translateY/,
  );
  assert.doesNotMatch(homeOnwardSource, /will-change:\s*clip-path/);
  assert.doesNotMatch(
    homeOnwardSource,
    /\.home-onward__pids-support(?:-fill)?\s*\{[^}]*clip-path:/,
  );
});

test("BFCache pagehide 保留路线观察器，真实卸载才断开", () => {
  assert.match(
    homeRouteScriptSource,
    /window\.addEventListener\("pagehide",\s*\(event:\s*PageTransitionEvent\)\s*=>\s*\{\s*if\s*\(event\.persisted\)\s*return;/,
  );
});

test("续行稳定帧的样式、区段和 aria-label 都跳过同值 mutation", () => {
  assert.doesNotMatch(
    homeRouteScriptSource,
    /homeOnwardDesktopOutgoingTrain\.dataset\.routeSegment\s*=/,
  );
  assert.doesNotMatch(
    homeRouteScriptSource,
    /home(?:OnwardMobileTrain|OnwardDesktopOutgoingTrain|ArrivalTrainVisual)\.style\.removeProperty\(/,
  );
  assert.doesNotMatch(
    homeRouteScriptSource,
    /homeArrivalTrain\.setAttribute\("aria-label",\s*outgoingLabel\)/,
  );
  assert.match(
    homeRouteScriptSource,
    /setAttributeIfChanged\(homeArrivalTrain,\s*"aria-label",\s*outgoingLabel\)/,
  );
});

test("旅程导航只在 section 真正变化时提交 DOM，并复用统一路线帧重排 Tooltip", () => {
  const setActiveSectionStart = homeRouteScriptSource.indexOf("const setActiveJourneySection =");
  const setActiveSectionEnd = homeRouteScriptSource.indexOf("\n      };", setActiveSectionStart);
  const setActiveSectionSource = homeRouteScriptSource.slice(
    setActiveSectionStart,
    setActiveSectionEnd,
  );

  assert.ok(setActiveSectionStart >= 0);
  assert.ok(setActiveSectionEnd > setActiveSectionStart);
  assert.match(homeRouteScriptSource, /let activeJourneySectionId:/);
  assert.match(
    homeRouteScriptSource,
    /const setActiveJourneySection = \(sectionId: string\) => \{\s*if \(activeJourneySectionId === sectionId\) return;/,
  );
  assert.doesNotMatch(
    setActiveSectionSource,
    /window\.requestAnimationFrame\(updateTrainTooltipPlacement\)/,
  );
  assert.match(
    homeRouteScriptSource,
    /activeJourneySectionId = sectionId;\s*requestRouteTrainUpdate\(\{ placeTooltip: true \}\)/,
  );
});

test("换乘线路色由有界双层 opacity 交接，滚动热路径不再写 color 或无消费 dataset", () => {
  assert.match(homePageSource, /data-home-arrival-train-color-layer="incoming"/);
  assert.match(homePageSource, /data-home-arrival-train-color-layer="outgoing"/);
  assert.match(
    homeStylesSource,
    /\.home-arrival__train-color-layer--outgoing\s*\{[\s\S]*?opacity:\s*0/,
  );
  assert.doesNotMatch(homeRouteScriptSource, /routeColorProgress/);
  assert.doesNotMatch(homeRouteScriptSource, /const trainColor = `color-mix/);
  assert.doesNotMatch(homeRouteScriptSource, /const lineColor = `color-mix/);
  assert.doesNotMatch(homeRouteScriptSource, /homeArrivalTrainVisual\.style\.color\s*=/);
  assert.match(
    homeRouteScriptSource,
    /setStylePropertyIfChanged\(\s*homeArrivalTrainOutgoingColorLayer,\s*"opacity"/,
  );
  assert.doesNotMatch(homeRouteScriptSource, /--home-route-outgoing-color-opacity/);
});

test("移动浏览器栏变化时外层滚动舞台使用 lvh，视口内前景继续使用 svh", () => {
  assert.match(
    homeStylesSource,
    /\.home-gallery\[data-home-gallery-enhanced="true"\] \{[\s\S]*?height: calc\(100lvh \+ var\(--home-gallery-scroll-distance\)\)/,
  );
  assert.match(
    homeOnwardSource,
    /\.home-onward__journey \{[\s\S]*?height: calc\(100lvh \+ var\(--home-onward-scroll-distance\)\)/,
  );
  assert.match(homeOnwardSource, /\.home-onward__stage \{[\s\S]*?height: 100svh/);
  assert.match(
    homeCommunitySource,
    /\.home-community__main-story \{[\s\S]*?height: calc\(100lvh \+ var\(--home-community-main-scroll-distance\)\)/,
  );
  assert.match(homeCommunitySource, /\.home-community__main-stage \{[\s\S]*?height: 100svh/);
  assert.match(homeTriServerSource, /\.home-tri-server \{[\s\S]*?min-height: 300lvh/);
  assert.match(homeTriServerSource, /\.home-tri-server__stage \{[\s\S]*?height: 100svh/);
});

test("滚动不能同步绕过路线帧，连续事件只能在下一帧合并更新一次", () => {
  const frames: FrameRequestCallback[] = [];
  const updates: Array<{
    measureGeometry: boolean;
    syncJourney: boolean;
    placeTooltip: boolean;
  }> = [];
  const scheduler = createHomeRouteFrameScheduler({
    requestFrame: (callback) => {
      frames.push(callback);
      return frames.length;
    },
    update: (request) => updates.push(request),
  });

  scheduler.request({ syncJourney: true });
  scheduler.request({ placeTooltip: true });
  scheduler.request({ measureGeometry: true });

  assert.equal("flush" in scheduler, false);
  assert.equal(frames.length, 1);
  assert.deepEqual(updates, []);
  frames.shift()?.(16);
  assert.deepEqual(updates, [
    {
      measureGeometry: true,
      syncJourney: true,
      placeTooltip: true,
    },
  ]);
});

test("Safari 地址栏暂态会跨过后续纯滚动帧，直到稳定计时明确结束", () => {
  assert.equal(getHomeRouteViewportTransientState(false, "transient"), true);
  assert.equal(getHomeRouteViewportTransientState(true, "none"), true);
  assert.equal(getHomeRouteViewportTransientState(true, "none", true), false);
  assert.equal(getHomeRouteViewportTransientState(true, "effective"), false);
});

test("一帧只读取一份布局与可见视口快照，并从同一份数据派生 Tooltip 安全边界", () => {
  const snapshot = readHomeRouteViewportSnapshot({
    innerWidth: 440,
    innerHeight: 836,
    visualViewport: {
      width: 440,
      height: 796,
      offsetLeft: 0,
      offsetTop: 40,
      scale: 1,
    },
    screen: { orientation: { angle: 90 } },
  });

  assert.deepEqual(snapshot, {
    layoutWidth: 440,
    layoutHeight: 836,
    visualWidth: 440,
    visualHeight: 796,
    visualOffsetLeft: 0,
    visualOffsetTop: 40,
    visualScale: 1,
    orientationAngle: 90,
  });
  assert.deepEqual(getHomeRouteVisibleViewportBounds(snapshot), {
    left: 0,
    top: 40,
    right: 440,
    bottom: 836,
    width: 440,
    height: 796,
  });
});
