import assert from "node:assert/strict";
import { after, test } from "node:test";

/* 与列车回归共用本机浏览器模块和预览地址，不向官网添加运行时依赖。 */
const { chromium, webkit } = await import(process.env.FETARUTE_PLAYWRIGHT_MODULE ?? "playwright");
const engine = process.env.FETARUTE_TEST_BROWSER ?? "chromium";
assert.ok(["chromium", "webkit"].includes(engine));
const browser = await (engine === "webkit" ? webkit : chromium).launch({
  headless: true,
  ...(engine === "chromium" ? { channel: "chrome" } : {}),
});
after(() => browser.close());
const baseUrl = process.env.FETARUTE_HOME_TEST_URL ?? "http://127.0.0.1:4323";

/* 最窄英文、横屏与桌面短屏检验可读性；减少动态仍需要完整的双向操作。 */
for (const [width, height, locale, reducedMotion, batchVisibility] of [
  [390, 844, "zh-Hans", "no-preference"],
  [320, 568, "en", "no-preference"],
  [760, 390, "zh-Hant", "no-preference"],
  [1024, 600, "en", "no-preference"],
  [1440, 900, "zh-Hans", "no-preference"],
  [390, 844, "zh-Hans", "reduce"],
  [390, 844, "zh-Hans", "no-preference", true],
]) {
  test(`${engine} ${width}×${height} ${locale} ${reducedMotion}${batchVisibility ? " batched visibility" : ""}: PIDS 可读、可往返且保留手动选择`, async () => {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      if (batchVisibility) {
        /* 重现深链定位的一批离屏→入屏记录，验证旧记录不会让已可见的按钮永久停更。 */
        await page.addInitScript(() => {
          const OriginalObserver = window.IntersectionObserver;
          window.IntersectionObserver = class extends OriginalObserver {
            constructor(callback, options) {
              super((entries, observer) => {
                const latest = entries.at(-1);
                if (latest?.target.matches("[data-home-onward-content]") && latest.isIntersecting) {
                  callback(
                    [
                      { target: latest.target, isIntersecting: false, time: latest.time - 1 },
                      ...entries,
                    ],
                    observer,
                  );
                } else {
                  callback(entries, observer);
                }
              }, options);
            }
          };
        });
      }
      await page.goto(`${baseUrl}/${locale}/#onward`, { waitUntil: "networkidle" });
      /* 桌面深链先落在续行换乘段；正文进入预加载范围后才应等待 PIDS 控制器。 */
      await page.locator("[data-home-onward-content]").scrollIntoViewIfNeeded();
      await page.waitForFunction(
        () =>
          document.querySelector("[data-home-onward-content]").dataset.homeOnwardEnhanced ===
          "true",
      );
      const section = page.locator("[data-home-onward-content]");
      const journey = await page.locator("[data-home-onward-journey]").evaluate((element) => ({
        top: element.getBoundingClientRect().top + scrollY,
        distance: Math.max(
          0,
          element.offsetHeight - element.querySelector(".home-onward__stage").offsetHeight,
        ),
      }));
      /** 等统一帧提交，不用点击时的中间状态判断 aria 与显示是否同步。 */
      const waitState = (state) =>
        page.waitForFunction(
          (expected) =>
            document.querySelector("[data-home-onward-content]").dataset.homeOnwardBoardState ===
            expected,
          state,
          { timeout: 5000 },
        );
      await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), journey.top);
      await waitState("destinations");

      const controls = await section
        .locator("[data-home-onward-board-navigation]")
        .evaluate((nav) => {
          const bounds = nav.getBoundingClientRect();
          const shell = document.querySelector(".home-onward__board-shell").getBoundingClientRect();
          const header = document.querySelector(".site-header").getBoundingClientRect();
          return {
            clearance: shell.top - bounds.bottom,
            headerClearance: bounds.top - header.bottom,
            buttons: [...nav.querySelectorAll("button")].map((button) => {
              const rect = button.getBoundingClientRect();
              return {
                height: rect.height,
                hit:
                  document
                    .elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
                    ?.closest("button") === button,
              };
            }),
          };
        });
      assert.ok(
        controls.clearance >= 12 && controls.headerClearance >= 12,
        JSON.stringify(controls),
      );
      assert.ok(
        controls.buttons.every(({ height, hit }) => height >= 44 && hit),
        JSON.stringify(controls),
      );

      const screen = section.locator(".home-onward__board-screen");
      const initialSize = await screen.evaluate((element) => ({
        width: element.offsetWidth,
        height: element.offsetHeight,
      }));
      const rowHit = await section
        .locator("tbody tr")
        .first()
        .evaluate((row) => {
          const bounds = row.getBoundingClientRect();
          const hit = document.elementFromPoint(
            bounds.left + bounds.width * 0.3,
            bounds.top + bounds.height / 2,
          );
          return { expected: row.querySelector("a").href, actual: hit?.closest("a")?.href };
        });
      assert.equal(rowHit.actual, rowHit.expected, "点击目的地名称也必须命中该行地图链接");
      assert.ok(
        await section
          .locator("td a")
          .first()
          .evaluate((element) => parseFloat(getComputedStyle(element).fontSize) >= 14),
      );

      await section.locator('[data-home-onward-select-board="help"]').focus();
      await page.keyboard.press("Space");
      await waitState("help");
      assert.equal(
        await section
          .locator('[data-home-onward-select-board="help"]')
          .getAttribute("aria-pressed"),
        "true",
      );
      assert.equal(
        await section
          .locator("[data-home-onward-destination-board]")
          .evaluate((element) => element.inert),
        true,
      );
      assert.equal(
        await section.locator("[data-home-onward-help-board]").evaluate((element) => element.inert),
        false,
      );
      assert.deepEqual(
        await screen.evaluate((element) => ({
          width: element.offsetWidth,
          height: element.offsetHeight,
        })),
        initialSize,
      );

      /* 复制反馈必须可见；模拟成功和双重失败，避免回归测试改变系统剪贴板。 */
      await page.evaluate(() => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: async (value) => {
              window.__copiedNumber = value;
            },
          },
        });
      });
      const copy = section.locator("[data-home-onward-copy-qq]");
      await copy.click();
      await page.waitForFunction(
        () => document.querySelector("[data-home-onward-copy-qq]").dataset.copyState === "copied",
      );
      assert.equal(
        await page.evaluate(() => window.__copiedNumber),
        await copy.getAttribute("data-copy-value"),
      );
      await page.evaluate(() => {
        navigator.clipboard.writeText = async () => {
          throw new Error("Clipboard denied for regression test");
        };
        Reflect.set(document, "execCommand", () => false);
      });
      await copy.click();
      await page.waitForFunction(
        () => document.querySelector("[data-home-onward-copy-qq]").dataset.copyState === "failed",
      );
      const helpGeometry = await section
        .locator("[data-home-onward-help-board]")
        .evaluate((panel) => {
          const bounds = panel.getBoundingClientRect();
          const content = panel.querySelector(".home-onward__help-content").getBoundingClientRect();
          const label = panel.querySelector("[data-home-onward-copy-label]");
          return {
            bottom: bounds.bottom,
            contentBottom: content.bottom,
            contentTop: content.top,
            top: bounds.top,
            labelWidth: label.getBoundingClientRect().width,
            clipped: getComputedStyle(label).clipPath,
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
      assert.ok(
        helpGeometry.contentBottom <= helpGeometry.bottom + 1 &&
          helpGeometry.contentTop >= helpGeometry.top - 1,
        JSON.stringify(helpGeometry),
      );
      assert.ok(
        helpGeometry.labelWidth > 20 && helpGeometry.clipped === "none",
        "复制结果必须在屏幕上可读",
      );
      assert.equal(helpGeometry.overflow, false);

      await section.locator('[data-home-onward-select-board="destinations"]').click();
      await waitState("destinations");
      if (journey.distance > 0 && reducedMotion !== "reduce") {
        await page.evaluate(
          (y) => scrollTo({ top: y, behavior: "instant" }),
          journey.top + journey.distance * 0.8,
        );
        await page.waitForTimeout(150);
        assert.equal(
          await section.getAttribute("data-home-onward-board-state"),
          "destinations",
          "手动返回后不能被滚动立即覆盖",
        );
        await page.evaluate(
          (top) => scrollTo({ top: top - innerHeight - 100, behavior: "instant" }),
          journey.top,
        );
        await page.waitForTimeout(150);
        await page.evaluate(
          (y) => scrollTo({ top: y, behavior: "instant" }),
          journey.top + journey.distance * 0.8,
        );
        await waitState("help");
      }
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  });
}
