import assert from "node:assert/strict";
import test from "node:test";
import {
  getHomeSectionBreakerEntryPathStartY,
  getHomeSectionBreakerScrollDistance,
  getHomeTrainColorTransitionProgress,
  getHomeTrainPathHitArea,
  getHomeVerticalTrainBottomCenterY,
} from "../src/data/home-route-train.ts";

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
