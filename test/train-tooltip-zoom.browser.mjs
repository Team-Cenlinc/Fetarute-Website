import assert from "node:assert/strict";
import { after, test } from "node:test";

/* 原生缩放通过 Chromium CDP 驱动；不修改站牌文案或 CSS 来代替真实 visual viewport。 */
const { chromium, webkit } = await import(process.env.FETARUTE_PLAYWRIGHT_MODULE ?? "playwright");
const engine = process.env.FETARUTE_TEST_BROWSER ?? "chromium";
const browser = await (engine === "webkit" ? webkit : chromium).launch({
  headless: true,
  ...(engine === "chromium" ? { channel: "chrome" } : {}),
});
after(() => browser.close());
const baseUrl = process.env.FETARUTE_HOME_TEST_URL ?? "http://127.0.0.1:4323";

test(
  "两页列车导览在200%缩放后可读完全部站名并操作末站",
  { skip: engine !== "chromium" },
  async () => {
    for (const community of [true, false]) {
      for (const [width, height] of [
        [390, 844],
        [568, 320],
      ]) {
        const page = await browser.newPage({
          viewport: { width, height },
          isMobile: true,
          hasTouch: true,
          reducedMotion: "reduce",
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        try {
          await page.goto(`${baseUrl}/en/${community ? "community/" : "#onward"}`, {
            waitUntil: "networkidle",
          });
          await page.evaluate(() => document.fonts.ready);
          if (!community) {
            await page.locator("[data-home-tri-server]").evaluate((section) => {
              scrollTo({
                top: section.getBoundingClientRect().top + scrollY + 200,
                behavior: "instant",
              });
            });
            await page.waitForFunction(
              () => !document.querySelector("[data-home-arrival-train]").disabled,
            );
          }
          const trigger = page.locator(
            community ? "[data-community-train]" : "[data-home-arrival-train]",
          );
          const panel = page.locator(".home-arrival__train-tooltip");
          await trigger.tap();
          const session = await page.context().newCDPSession(page);
          await session.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
          await page.waitForTimeout(250);
          const links = panel.locator("[data-home-journey-target]");
          for (const link of await links.all()) {
            await link.focus();
            const state = await link.evaluate((element) => {
              const panel = element.closest(".home-arrival__train-tooltip");
              const bounds = panel.getBoundingClientRect();
              const label = element
                .querySelector(".home-journey-quick-pick__stop-label")
                .getBoundingClientRect();
              const centerX = (label.left + label.right) / 2;
              const centerY =
                (Math.max(label.top, bounds.top + 2) + Math.min(label.bottom, bounds.bottom - 2)) /
                2;
              return {
                name: element.textContent.trim(),
                panel: bounds.toJSON(),
                label: label.toJSON(),
                viewport: {
                  left: visualViewport.offsetLeft,
                  top: visualViewport.offsetTop,
                  width: visualViewport.width,
                  height: visualViewport.height,
                },
                hit: document.elementFromPoint(centerX, centerY)?.closest("a") === element,
              };
            });
            assert.ok(
              state.label.left >= state.panel.left + 1 &&
                state.label.right <= state.panel.right - 1,
              `缩放后站名不能横向裁切: ${JSON.stringify(state)}`,
            );
            assert.ok(
              state.label.top >= state.panel.top + 1 &&
                state.label.bottom <= state.panel.bottom - 1,
              `聚焦后应能读到完整站名: ${JSON.stringify(state)}`,
            );
            assert.ok(state.hit, `缩放后仍可命中站点: ${JSON.stringify(state)}`);
            if (width === 390 && state.name === "Worlds & communities") {
              assert.ok(
                state.label.width >= state.panel.width * 0.6,
                "超窄站牌应把主要宽度留给站名，不能让线路装饰挤成两字一行",
              );
            }
          }
          await panel.locator("[data-home-journey-close]").focus();
          await page.keyboard.press("Enter");
          assert.equal(await panel.getAttribute("aria-hidden"), "true");
          await trigger.blur();
          await trigger.focus();
          await links.last().focus();
          const destination = await links.last().getAttribute("href");
          await page.keyboard.press("Enter");
          await page.waitForURL((url) => url.hash === destination);
          assert.equal(await panel.getAttribute("aria-hidden"), "true");
          assert.deepEqual(errors, []);
        } finally {
          await page.close();
        }
      }
    }
  },
);

test(`${engine}: 短屏可滚动触达末站，普通手机不出现多余的站牌滚动`, async () => {
  for (const [width, height] of [
    [568, 240],
    [390, 844],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      hasTouch: true,
      reducedMotion: "reduce",
    });
    try {
      await page.goto(`${baseUrl}/en/community/`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.locator("[data-community-train]").tap();
      const picker = page.locator("[data-home-journey-picker]");
      if (height === 844) {
        assert.ok(
          await picker.evaluate((element) => element.scrollHeight <= element.clientHeight + 1),
        );
      }
      const last = picker.locator("[data-home-journey-target]").last();
      await last.scrollIntoViewIfNeeded();
      if (height === 240) {
        assert.ok(
          await picker.evaluate((element) => element.scrollTop > 0),
          "短屏需要可达的滚动退路",
        );
      }
      await last.tap();
      await page.waitForURL((url) => url.hash === "#community-contact");
      assert.equal(await page.locator(".community-guide").getAttribute("aria-hidden"), "true");
    } finally {
      await page.close();
    }
  }
});
