import assert from "node:assert/strict";
import test from "node:test";
import { getHomeJourneySectionHash, homeJourneySections } from "../src/data/home-journey.ts";
import { railwayLineByKey } from "../src/data/railway.ts";

test("同岸站本身把服联快线 SL07 明确换乘到湾岸支线 BS05", () => {
  const triServerJoint = homeJourneySections.find((section) => section.id === "tri-server-joint");
  const sharedShore = homeJourneySections.find((section) => section.id === "shared-shore");

  assert.ok(triServerJoint);
  assert.ok(sharedShore);
  assert.equal(triServerJoint.breakAfter, undefined);
  assert.equal(sharedShore.transferFrom?.sequence, "07");
  assert.equal(sharedShore.sequence, "05");
  assert.equal(railwayLineByKey.get(sharedShore.transferFrom?.lineKey)?.code, "SL");
  assert.equal(railwayLineByKey.get(sharedShore.lineKey)?.code, "BS");
  assert.equal(railwayLineByKey.get(sharedShore.lineKey)?.color, "#17B292");
});

test("续行站使用自然的 Onward 站名，并把湾岸支线 BS11 换乘到探索线 DS01", () => {
  const onward = homeJourneySections.find((section) => section.id === "onward");

  assert.ok(onward);
  assert.equal(onward.name.englishName, "Onward");
  assert.equal(onward.transferFrom?.sequence, "11");
  assert.equal(onward.sequence, "01");
  assert.equal(railwayLineByKey.get(onward.transferFrom?.lineKey)?.code, "BS");
  assert.equal(railwayLineByKey.get(onward.lineKey)?.code, "DS");
  assert.equal(railwayLineByKey.get(onward.lineKey)?.color, "#F6A000");
});

test("首页滚动章节沿用稳定 section id 生成 URL hash", () => {
  assert.deepEqual(
    homeJourneySections.map((section) => getHomeJourneySectionHash(section.id)),
    ["#beginning-bay", "#tri-server-joint", "#shared-shore", "#onward"],
  );
});
