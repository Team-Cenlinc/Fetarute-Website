import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/data/home-landing.ts", import.meta.url), "utf8");
const sceneListSource = source.slice(source.indexOf("export const homeLandingScenes"));

test("每张首页 Landing 图片都有合法且静态的标题反光 CSS 色值", () => {
  const sceneEntries = [
    ...sceneListSource.matchAll(/\{\s+id: "[^"]+",\s+image: [^,]+,(.*?)\n  \},/gs),
  ];
  const registeredImages = [...sceneListSource.matchAll(/^\s+image: [^,]+,$/gm)];
  const cssColor =
    /^hsl\((?:360(?:\.0+)?|3[0-5]\d(?:\.\d+)?|[12]?\d?\d(?:\.\d+)?)deg (?:100(?:\.0+)?|\d{1,2}(?:\.\d+)?)% (?:100(?:\.0+)?|\d{1,2}(?:\.\d+)?)%\)$/;

  assert.ok(sceneEntries.length > 0, "场景清单不能为空");
  assert.equal(sceneEntries.length, registeredImages.length, "每张登记图片都必须属于一个完整场景");

  for (const [, fields] of sceneEntries) {
    const reflectionColor = fields.match(/reflectionColor: "([^"]+)"/)?.[1];
    assert.ok(reflectionColor, "每个场景都必须登记 reflectionColor");
    assert.match(reflectionColor, cssColor, `${reflectionColor} 必须是合法的 CSS HSL 色值`);
  }
});
