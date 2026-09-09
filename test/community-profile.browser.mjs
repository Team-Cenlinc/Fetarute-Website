import assert from "node:assert/strict";
import { after, test } from "node:test";

/* 复用外置浏览器，覆盖自绘滚动条与渐隐的真实布局和输入行为。 */
const { chromium, webkit } = await import(process.env.FETARUTE_PLAYWRIGHT_MODULE ?? "playwright");
const engine = process.env.FETARUTE_TEST_BROWSER ?? "chromium";
const browser = await (engine === "webkit" ? webkit : chromium).launch({
  headless: true,
  ...(engine === "chromium" ? { channel: "chrome" } : {}),
});
after(() => browser.close());
const baseUrl = process.env.FETARUTE_COMMUNITY_TEST_URL ?? "http://127.0.0.1:4324";

for (const colorScheme of ["light", "dark"]) {
  test(`${engine}: ${colorScheme} 长简介的矩形滑块、上下渐隐与原生键盘滚动同步`, async () => {
    const page = await browser.newPage({ viewport: { width: 412, height: 820 }, colorScheme });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.goto(`${baseUrl}/zh-Hans/community/`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const trigger = page.locator("#hydcraft > summary");
      await trigger.focus();
      await trigger.press("Enter");
      const panel = page.locator("#hydcraft-panel");
      const wrap = panel.locator("[data-community-description]");
      const scroller = panel.locator(".community-profile__description");
      const scrollbar = panel.locator("[data-community-scrollbar]");
      await scrollbar.waitFor({ state: "visible" });
      assert.equal(await wrap.getAttribute("data-scroll-hint"), "bottom");
      const shape = await scrollbar.locator("span").evaluate((element) => ({
        width: getComputedStyle(element).width,
        radius: getComputedStyle(element).borderRadius,
      }));
      assert.deepEqual(shape, { width: "3px", radius: "0px" });
      for (const [progress, hint] of [
        [0, "bottom"],
        [0.5, "top bottom"],
        [1, "top"],
      ]) {
        await scroller.evaluate((element, value) => {
          element.scrollTop = value * (element.scrollHeight - element.clientHeight);
        }, progress);
        await page.waitForFunction(
          ({ id, hint }) => document.querySelector(id).dataset.scrollHint === hint,
          { id: "#hydcraft-panel [data-community-description]", hint },
        );
        const geometry = await wrap.evaluate((element) => {
          const thumb = element
            .querySelector("[data-community-scrollbar] > span")
            .getBoundingClientRect();
          const track = element.querySelector("[data-community-scrollbar]").getBoundingClientRect();
          return { top: thumb.top - track.top, travel: track.height - thumb.height };
        });
        assert.ok(Math.abs(geometry.top - progress * geometry.travel) < 1);
      }
      await scroller.focus();
      await scroller.press("Home");
      await page.waitForFunction(
        () =>
          document.querySelector("#hydcraft-panel .community-profile__description").scrollTop === 0,
      );
      const thumb = await scrollbar.locator("span").boundingBox();
      const track = await scrollbar.boundingBox();
      await page.mouse.move(thumb.x + 1, thumb.y + 2);
      await page.mouse.down();
      await page.mouse.move(thumb.x + 1, track.y + track.height + 20, { steps: 5 });
      await page.mouse.up();
      assert.equal(await wrap.getAttribute("data-scroll-hint"), "top");
      await panel.locator("[data-community-close]").click();
      assert.equal(await panel.evaluate((element) => element.matches(":popover-open")), false);
      const shortTrigger = page.locator("#player-b6d8a5ceb06b466e855f0f20abfde3fc > summary");
      await shortTrigger.focus();
      await shortTrigger.press("Enter");
      assert.equal(
        await page
          .locator("#player-b6d8a5ceb06b466e855f0f20abfde3fc-panel [data-community-scrollbar]")
          .isVisible(),
        false,
      );
      assert.equal(
        await scroller.evaluate((element) => getComputedStyle(element).maskImage),
        "none",
      );
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  });
}
