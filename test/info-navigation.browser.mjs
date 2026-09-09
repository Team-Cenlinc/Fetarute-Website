import assert from "node:assert/strict";
import { after, test } from "node:test";

const { chromium } = await import(process.env.FETARUTE_PLAYWRIGHT_MODULE ?? "playwright");
const browser = await chromium.launch({ channel: "chrome", headless: true });
after(() => browser.close());
const baseUrl = process.env.FETARUTE_INFO_TEST_URL ?? "http://127.0.0.1:4330";

for (const width of [1440, 390]) {
  test(`Info anchors preserve clicks, scroll position and history at ${width}px`, async () => {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.goto(`${baseUrl}/zh-Hans/info/?from=test`);
      await page.waitForTimeout(300);
      for (const id of ["status", "news", "game", "other"]) {
        await page.locator(`.info-directory__link[href="#${id}"]`).click();
        await page.waitForTimeout(1200);
        assert.equal(new URL(page.url()).hash, `#${id}`);
        assert.equal(new URL(page.url()).search, "?from=test");
        assert.ok(
          await page.locator(`#${id}`).evaluate((el) => {
            const top = el.getBoundingClientRect().top;
            return top >= 0 && top < innerHeight;
          }),
        );
      }
      await page.goto(`${baseUrl}/zh-Hans/info/?from=test#status`);
      await page.waitForTimeout(1200);
      const historyLength = await page.evaluate(() => history.length);
      await page.locator("#news").evaluate((el) => el.scrollIntoView({ behavior: "instant" }));
      await page.waitForTimeout(300);
      assert.equal(new URL(page.url()).hash, "#news");
      assert.equal(await page.evaluate(() => history.length), historyLength);
      assert.equal(
        await page.locator('.info-directory__link[href="#news"]').getAttribute("aria-current"),
        "location",
      );
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(300);
      assert.equal(new URL(page.url()).hash, "");
      await page.locator('.info-directory__link[href="#game"]').click();
      await page.waitForTimeout(1200);
      await page.goBack();
      await page.waitForTimeout(1200);
      assert.equal(new URL(page.url()).hash, "");
      await page.goForward();
      await page.waitForTimeout(1200);
      assert.equal(new URL(page.url()).hash, "#game");
      for (const id of ["creative", "lobby", "survival"]) {
        await page.goto(`${baseUrl}/zh-Hans/info/#server-${id}`);
        await page.waitForTimeout(1200);
        assert.equal(new URL(page.url()).hash, `#server-${id}`);
        assert.ok(
          await page
            .locator(`#server-${id}`)
            .evaluate((el) => el.getBoundingClientRect().top >= 100),
        );
      }
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  });
}

test("interrupting an anchor jump updates the fragment to the actual reading position", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    for (const key of ["Home", "PageUp", "ArrowUp"]) {
      await page.goto(`${baseUrl}/zh-Hans/info/?from=interruption`);
      await page.waitForTimeout(400);
      await page.locator('.info-directory__link[href="#other"]').click();
      await page.waitForTimeout(80);
      await page.keyboard.press(key);
      await page.waitForTimeout(1200);
      const position = await page.evaluate(() => ({
        active: [...document.querySelectorAll(".info-section")].findLast(
          (section) => section.getBoundingClientRect().top <= innerHeight / 2,
        )?.id,
        hash: location.hash,
        query: location.search,
      }));
      assert.notEqual(position.active, "other", `${key} must interrupt the jump`);
      assert.equal(position.hash, position.active ? `#${position.active}` : "", key);
      assert.equal(position.query, "?from=interruption");
    }
  } finally {
    await page.close();
  }
});
