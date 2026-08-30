import assert from "node:assert/strict";
import test from "node:test";
import { homeJourneySections } from "../src/data/home-journey.ts";
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
