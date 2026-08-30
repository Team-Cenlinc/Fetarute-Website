import assert from "node:assert/strict";
import test from "node:test";
import {
  getHomeSectionBreakerEntryPathStartY,
  getHomeSectionBreakerScrollDistance,
  getHomeTrainColorTransitionProgress,
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

test("Section Breaker 把剩余路径压缩到可读的原生滚动行程", () => {
  assert.ok(
    Math.abs(
      getHomeSectionBreakerScrollDistance({
        remainingPathDistance: 1684,
        viewportHeight: 900,
      }) - 990,
    ) < 0.01,
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
