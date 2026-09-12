import assert from "node:assert/strict";
import { after, test } from "node:test";

const { chromium } = await import(process.env.FETARUTE_PLAYWRIGHT_MODULE ?? "playwright");
const browser = await chromium.launch({ channel: "chrome" });
after(() => browser.close());
const baseUrl = process.env.FETARUTE_HOME_TEST_URL ?? "http://127.0.0.1:4323";

for (const [width, height] of [
  [320, 568],
  [390, 844],
  [844, 390],
  [1440, 600],
  [1920, 400],
  [1920, 600],
  [2560, 720],
  [2560, 1440],
]) {
  test(`启动站牌 ${width}×${height}: 全部候选站名完整，轨道随高度定位`, async () => {
    const page = await browser.newPage({ viewport: { width, height }, javaScriptEnabled: false });
    try {
      await page.goto(`${baseUrl}/zh-Hans/`);
      await page.evaluate(() => document.documentElement.setAttribute("data-launching", ""));
      await page.evaluate(() => document.fonts.ready);
      const failures = await page.evaluate(() => {
        const failures = [];
        for (const label of document.querySelectorAll(
          ".launch-stop__primary, .launch-stop__secondary",
        )) {
          const box = label.getBoundingClientRect();
          const lineHeight = parseFloat(getComputedStyle(label).lineHeight);
          if (
            box.height + 1 < lineHeight ||
            box.top < 0 ||
            box.bottom > innerHeight ||
            label.scrollWidth > label.clientWidth + 1
          ) {
            failures.push({
              text: label.textContent.trim(),
              height: box.height,
              lineHeight,
              top: box.top,
            });
          }
        }
        return failures;
      });
      assert.deepEqual(failures, []);
      const track = await page.locator(".launch-track-state").first().boundingBox();
      assert.ok(track.y / height > 0.5 && track.y / height < 0.61, JSON.stringify(track));
    } finally {
      await page.close();
    }
  });
}

for (const skip of [false, true]) {
  test(`宽矮视窗启动动画${skip ? "点击跳过" : "完整播放"}后恢复首页`, async () => {
    const page = await browser.newPage({ viewport: { width: 1920, height: 400 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.goto(`${baseUrl}/zh-Hans/`);
      await page.locator('.launch-sequence[data-ready="true"]').waitFor({ state: "visible" });
      if (skip) await page.locator(".launch-sequence").click({ position: { x: 20, y: 20 } });
      await page.locator(".launch-sequence").waitFor({ state: "detached", timeout: 10000 });
      assert.equal(await page.locator("html").getAttribute("data-launching"), null);
      await page.waitForFunction(() => !document.querySelector("main")?.hasAttribute("inert"));
      assert.ok(await page.locator(".site-header").isVisible());
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  });
}
