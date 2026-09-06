import assert from "node:assert/strict";
import { after, test } from "node:test";

/* 复用本机 Playwright；这项 DOM 几何回归不进入静态检查，也不为官网增加浏览器运行时依赖。 */
const { chromium, webkit } = await import(process.env.FETARUTE_PLAYWRIGHT_MODULE ?? "playwright");
const engine = process.env.FETARUTE_TEST_BROWSER ?? "chromium";
assert.ok(["chromium", "webkit"].includes(engine), "浏览器必须为 chromium 或 webkit");
const browser = await (engine === "webkit" ? webkit : chromium).launch({
  headless: true,
  ...(engine === "chromium" ? { channel: "chrome" } : {}),
});
after(() => browser.close());
const baseUrl = process.env.FETARUTE_HOME_TEST_URL ?? "http://127.0.0.1:4323";

/* 包含手机、触发 88px 车长上限的宽屏、1024px 两侧及减少动态；三语共用真实页面布局。 */
const scenarios = [
  [390, 844, "zh-Hans", "no-preference"],
  [600, 900, "zh-Hans", "no-preference"],
  [820, 1180, "en", "no-preference"],
  [1023, 900, "zh-Hant", "no-preference"],
  [1024, 900, "zh-Hans", "no-preference"],
  [1440, 900, "en", "no-preference"],
  [600, 900, "zh-Hans", "reduce"],
];

for (const [width, height, locale, reducedMotion] of scenarios) {
  test(`${engine} ${width}×${height} ${locale} ${reducedMotion}: 车身、命中区与轨道同轴`, async () => {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion });
    try {
      /* 等深链初始定位与资源加载完成，避免冷启动时的 hash 恢复覆盖测试主动发出的滚动。 */
      await page.goto(`${baseUrl}/${locale}/#onward`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);

      /** 等到真实滚动路段提交后测量，避免把上一帧的列车状态误认为当前位置。 */
      const checkTrack = async (section, track, segment, delta = 200) => {
        await page.locator(section).evaluate((element, offset) => {
          scrollTo({
            top: element.getBoundingClientRect().top + scrollY + offset,
            behavior: "instant",
          });
        }, delta);
        await page.waitForFunction(
          (expected) =>
            document.querySelector("[data-home-arrival-train]")?.dataset.routeSegment === expected,
          segment,
        );
        const geometry = await page.evaluate(async (trackSelector) => {
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
          const visual = document.querySelector("[data-home-arrival-train-visual]");
          const hit = document.querySelector("[data-home-arrival-train]");
          const rail = document.querySelector(trackSelector).getBoundingClientRect();
          const body = visual.getBoundingClientRect();
          const target = hit.getBoundingClientRect();
          return {
            bodyCenter: body.x + body.width / 2,
            trackCenter: rail.x + rail.width / 2,
            hitCenter: target.x + target.width / 2,
            bodyLength: body.height,
            hitLength: target.height,
            visible: visual.dataset.routeVisible,
          };
        }, track);
        assert.equal(geometry.visible, "true");
        assert.ok(
          Math.abs(geometry.bodyCenter - geometry.trackCenter) < 1,
          `${segment}: ${JSON.stringify(geometry)}`,
        );
        assert.ok(
          Math.abs(geometry.bodyCenter - geometry.hitCenter) < 1,
          `${segment}: 车身偏离命中区`,
        );
        assert.ok(
          Math.abs(geometry.bodyLength - geometry.hitLength) < 1,
          `${segment}: 车身与命中区长度不同`,
        );
      };

      await checkTrack(
        "[data-home-onward-content]",
        "[data-home-onward-route-track]",
        "onward-content-track",
      );
      /* 减少动态时，低矮页尾尚未跨过视口阅读线，列车仍可归属于同轴的续行正文。 */
      await checkTrack(
        "[data-home-footer]",
        ".home-footer__track",
        reducedMotion === "reduce" ? "onward-content-track" : "footer",
      );
      await checkTrack(
        "[data-home-onward-content]",
        "[data-home-onward-route-track]",
        "onward-content-track",
        400,
      );
      await checkTrack(
        "[data-home-tri-server]",
        "[data-home-tri-server-track]",
        reducedMotion === "reduce" ? "static" : "tri-server",
      );
    } finally {
      await page.close();
    }
  });
}
