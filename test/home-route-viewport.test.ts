import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyHomeRouteViewportChange,
  createHomeRouteFrameScheduler,
  getHomeRouteRenderViewportSnapshot,
  getHomeRouteVisibleViewportBounds,
  getHomeRouteViewportTransientState,
  readHomeRouteViewportSnapshot,
  type HomeRouteViewportSnapshot,
} from "../src/data/home-route-viewport.ts";

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

test("Safari 地址栏仍在运动时沿用上一份稳定 viewport，收束后才一次性交接新高度", () => {
  const stable = createViewportSnapshot({ visualHeight: 836 });
  const moving = createViewportSnapshot({ visualHeight: 796, visualOffsetTop: 40 });

  assert.equal(
    getHomeRouteRenderViewportSnapshot({
      stableSnapshot: stable,
      pendingSnapshot: moving,
      transient: true,
    }),
    stable,
  );
  assert.equal(
    getHomeRouteRenderViewportSnapshot({
      stableSnapshot: stable,
      pendingSnapshot: moving,
      transient: false,
    }),
    moving,
  );
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
