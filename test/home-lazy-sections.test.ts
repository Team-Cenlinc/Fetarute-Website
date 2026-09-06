import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homePageSource = readFileSync(
  new URL("../src/components/HomePage.astro", import.meta.url),
  "utf8",
);
const lazySectionsSource = readFileSync(
  new URL("../src/lib/home/lazy-sections.ts", import.meta.url),
  "utf8",
);
const homeControllerSources = [
  "community-controller.ts",
  "gallery-controller.ts",
  "onward-controller.ts",
  "tri-server-controller.ts",
].map((fileName) => readFileSync(new URL(`../src/lib/home/${fileName}`, import.meta.url), "utf8"));
const onwardControllerSource = readFileSync(
  new URL("../src/lib/home/onward-controller.ts", import.meta.url),
  "utf8",
);
const triServerControllerSource = readFileSync(
  new URL("../src/lib/home/tri-server-controller.ts", import.meta.url),
  "utf8",
);

test("首页只用一个低于首屏观察器按章节下载控制器", () => {
  assert.match(
    homePageSource,
    /import \{ setupLazyHomeSections \} from "@\/lib\/home\/lazy-sections"/,
  );
  assert.match(homePageSource, /setupLazyHomeSections\(\);/);
  assert.equal(lazySectionsSource.match(/new IntersectionObserver/g)?.length, 1);

  for (const controller of [
    "gallery-controller",
    "tri-server-controller",
    "community-controller",
    "onward-controller",
  ]) {
    assert.match(lazySectionsSource, new RegExp(`import\\("\\./${controller}"\\)`));
  }
});

test("延迟控制器具有可撤销生命周期，且不会改写 Landing 的刷新随机语义", () => {
  for (const controllerSource of homeControllerSources) {
    assert.match(controllerSource, /new AbortController\(\)/);
    assert.match(controllerSource, /return dispose/);
    assert.doesNotMatch(controllerSource, /@ts-nocheck/);
  }

  assert.match(
    homePageSource,
    /landingSceneImages\.filter\(\(scene\) => scene\.id !== previousSceneId\)/,
  );
  assert.match(homePageSource, /window\.crypto\?\.getRandomValues/);
});

test("页面卸载会截断跨越 Clipboard 与图片 decode 的异步续写", () => {
  assert.match(
    onwardControllerSource,
    /if \(signal\.aborted\) return;\s+setCopyState\(copyState\);/,
  );
  assert.match(
    triServerControllerSource,
    /await requestSlideIndex\([\s\S]*?\);\s+\/\/ 图片 decode 可以跨越 pagehide[\s\S]*?if \(isDisposed\) return;/,
  );
});

test("失败的章节 chunk 只在离开预加载区后再次进入时重试", () => {
  assert.match(
    lazySectionsSource,
    /if \(!entry\.isIntersecting\) \{[\s\S]*?failedElements\.delete\(entry\.target\);[\s\S]*?continue;/,
  );
  assert.match(
    lazySectionsSource,
    /\.catch\(\(\) => \{[\s\S]*?failedElements\.add\(entry\.target\);/,
  );
  assert.match(
    lazySectionsSource,
    /\.then\(\(cleanup\) => \{[\s\S]*?observer\.unobserve\(entry\.target\);/,
  );
});
