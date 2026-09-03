import assert from "node:assert/strict";
import test from "node:test";
import {
  getHomeFooterRevealProgress,
  getHomeFooterStickyReleaseScrollY,
  getHomeFooterTransitionShift,
  getHomeMobileTransferTrainState,
  getHomeOnwardContentTrainProgress,
  getHomeOnwardDepartureBoardState,
  getHomeOnwardFooterTrainProgress,
  getHomeOnwardTrainChoreography,
  getHomeSectionBreakerEntryPathStartY,
  getHomeSectionBreakerScrollDistance,
  getHomeTrainColorTransitionProgress,
  getHomeTrainPathHitArea,
  getHomeTrainTooltipPreferBlockPlacement,
  getHomeTrainTooltipPlacement,
  getHomeVerticalTrainBottomCenterY,
} from "../src/data/home-route-train.ts";

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

test("Footer 可见行程把停驻列车连续带到视口底部", () => {
  assert.equal(getHomeOnwardFooterTrainProgress(0.78, 0), 0.78);
  assert.equal(getHomeOnwardFooterTrainProgress(0.78, 0.5), 0.89);
  assert.equal(getHomeOnwardFooterTrainProgress(0.78, 1), 1);
  assert.equal(getHomeOnwardFooterTrainProgress(0.78, -1), 0.78);
  assert.equal(getHomeOnwardFooterTrainProgress(0.78, 2), 1);
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
