import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  getHomeFooterRouteState,
  getHomeFooterRevealProgress,
  getHomeFooterStickyReleaseScrollY,
  getHomeFooterTransitionShift,
  isHomeMobileOnwardIncomingPhase,
  getHomeMobileTransferTrainState,
  getHomeMobileTransferTrainViewportCenterY,
  getHomeOnwardContentTrainProgress,
  getHomeOnwardDepartureBoardState,
  getHomeOnwardFooterTrainProgress,
  getHomeOnwardTrainChoreography,
  getHomeReducedMotionOnwardTrainOwner,
  getHomeSectionBreakerEntryPathStartY,
  getHomeSectionBreakerScrollDistance,
  getHomeTrainColorTransitionProgress,
  getHomeTrainPathGeometry,
  getHomeTrainPathCurveGeometry,
  getHomeTrainPathHitArea,
  getHomeTrainPathPointAtLength,
  getHomeTrainPathPoseAtLength,
  getHomeTrainPathTranslatedGeometry,
  getHomeTrainTooltipPreferBlockPlacement,
  getHomeTrainTooltipPlacement,
  getHomeTransferTrainVisibility,
  getHomeVerticalTrainBottomCenterY,
  getHomeVerticalTrainRenderGeometry,
} from "../src/data/home-route-train.ts";

const homePageSource = readFileSync(
  new URL("../src/components/HomePage.astro", import.meta.url),
  "utf8",
);
const homeStylesSource = readFileSync(new URL("../src/styles/home.css", import.meta.url), "utf8");

test("路线几何在纯数值层解析直线与 Bézier，不调用浏览器 SVG 测量 API", () => {
  const geometry = getHomeTrainPathGeometry("M0 0 L100 0 C100 0 100 100 100 100 L100 200");

  assert.equal(geometry.totalLength, 300);
  assert.deepEqual(geometry.segmentEndDistances, [100, 200, 300]);
  assert.deepEqual(getHomeTrainPathPointAtLength(geometry, 50), { x: 50, y: 0 });
  assert.deepEqual(getHomeTrainPathPointAtLength(geometry, 150), { x: 100, y: 50 });
  assert.deepEqual(getHomeTrainPathPointAtLength(geometry, -1), { x: 0, y: 0 });
  assert.deepEqual(getHomeTrainPathPointAtLength(geometry, 999), { x: 100, y: 200 });

  const quadraticGeometry = getHomeTrainPathGeometry("M0 0 Q50 100 100 0");
  const quadraticMidpoint = getHomeTrainPathPointAtLength(
    quadraticGeometry,
    quadraticGeometry.totalLength / 2,
  );
  assert.ok(Math.abs(quadraticMidpoint.x - 50) < 0.001);
  assert.ok(Math.abs(quadraticMidpoint.y - 50) < 0.001);
});

test("有界刚性列车从数值路径取得中心与切线，不依赖浏览器绘制层", () => {
  const horizontal = getHomeTrainPathGeometry("M0 20 L100 20");
  const vertical = getHomeTrainPathGeometry("M40 0 L40 100");

  assert.deepEqual(getHomeTrainPathPoseAtLength(horizontal, 50, 8), {
    center: { x: 50, y: 20 },
    angleDegrees: 0,
  });
  assert.deepEqual(getHomeTrainPathPoseAtLength(vertical, 50, 8), {
    center: { x: 40, y: 50 },
    angleDegrees: 90,
  });
});

test("弯道车身保留沿程形状，局部绘制边界只随车长与厚度变化", () => {
  const route = getHomeTrainPathGeometry("M180 20 L100 20 C40 20 20 50 20 120 L20 200");
  const points = Array.from({ length: 25 }, (_, index) =>
    getHomeTrainPathPointAtLength(route, 70 + index * 4),
  );
  const center = getHomeTrainPathPointAtLength(route, 118);
  const curve = getHomeTrainPathCurveGeometry(points, center, 96, 40);
  assert.ok(curve);
  assert.equal(curve.size, 138);
  // 平移视口不能改变局部曲线，滚动时只需移动小画布。
  assert.deepEqual(
    getHomeTrainPathCurveGeometry(
      points.map(({ x, y }) => ({ x: x + 180, y: y - 700 })),
      { x: center.x + 180, y: center.y - 700 },
      96,
      40,
    ),
    curve,
  );
  const coordinates = curve.pathData.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  assert.equal(coordinates.length, points.length * 2);
  assert.ok(coordinates.every((value) => value >= 20 && value <= curve.size - 20));
  assert.ok(new Set(points.map((point) => Math.round(point.x))).size > 5);
  assert.ok(new Set(points.map((point) => Math.round(point.y))).size > 5);
});

test("直轨与退化路径不启用曲线绘制，横竖车身继续走 transform", () => {
  for (const path of ["M0 20 L200 20", "M40 0 L40 200", "M180 20 L0 20"]) {
    const geometry = getHomeTrainPathGeometry(path);
    const points = Array.from({ length: 19 }, (_, index) =>
      getHomeTrainPathPointAtLength(geometry, 20 + index * 4),
    );
    assert.equal(
      getHomeTrainPathCurveGeometry(points, getHomeTrainPathPointAtLength(geometry, 56), 72, 40),
      null,
    );
  }
  assert.equal(getHomeTrainPathCurveGeometry([], { x: 0, y: 0 }, 72, 40), null);
});

test("路径平移只移动缓存采样点，不重复解析或改变累计里程", () => {
  const source = getHomeTrainPathGeometry("M0 0 L100 0 Q150 50 100 100");
  const translated = getHomeTrainPathTranslatedGeometry(source, 40, -20);

  assert.notEqual(translated, source);
  assert.equal(translated.totalLength, source.totalLength);
  assert.equal(translated.segmentEndDistances, source.segmentEndDistances);
  assert.deepEqual(translated.points[0], { x: 40, y: -20, distance: 0 });
  assert.deepEqual(translated.points.at(-1), {
    x: 140,
    y: 80,
    distance: source.totalLength,
  });
  assert.deepEqual(source.points[0], { x: 0, y: 0, distance: 0 });
});

test("首页路线列车使用有界视觉层，滚动热路径不再改写全屏 SVG", () => {
  const trainVisualRule = homeStylesSource.match(
    /\.home-arrival__train-visual\s*\{(?<body>[\s\S]*?)\n\}/,
  )?.groups?.body;

  assert.ok(trainVisualRule);
  assert.match(homePageSource, /<button[\s\S]*?data-home-arrival-train/);
  assert.doesNotMatch(homePageSource, /<svg[^>]*data-home-arrival-train-visual/);
  assert.doesNotMatch(homePageSource, /\.get(?:TotalLength|PointAtLength)\(/);
  assert.doesNotMatch(homePageSource, /stroke-dash(?:array|offset)/);
  assert.doesNotMatch(
    homePageSource,
    /homeArrivalTrainVisualPath\.setAttribute\(\s*"(?:d|pathLength|stroke-width)"/,
  );
  assert.doesNotMatch(trainVisualRule, /inset:\s*0/);
  assert.doesNotMatch(trainVisualRule, /(?:width:\s*100vw|height:\s*100s?vh)/);
  assert.match(trainVisualRule, /width:\s*var\(--home-arrival-train-width\)/);
  assert.match(trainVisualRule, /height:\s*var\(--home-arrival-train-height\)/);
  assert.match(homePageSource, /homeArrivalTrainVisual\.style\.transform\s*=/);
  assert.match(homePageSource, /homeArrivalTrainVisual\.style\.opacity\s*=/);
  assert.match(homePageSource, /getHomeTrainPathPointAtLength\(/);
});

test("Footer 交接按 sticky 舞台实高解锁，消融为视口高度会在短桌面晚 80px", () => {
  const shortDesktopRelease = getHomeFooterStickyReleaseScrollY({
    journeyTop: 1000,
    journeyHeight: 1620,
    stageHeight: 680,
  });
  const viewportHeightAblation = getHomeFooterStickyReleaseScrollY({
    journeyTop: 1000,
    journeyHeight: 1620,
    stageHeight: 600,
  });

  assert.equal(shortDesktopRelease, 1940);
  assert.equal(viewportHeightAblation - shortDesktopRelease, 80);
  assert.equal(
    getHomeFooterStickyReleaseScrollY({
      journeyTop: 1000,
      journeyHeight: 2250,
      stageHeight: 900,
    }),
    2350,
  );
});

test("Footer 交接使用首尾平缓的连续进度，而不是把原生滚动硬切成离散状态", () => {
  assert.equal(getHomeFooterRevealProgress(0), 0);
  assert.equal(getHomeFooterRevealProgress(0.25), 0.15625);
  assert.equal(getHomeFooterRevealProgress(0.5), 0.5);
  assert.equal(getHomeFooterRevealProgress(0.75), 0.84375);
  assert.equal(getHomeFooterRevealProgress(1), 1);
  assert.equal(getHomeFooterRevealProgress(-1), 0);
  assert.equal(getHomeFooterRevealProgress(2), 1);
  assert.equal(getHomeFooterRevealProgress(Number.NaN), 0);
});

test("Footer 交接先下沉末屏物件，再逐像素抵消 sticky 解锁并继续轻推向下", () => {
  assert.equal(getHomeFooterTransitionShift(0, 0, 232), 0);
  assert.equal(getHomeFooterTransitionShift(1, 0, 232), 96);
  assert.equal(getHomeFooterTransitionShift(1, 0.5, 232), 228);
  assert.equal(getHomeFooterTransitionShift(1, 1, 232), 360);
  assert.equal(getHomeFooterTransitionShift(1, 1, 232, 64, 20) - 232, 84);
  assert.equal(getHomeFooterTransitionShift(1, 1, 232, 96, 32) - 232, 128);
  assert.equal(getHomeFooterTransitionShift(-1, -1, -1), 0);
  assert.equal(getHomeFooterTransitionShift(Number.NaN, Number.NaN, Number.NaN), 0);
});

test("续行列车进入 PIDS 后保持停驻，把离站行程交给 Footer", () => {
  const options = {
    contentTop: 1000,
    boardJourneyTop: 1800,
  };

  assert.equal(getHomeOnwardContentTrainProgress({ ...options, scrollY: 1000 }), 0);
  assert.equal(getHomeOnwardContentTrainProgress({ ...options, scrollY: 1400 }), 0.39);
  assert.equal(getHomeOnwardContentTrainProgress({ ...options, scrollY: 1800 }), 0.78);
  assert.equal(getHomeOnwardContentTrainProgress({ ...options, scrollY: 2500 }), 0.78);
  assert.equal(getHomeOnwardContentTrainProgress({ ...options, scrollY: 3100 }), 0.78);
  assert.equal(getHomeOnwardContentTrainProgress({ ...options, scrollY: 3500 }), 0.78);
});

test("桌面 Footer 可见行程把停驻列车连续带到视口底部", () => {
  assert.equal(getHomeOnwardFooterTrainProgress(0.78, 0), 0.78);
  assert.equal(getHomeOnwardFooterTrainProgress(0.78, 0.5), 0.89);
  assert.equal(getHomeOnwardFooterTrainProgress(0.78, 1), 1);
  assert.equal(getHomeOnwardFooterTrainProgress(0.78, -1), 0.78);
  assert.equal(getHomeOnwardFooterTrainProgress(0.78, 2), 1);
});

test("小屏到达 Footer 后让单车停在终点，不再随页面末段继续下移", () => {
  assert.equal(getHomeOnwardFooterTrainProgress(0.78, 0, true), 0.78);
  assert.equal(getHomeOnwardFooterTrainProgress(0.78, 0.5, true), 0.78);
  assert.equal(getHomeOnwardFooterTrainProgress(0.78, 1, true), 0.78);
});

test("移动 Safari 在 Footer 底部弹性越界时仍由终点列车持有路线", () => {
  assert.deepEqual(
    getHomeFooterRouteState({
      scrollY: 1000,
      onwardContentJourneyEnd: 1000,
      footerJourneyEnd: 1200,
    }),
    { active: false, progress: 0 },
  );
  assert.deepEqual(
    getHomeFooterRouteState({
      scrollY: 1100,
      onwardContentJourneyEnd: 1000,
      footerJourneyEnd: 1200,
    }),
    { active: true, progress: 0.5 },
  );
  assert.deepEqual(
    getHomeFooterRouteState({
      scrollY: 1280,
      onwardContentJourneyEnd: 1000,
      footerJourneyEnd: 1200,
    }),
    { active: true, progress: 1 },
  );
});

test("独立续行内容页先展示目的地 PIDS，再交给首次到访帮助", () => {
  assert.equal(getHomeOnwardDepartureBoardState(0), "destinations");
  assert.equal(getHomeOnwardDepartureBoardState(0.61), "destinations");
  assert.equal(getHomeOnwardDepartureBoardState(0.62), "help");
  assert.equal(getHomeOnwardDepartureBoardState(1), "help");
});

test("减少动态时仍保留 PIDS 两页的可达性，只停用空间位移", () => {
  assert.equal(getHomeOnwardDepartureBoardState(0), "destinations");
  assert.equal(getHomeOnwardDepartureBoardState(1), "help");
});

test("续行先让湾岸列车减速进站，短暂停顿后再让探索列车加速离站", () => {
  assert.deepEqual(getHomeOnwardTrainChoreography(0), {
    phase: "arriving",
    incomingProgress: 0,
    handoffProgress: 0,
    outgoingProgress: 0,
  });
  assert.deepEqual(getHomeOnwardTrainChoreography(0.19), {
    phase: "arriving",
    incomingProgress: 0.75,
    handoffProgress: 0,
    outgoingProgress: 0,
  });
  assert.deepEqual(getHomeOnwardTrainChoreography(0.45), {
    phase: "transfer",
    incomingProgress: 1,
    handoffProgress: 0.5,
    outgoingProgress: 0,
  });
  assert.deepEqual(getHomeOnwardTrainChoreography(0.76), {
    phase: "departing",
    incomingProgress: 1,
    handoffProgress: 1,
    outgoingProgress: 0.25,
  });
  assert.deepEqual(getHomeOnwardTrainChoreography(1), {
    phase: "departing",
    incomingProgress: 1,
    handoffProgress: 1,
    outgoingProgress: 1,
  });
});

test("续行双车编排会收束超出滚动范围的输入", () => {
  assert.deepEqual(getHomeOnwardTrainChoreography(-1), getHomeOnwardTrainChoreography(0));
  assert.deepEqual(getHomeOnwardTrainChoreography(2), getHomeOnwardTrainChoreography(1));
});

test("同岸保持 HEAD 的侧边 Tooltip，续行横车才优先上下贴附", () => {
  assert.equal(
    getHomeTrainTooltipPreferBlockPlacement({
      usesPathAnchor: false,
      routeSegment: "transfer-incoming-platform",
      transferComposition: "compact",
      anchorWidth: 200,
      anchorHeight: 100,
    }),
    false,
  );
  assert.equal(
    getHomeTrainTooltipPreferBlockPlacement({
      usesPathAnchor: false,
      routeSegment: "transfer-outgoing-platform",
      transferComposition: "open",
      anchorWidth: 200,
      anchorHeight: 100,
    }),
    true,
  );
  assert.equal(
    getHomeTrainTooltipPreferBlockPlacement({
      usesPathAnchor: true,
      routeSegment: "onward-outgoing-curve",
      anchorWidth: 44,
      anchorHeight: 44,
    }),
    true,
  );
});

test("小屏续行只用一辆车穿过分界，并在可见区内完成换色", () => {
  const viewportHeight = 844;

  assert.deepEqual(
    getHomeMobileTransferTrainState({
      sectionTop: viewportHeight * 0.4,
      viewportHeight,
    }),
    {
      routeProgress: 0,
      topSectionRatio: 0.3,
      colorProgress: 0,
    },
  );
  const boundaryState = getHomeMobileTransferTrainState({
    sectionTop: viewportHeight * 0.2,
    viewportHeight,
  });

  assert.equal(boundaryState.routeProgress, 0.5);
  assert.ok(Math.abs(boundaryState.topSectionRatio - 0.46) < 0.00001);
  assert.ok(Math.abs(boundaryState.colorProgress - 0.5) < 0.00001);
  assert.deepEqual(
    getHomeMobileTransferTrainState({
      sectionTop: 0,
      viewportHeight,
    }),
    {
      routeProgress: 1,
      topSectionRatio: 0.62,
      colorProgress: 1,
    },
  );
});

test("小屏续行的局部车在交接帧抵达全局正文列车的同一可见中心", () => {
  const options = {
    sectionTop: 0,
    stageHeight: 796,
    trainBlockSize: 83,
    handoffCenterY: 732,
  };

  assert.ok(
    Math.abs(getHomeMobileTransferTrainViewportCenterY({ ...options, routeProgress: 0 }) - 280.3) <
      0.00001,
  );
  assert.equal(getHomeMobileTransferTrainViewportCenterY({ ...options, routeProgress: 1 }), 732);
});

test("小屏续行进入正文后即使反向衰减，也不会把探索线列车回判为湾岸来车", () => {
  const sharedOptions = {
    communityJourneyEnd: 12_292,
    contentRevealStart: 13_115,
    localTrainCenterY: 736.5001,
    handoffCenterY: 736.5,
  };

  assert.equal(
    isHomeMobileOnwardIncomingPhase({
      ...sharedOptions,
      scrollY: 13_279,
      localTrainColorProgress: 1,
    }),
    false,
  );
  assert.equal(
    isHomeMobileOnwardIncomingPhase({
      ...sharedOptions,
      scrollY: 13_100,
      localTrainCenterY: 737.1,
      localTrainColorProgress: 1,
    }),
    false,
  );
  assert.equal(
    isHomeMobileOnwardIncomingPhase({
      ...sharedOptions,
      scrollY: 12_700,
      localTrainCenterY: 760,
      localTrainColorProgress: 0,
    }),
    true,
  );
});

test("小屏续行的局部车只在本地拥有视觉时出现，全局接管任一线路都不会留下第二辆车", () => {
  assert.deepEqual(
    getHomeTransferTrainVisibility({ owner: "local", singleTrainComposition: true }),
    { incomingVisible: true, outgoingVisible: false },
  );
  assert.deepEqual(
    getHomeTransferTrainVisibility({
      owner: "global-incoming",
      singleTrainComposition: true,
    }),
    { incomingVisible: false, outgoingVisible: false },
  );
  assert.deepEqual(
    getHomeTransferTrainVisibility({
      owner: "global-outgoing",
      singleTrainComposition: true,
    }),
    { incomingVisible: false, outgoingVisible: false },
  );
});

test("减少动态的续行只在局部车确实可见时交给它，离场后立即交给全局探索线列车", () => {
  assert.equal(
    getHomeReducedMotionOnwardTrainOwner({
      routeContainsReadingLine: false,
      contentContainsReadingLine: false,
      footerContainsReadingLine: false,
      localTrainWithinViewport: true,
    }),
    "global-incoming",
  );
  assert.equal(
    getHomeReducedMotionOnwardTrainOwner({
      routeContainsReadingLine: true,
      contentContainsReadingLine: false,
      footerContainsReadingLine: false,
      localTrainWithinViewport: true,
    }),
    "local",
  );
  assert.equal(
    getHomeReducedMotionOnwardTrainOwner({
      routeContainsReadingLine: true,
      contentContainsReadingLine: false,
      footerContainsReadingLine: false,
      localTrainWithinViewport: false,
    }),
    "global-outgoing",
  );
  assert.equal(
    getHomeReducedMotionOnwardTrainOwner({
      routeContainsReadingLine: false,
      contentContainsReadingLine: true,
      footerContainsReadingLine: false,
      localTrainWithinViewport: false,
    }),
    "global-outgoing",
  );
});

test("减少动态时小屏续行列车固定在分界处，只切换线路语义色", () => {
  const incomingState = getHomeMobileTransferTrainState({
    sectionTop: 500,
    viewportHeight: 844,
    prefersReducedMotion: true,
  });

  assert.equal(incomingState.routeProgress, 0);
  assert.equal(incomingState.topSectionRatio, 0.46);
  assert.equal(incomingState.colorProgress, 0);
  assert.deepEqual(
    getHomeMobileTransferTrainState({
      sectionTop: 0,
      viewportHeight: 844,
      prefersReducedMotion: true,
    }),
    {
      routeProgress: 1,
      topSectionRatio: 0.46,
      colorProgress: 1,
    },
  );
});

test("首弯入口从弯道上方顺向接入，弯曲车体不会在折返点自我覆盖", () => {
  assert.equal(
    getHomeSectionBreakerEntryPathStartY({
      galleryTrainTailY: 509,
      curveStartY: 469,
      trainLength: 150,
    }),
    319,
  );
});

test("Gallery 已在首弯上方时保留原始交接点，不额外拉长入口", () => {
  assert.equal(
    getHomeSectionBreakerEntryPathStartY({
      galleryTrainTailY: 100,
      curveStartY: 469,
      trainLength: 150,
    }),
    100,
  );
});

test("Section Breaker 把剩余路径换算成接近一比一的原生滚动行程", () => {
  assert.ok(
    Math.abs(
      getHomeSectionBreakerScrollDistance({
        remainingPathDistance: 1684,
        viewportHeight: 900,
      }) - 1485,
    ) < 0.01,
  );
  assert.equal(
    getHomeSectionBreakerScrollDistance({
      remainingPathDistance: 500,
      viewportHeight: 900,
    }),
    460,
  );
  assert.equal(
    getHomeSectionBreakerScrollDistance({
      remainingPathDistance: 1000,
      viewportHeight: 900,
      pathToScrollRatio: 0.78,
      maximumViewportRatio: 1.35,
    }),
    780,
  );
  assert.equal(
    getHomeSectionBreakerScrollDistance({
      remainingPathDistance: 0,
      viewportHeight: 900,
    }),
    0,
  );
});

test("换乘列车只在线路渐变区内从进入线路平滑偏色到离开线路", () => {
  const options = { transitionStart: 0.32, transitionEnd: 0.72 };

  assert.equal(getHomeTrainColorTransitionProgress({ ...options, routeProgress: 0.2 }), 0);
  assert.ok(
    Math.abs(getHomeTrainColorTransitionProgress({ ...options, routeProgress: 0.52 }) - 0.5) <
      0.001,
  );
  assert.equal(getHomeTrainColorTransitionProgress({ ...options, routeProgress: 0.9 }), 1);
});

test("列车点击区会覆盖直轨与弯轨上的完整车身", () => {
  assert.deepEqual(
    getHomeTrainPathHitArea({
      points: [
        { x: 0, y: 0 },
        { x: 150, y: 0 },
      ],
      trainThickness: 84,
    }),
    { left: 0, top: -42, width: 150, height: 84 },
  );

  const curvedHitArea = getHomeTrainPathHitArea({
    points: [
      { x: 100, y: 80 },
      { x: 100, y: 120 },
      { x: 112, y: 150 },
      { x: 140, y: 166 },
    ],
    trainThickness: 40,
  });
  assert.ok(curvedHitArea.left <= 80);
  assert.ok(curvedHitArea.top <= 80);
  assert.ok(curvedHitArea.left + curvedHitArea.width >= 149);
  assert.ok(curvedHitArea.top + curvedHitArea.height >= 183);
});

test("移动端直轨列车直接由数值几何生成车身与命中区，不依赖 SVG 路径采样", () => {
  assert.deepEqual(
    getHomeVerticalTrainRenderGeometry({
      trackX: 32,
      routeStartY: -80,
      routeEndY: 880,
      trainCenterY: 400,
      trainLength: 80,
      trainThickness: 24,
    }),
    {
      journeyLength: 960,
      trainTailDistance: 440,
      trainHeadDistance: 520,
      hitArea: { left: 10, top: 360, width: 44, height: 80 },
      trainMidpoint: { x: 32, y: 400 },
    },
  );

  assert.equal(
    getHomeVerticalTrainRenderGeometry({
      trackX: 32,
      routeStartY: 0,
      routeEndY: 100,
      trainCenterY: 200,
      trainLength: 40,
      trainThickness: 20,
    }).trainTailDistance,
    60,
  );
});

test("竖轨底部锚点按车长留出完整可点击空间", () => {
  assert.equal(
    getHomeVerticalTrainBottomCenterY({
      viewportBottom: 900,
      trainLength: 150,
      edgeGap: 20,
    }),
    805,
  );
  assert.equal(
    getHomeVerticalTrainBottomCenterY({
      viewportBottom: 732,
      trainLength: 100,
      edgeGap: 16,
    }),
    666,
  );
});

test("横轨列车的 Tooltip 优先停在车体上方并保持在视口安全区内", () => {
  assert.deepEqual(
    getHomeTrainTooltipPlacement({
      anchorBounds: {
        left: 480,
        top: 694,
        right: 680,
        bottom: 794,
        width: 200,
        height: 100,
      },
      tooltipSize: { width: 320, height: 416 },
      viewportBounds: {
        left: 0,
        top: 0,
        right: 1920,
        bottom: 1080,
        width: 1920,
        height: 1080,
      },
      preferredSafeTop: 88,
      preferBlockPlacement: true,
    }),
    { left: 420, top: 262, placement: "above" },
  );
});

test("窄屏竖轨列车在侧边空间不足时选择完整可见的上下停靠位", () => {
  const viewportBounds = {
    left: 0,
    top: 0,
    right: 390,
    bottom: 844,
    width: 390,
    height: 844,
  };
  const tooltipSize = { width: 320, height: 416 };

  assert.deepEqual(
    getHomeTrainTooltipPlacement({
      anchorBounds: {
        left: 5,
        top: 253,
        right: 49,
        bottom: 341,
        width: 44,
        height: 88,
      },
      tooltipSize,
      viewportBounds,
      preferredSafeTop: 80,
      preferBlockPlacement: false,
    }),
    { left: 20, top: 357, placement: "below" },
  );
  assert.deepEqual(
    getHomeTrainTooltipPlacement({
      anchorBounds: {
        left: 5,
        top: 523,
        right: 49,
        bottom: 611,
        width: 44,
        height: 88,
      },
      tooltipSize,
      viewportBounds,
      preferredSafeTop: 80,
      preferBlockPlacement: false,
    }),
    { left: 20, top: 91, placement: "above" },
  );
});
