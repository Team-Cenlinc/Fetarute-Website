import assert from "node:assert/strict";
import { after, test } from "node:test";

const { chromium, webkit } = await import(process.env.FETARUTE_PLAYWRIGHT_MODULE ?? "playwright");
const engine = process.env.FETARUTE_TEST_BROWSER ?? "chromium";
const browser = await (engine === "webkit" ? webkit : chromium).launch({
  headless: true,
  ...(engine === "chromium" ? { channel: "chrome" } : {}),
});
after(() => browser.close());
const baseUrl = process.env.FETARUTE_HOME_TEST_URL ?? "http://127.0.0.1:4323";
// Desktop zoom changes the CSS viewport; reserve 80 screen pixels for browser chrome.
const zoomViewports = [
  [1920, 1080],
  [2560, 1440],
  [3840, 2160],
].flatMap(([screenWidth, screenHeight]) =>
  [0.8, 1, 1.25, 1.5, 1.75, 2].map((zoom) => [
    Math.round(screenWidth / zoom),
    Math.round((screenHeight - 80) / zoom),
  ]),
);

test("三语页面、站牌与菜单使用当前语言的品牌字体栈", async () => {
  const page = await browser.newPage({ javaScriptEnabled: false });
  try {
    for (const locale of ["zh-Hans", "zh-Hant", "en"]) {
      for (const route of ["", "community/", "info/", "guides/join/", "news/site-foundation/"]) {
        await page.goto(`${baseUrl}/${locale}/${route}`);
        await page.evaluate(() => document.fonts.ready);
        for (const [language, family] of [
          ["zh-Hans", "Fetarute Sans SC"],
          ["zh-Hant", "Fetarute Sans TC"],
        ]) {
          const fonts = await page
            .locator(`.language-link[lang="${language}"]`)
            .evaluateAll((elements) =>
              elements.map((element) => getComputedStyle(element).fontFamily),
            );
          assert.ok(fonts.length > 0);
          for (const font of fonts)
            assert.ok(
              font.includes(family),
              `${locale} 的 ${language} 选项应使用 ${family}: ${font}`,
            );
        }
        const fonts = await page
          .locator("body *:not(script, style, svg, path)")
          .evaluateAll((elements) =>
            elements
              .filter((element) =>
                [...element.childNodes].some(
                  (node) => node.nodeType === 3 && node.textContent.trim(),
                ),
              )
              .map((element) => {
                const style = getComputedStyle(element);
                return {
                  text: element.textContent.trim(),
                  actual: style.fontFamily,
                  expected: style
                    .getPropertyValue(
                      style.fontStyle === "italic"
                        ? "--font-fetarute-italic"
                        : "--font-fetarute-ui",
                    )
                    .trim(),
                };
              }),
          );
        for (const font of fonts) {
          const families = (stack) => stack.split(",").map((family) => family.trim());
          assert.deepEqual(
            families(font.actual),
            families(font.expected),
            `${locale}/${route}: ${font.text}`,
          );
        }
      }
    }
  } finally {
    await page.close();
  }
});

for (const reducedMotion of ["reduce", "no-preference"]) {
  test(`Compact 服务台保持密度，横移到品牌和信号带展开；${reducedMotion}`, async () => {
    const page = await browser.newPage({ viewport: { width: 1536, height: 864 }, reducedMotion });
    try {
      await page.goto(`${baseUrl}/zh-Hans/#shared-shore`, { waitUntil: "networkidle" });
      const compact = () =>
        page.evaluate(
          () =>
            document.documentElement.hasAttribute("data-header-compact") &&
            !document.documentElement.hasAttribute("data-header-hover-expanded"),
        );
      for (const target of [".brand", ".home-nav-compact-signal"]) {
        await page.mouse.move(0, 500);
        await page.waitForTimeout(800);
        assert.ok(await compact());
        await page.locator(".service-desk__summary").hover();
        await page.waitForTimeout(650);
        assert.ok(await compact(), "服务台预览不能展开 Header 或出口");
        assert.equal(await page.locator(".service-desk").getAttribute("open"), "");
        await page
          .locator('.service-desk .appearance-choice[data-appearance-choice="dark"]')
          .hover();
        assert.ok(await compact(), "移入服务台面板仍保持紧凑");
        const appearance = page.locator('.service-desk [data-appearance-choice="dark"]');
        await appearance.click();
        assert.equal(await page.locator("html").getAttribute("data-appearance"), "dark");
        assert.equal(await appearance.getAttribute("aria-pressed"), "true");
        assert.ok(await compact(), "点击外观选项不能因焦点事件移动面板");
        await appearance.blur();
        const box = await page.locator(target).boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(650);
        assert.ok(!(await compact()), `${target} 应展开完整 Header`);
      }
      await page.mouse.move(0, 500);
      await page.waitForTimeout(800);
      await page.locator(".compact-exit-menu__summary").hover();
      await page.waitForTimeout(650);
      assert.ok(await compact(), "悬停紧凑出口不能展开 Header");
      assert.equal(await page.locator(".compact-exit-menu").getAttribute("open"), "");
      await page.locator(".compact-exit-menu__menu a").first().hover();
      assert.ok(await compact(), "出口浮层也保持紧凑");
      await page.locator(".compact-exit-menu__summary").click();
      assert.ok(await compact(), "点击固定出口菜单不能移动触发器");
      await page.keyboard.press("Tab");
      assert.ok(await compact(), "键盘进入已打开的紧凑出口菜单不能隐藏当前焦点");
      assert.ok(
        await page.evaluate(
          () =>
            document.activeElement.matches(".compact-exit-menu a") &&
            document.activeElement.getClientRects().length > 0,
        ),
      );
      await page.locator(".compact-exit-menu__summary").blur();
      const signal = await page.locator(".home-nav-compact-signal").boundingBox();
      await page.mouse.move(signal.x + signal.width / 2, signal.y + signal.height / 2);
      await page.waitForTimeout(650);
      assert.ok(!(await compact()), "从紧凑出口横移到信号带仍应展开");
      await page.keyboard.press("Escape");
      await page.mouse.move(0, 500);
      await page.waitForTimeout(800);
      await page.locator(".brand").focus();
      assert.ok(!(await compact()), "键盘进入仍立即展开导航");
    } finally {
      await page.close();
    }
  });
}

test("同岸在 2K 125% 等效视口和短屏中保留站名与列车净空", async () => {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  try {
    for (const locale of ["zh-Hans", "zh-Hant", "en"]) {
      await page.goto(`${baseUrl}/${locale}/#shared-shore`);
      await page.evaluate(() => document.fonts.ready);
      // 2048×1152 是 2560×1440 / 125%；短屏覆盖浏览器工具栏和系统缩放叠加后的可用空间。
      for (const [width, height] of [
        ...zoomViewports,
        [1536, 600],
        [2048, 720],
        [2048, 1152],
        [2048, 1050],
        [1920, 1080],
        [1536, 864],
        [1536, 780],
        [1440, 900],
        [1024, 600],
        [1023, 768],
        [390, 844],
        [320, 568],
      ]) {
        await page.setViewportSize({ width, height });
        const bounds = await page.locator("#shared-shore").evaluate((element) => {
          const rect = (selector) => element.querySelector(selector).getBoundingClientRect();
          const copy = rect(".home-transfer-breaker__copy"),
            track = rect(".home-transfer-breaker__incoming-horizontal-track"),
            train = rect(".home-transfer-breaker__train--incoming");
          return {
            top:
              copy.top -
              element.querySelector(".home-transfer-breaker__stage").getBoundingClientRect().top,
            gap: Math.min(track.top, train.top) - copy.bottom,
            left: copy.left,
            right: copy.right,
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
        if (width >= 1024) {
          assert.ok(bounds.gap >= 23.9, `${locale} ${width}×${height}: ${JSON.stringify(bounds)}`);
          assert.ok(
            bounds.top >= 127.9,
            `站名应避开 Header: ${locale} ${width}×${height}: ${JSON.stringify(bounds)}`,
          );
        }
        assert.ok(bounds.left >= 0 && bounds.right <= width && !bounds.overflow);
      }
    }
  } finally {
    await page.close();
  }
});

test("三语主要页面在 80%–200% 等效缩放下保持完整 Header 和页面边界", async () => {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    for (const locale of ["zh-Hans", "zh-Hant", "en"]) {
      for (const route of ["#shared-shore", "community/", "info/"]) {
        await page.goto(`${baseUrl}/${locale}/${route}`, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        await page.mouse.move(0, 400);
        for (const [width, height] of zoomViewports) {
          await page.setViewportSize({ width, height });
          await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
          await page.waitForFunction(
            () => !document.documentElement.hasAttribute("data-header-compact"),
          );
          const state = await page.evaluate(() => {
            const header = document.querySelector(".site-header").getBoundingClientRect();
            const labels = [
              ...document.querySelectorAll(
                ".home-nav__label, .service-desk__label, .exit-menu__label",
              ),
            ]
              .filter((element) => element.getClientRects().length)
              .map((element) => {
                const label = element.getBoundingClientRect();
                const tile = element
                  .closest(".home-nav, .service-desk, .exit-menu")
                  .getBoundingClientRect();
                return {
                  text: element.textContent,
                  fits:
                    tile.left >= header.left - 0.1 &&
                    tile.right <= header.right + 0.1 &&
                    label.left >= tile.left &&
                    label.right <= tile.right &&
                    label.top >= tile.top &&
                    label.bottom <= tile.bottom,
                };
              });
            return {
              directoryTop: document.querySelector(".info-directory")?.getBoundingClientRect().top,
              headerBottom: header.bottom,
              overflow: document.documentElement.scrollWidth > innerWidth,
              headerFits: header.left >= 0 && header.right <= innerWidth,
              labels,
            };
          });
          assert.ok(
            !state.overflow && state.headerFits && state.labels.every((label) => label.fits),
            `${locale}/${route} ${width}×${height}: ${JSON.stringify(state)}`,
          );
          if (route === "info/")
            assert.ok(
              state.directoryTop >= state.headerBottom + 8,
              `资讯目录应避开 Header: ${JSON.stringify(state)}`,
            );
        }
      }
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test("英文窄桌面在服务台和出口图标展开后仍落在 Header 边框内", async () => {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  try {
    await page.goto(`${baseUrl}/en/info/`, { waitUntil: "networkidle" });
    for (const width of [761, 800, 900, 960, 1097, 1200]) {
      await page.setViewportSize({ width, height: 600 });
      for (const selector of [".service-desk__summary", ".exit-menu__summary"]) {
        await page.locator(selector).hover();
        await page.waitForTimeout(350);
        const fits = await page.evaluate(() => {
          const header = document.querySelector(".site-header").getBoundingClientRect();
          const exit = document.querySelector(".exit-menu").getBoundingClientRect();
          return exit.right <= header.right + 0.1;
        });
        assert.ok(fits, `${width}px ${selector} 不应撑出 Header`);
      }
    }
  } finally {
    await page.close();
  }
});
