import assert from "node:assert/strict";
import test from "node:test";
import { getHomeSceneryOutputWidths } from "../src/data/home-image-output.ts";

test("首页实景输出会保留小屏候选并以受控最大宽度收尾", () => {
  assert.deepEqual(getHomeSceneryOutputWidths(2560, 1600, [480, 960, 1600]), [480, 960, 1600]);
});

test("首页实景不会生成大于源图的候选，并始终保留源图宽度", () => {
  assert.deepEqual(getHomeSceneryOutputWidths(720, 1600, [480, 960, 1600]), [480, 720]);
});

test("首页实景候选会去重并按宽度排序", () => {
  assert.deepEqual(getHomeSceneryOutputWidths(1600, 1600, [1600, 480, 480, 960]), [480, 960, 1600]);
});
