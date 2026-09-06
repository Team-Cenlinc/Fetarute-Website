import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";
import { getTitleReflectionColor } from "../scripts/generate-home-landing-reflection-colors.ts";
import { homeLandingSceneDefinitions } from "../src/data/home-landing-scenes.ts";

const assetDirectory = fileURLToPath(new URL("../src/assets/pages/home/landing/", import.meta.url));
const cssColor =
  /^hsl\((?:360(?:\.0+)?|3[0-5]\d(?:\.\d+)?|[12]?\d?\d(?:\.\d+)?)deg (?:100(?:\.0+)?|\d{1,2}(?:\.\d+)?)% (?:100(?:\.0+)?|\d{1,2}(?:\.\d+)?)%\)$/;

test("每张首页 Landing 图片都有合法且与生成器一致的标题反光 CSS 色值", async () => {
  assert.ok(homeLandingSceneDefinitions.length > 0, "场景清单不能为空");

  for (const scene of homeLandingSceneDefinitions) {
    assert.match(
      scene.reflectionColor,
      cssColor,
      `${scene.id} 的 ${scene.reflectionColor} 必须是合法的 CSS HSL 色值`,
    );
    const generatedColor = await getTitleReflectionColor(
      path.join(assetDirectory, scene.assetFilename),
      scene.focalPoint,
    );
    assert.equal(
      generatedColor,
      scene.reflectionColor,
      `${scene.id} 的登记反光色必须由当前算法生成`,
    );
  }
});
