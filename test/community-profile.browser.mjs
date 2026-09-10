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

test(`${engine}: 个人故事图片从资料卡缩略图展开为原页 modal，且未投稿的个人引语不会消失`, async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto(`${baseUrl}/zh-Hans/community/`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    /* 地图随机只首屏展示四位成员；测试将已静态渲染的目标地块揭示后仍通过真实点击验证。 */
    const plot = page.locator("#player-302c6dad42bd46f996e3a4b239ab88ca");
    await plot.evaluate((element) => {
      element.hidden = false;
    });
    const trigger = plot.locator("summary");
    await trigger.click();
    const panel = page.locator("#player-302c6dad42bd46f996e3a4b239ab88ca-panel");
    await panel.waitFor({ state: "visible" });
    await expectText(panel.locator(".community-profile__motto"), "这位邻居还没有留下想说的话。");
    assert.equal(await panel.locator(".community-profile__motto-label").count(), 0);
    const tabCount = page.context().pages().length;
    const story = panel.locator("[data-community-story-open]");
    const thumbnailBox = await story.locator("img").boundingBox();
    assert.ok(thumbnailBox);
    await story.click();
    const dialog = page.locator("#community-media-dialog-players");
    await dialog.waitFor({ state: "visible" });
    const motionProxy = page.locator(".community-media-motion-proxy");
    await motionProxy.waitFor({ state: "visible", timeout: 2000 });
    await page.waitForFunction((thumbnailWidth) => {
      const proxy = document.querySelector(".community-media-motion-proxy");
      return proxy instanceof HTMLElement && proxy.getBoundingClientRect().width > thumbnailWidth;
    }, thumbnailBox.width);
    await motionProxy.waitFor({ state: "detached", timeout: 2000 });
    assert.equal(await dialog.evaluate((element) => element.open), true);
    assert.equal(await page.context().pages().length, tabCount, "图片预览不能新开浏览器标签页");
    assert.equal(
      await dialog.locator("[data-community-media-image]").getAttribute("alt"),
      "Katsuta_Minamoto建设中的北陆城市与有轨电车夜景",
    );
    const expandedImageBox = await dialog.locator("[data-community-media-image]").boundingBox();
    assert.ok(expandedImageBox);
    assert.ok(expandedImageBox.width > thumbnailBox.width);
    await page.keyboard.press("Escape");
    await motionProxy.waitFor({ state: "visible", timeout: 2000 });
    await page.waitForFunction(
      () => !document.querySelector("#community-media-dialog-players").open,
    );
    assert.equal(await panel.evaluate((element) => element.matches(":popover-open")), true);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: 手机预览按照横向投稿图片收拢，不留下整屏空画台`, async () => {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
  });
  try {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${baseUrl}/zh-Hans/community/`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const plot = page.locator("#player-302c6dad42bd46f996e3a4b239ab88ca");
    await plot.evaluate((element) => {
      element.hidden = false;
    });
    /* 目标地块因测试而临时揭示，可能位于既有浮层下方；尺寸断言不依赖其命中几何。 */
    await plot.locator("summary").click({ force: true });
    await page.locator("[data-community-story-open]").click({ force: true });
    const dialog = page.locator("#community-media-dialog-players");
    const image = dialog.locator("[data-community-media-image]");
    assert.equal(await page.locator(".community-media-motion-proxy").count(), 0);
    const [dialogBox, imageBox] = await Promise.all([dialog.boundingBox(), image.boundingBox()]);
    assert.ok(dialogBox && imageBox);
    assert.ok(dialogBox.height < 420, "横向投稿在手机上应以图片内容高度收拢");
    assert.ok(
      dialogBox.height - imageBox.height < 170,
      "图片预览只为关闭控件预留空间，不能留下整屏空画台",
    );
  } finally {
    await page.close();
  }
});

/** 断言可聚焦正文/资料控件的实际文本，避免页面压缩后的换行影响回归意图。 */
async function expectText(locator, expected) {
  assert.equal(
    (await locator.textContent()).replaceAll(/\s+/g, ""),
    expected.replaceAll(/\s+/g, ""),
  );
}
