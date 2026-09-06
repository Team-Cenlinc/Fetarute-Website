import assert from "node:assert/strict";
import { after, test } from "node:test";

/* 复用外置浏览器，直接覆盖锁屏 Gate 的真实可达性与入场等待，不新增运行时依赖。 */
const { chromium, webkit } = await import(process.env.FETARUTE_PLAYWRIGHT_MODULE ?? "playwright");
const engine = process.env.FETARUTE_TEST_BROWSER ?? "chromium";
const browser = await (engine === "webkit" ? webkit : chromium).launch({
  headless: true,
  ...(engine === "chromium" ? { channel: "chrome" } : {}),
});
after(() => browser.close());
const baseUrl = process.env.FETARUTE_HOME_TEST_URL ?? "http://127.0.0.1:4323";

for (const colorScheme of ["light", "dark"]) {
  test(`${engine}: ${colorScheme} 读卡机深色牌面的小字保持足够对比度`, async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme });
    try {
      await page.addInitScript(() => sessionStorage.setItem("fetarute.launch.seen", "true"));
      await page.goto(`${baseUrl}/zh-Hans/`, { waitUntil: "networkidle" });
      const ratios = await page.evaluate(() => {
        const context = document.createElement("canvas").getContext("2d");
        const luminance = (rgb) =>
          [...rgb]
            .slice(0, 3)
            .map((c) => c / 255)
            .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
            .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
        return [
          [".departure-gate__reader-screen-mode", ".departure-gate__reader-screen"],
          [".departure-gate__reader-copy small", ".departure-gate__reader-sign"],
          [".departure-gate__skip", ".departure-gate__skip"],
        ].map(([text, surface]) => {
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = getComputedStyle(document.querySelector(surface)).backgroundColor;
          context.fillRect(0, 0, 1, 1);
          const background = luminance(context.getImageData(0, 0, 1, 1).data);
          context.fillStyle = getComputedStyle(document.querySelector(text)).color;
          context.fillRect(0, 0, 1, 1);
          const foreground = luminance(context.getImageData(0, 0, 1, 1).data);
          return {
            text,
            ratio:
              (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05),
          };
        });
      });
      for (const result of ratios) assert.ok(result.ratio >= 4.5, JSON.stringify(result));
    } finally {
      await page.close();
    }
  });
}

/** 仅略过品牌启动；每次保留真实的 Gate 首次入场与焦点锁定。 */
async function openPage(width, height, locale = "zh-Hans", reducedMotion = "no-preference") {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion });
  await page.addInitScript(() => sessionStorage.setItem("fetarute.launch.seen", "true"));
  await page.goto(`${baseUrl}/${locale}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

for (const suppressScrollEnd of [false, true]) {
  test(`${engine}: ${suppressScrollEnd ? "缺少 scrollend" : "已经抵达锚点"}时无需等待兜底计时才可验票`, async () => {
    const page = await openPage(1440, 900);
    try {
      const timing = await page.evaluate(async (suppress) => {
        if (suppress)
          window.addEventListener("scrollend", (event) => event.stopImmediatePropagation(), true);
        const gate = document.querySelector("[data-departure-gate]");
        const sentinel = document.querySelector("[data-departure-gate-sentinel]");
        const target = scrollY + sentinel.getBoundingClientRect().top - innerHeight * 0.1;
        const start = performance.now();
        scrollTo({ top: target + (suppress ? 40 : 0), behavior: "instant" });
        return await new Promise((resolve) => {
          const frame = () => {
            const prompt = gate.querySelector("[data-departure-drag-guide-prompt]");
            const elapsed = performance.now() - start;
            if (
              gate.dataset.state === "active" &&
              getComputedStyle(prompt).visibility === "visible" &&
              Number(getComputedStyle(prompt).opacity) > 0.1
            ) {
              resolve({ elapsed, inert: gate.inert });
            } else if (elapsed > 1500) resolve({ elapsed, state: gate.dataset.state });
            else requestAnimationFrame(frame);
          };
          requestAnimationFrame(frame);
        });
      }, suppressScrollEnd);
      assert.ok(timing.elapsed < 650 && timing.inert === false, JSON.stringify(timing));
      await page.locator("[data-departure-skip]").click();
      await page.waitForFunction(() => !document.querySelector("[data-departure-gate]"));
      assert.equal(await page.locator("main").evaluate((main) => main.inert), false);
    } finally {
      await page.close();
    }
  });
}

/* 断点两侧同时检查宽度与高度，避免只在标准竖屏截图上成立。 */
for (const [width, height, locale, reducedMotion = "no-preference"] of [
  [320, 568, "en"],
  [390, 844, "zh-Hans"],
  [440, 956, "zh-Hant"],
  [760, 390, "zh-Hant"],
  [768, 1024, "en"],
  [1024, 600, "en"],
  [1101, 701, "en"],
  [1440, 900, "zh-Hans"],
  [1920, 1080, "en"],
  [320, 568, "en", "reduce"],
]) {
  test(`${engine}: ${width}×${height} ${locale} ${reducedMotion} 读卡机与全部操作可见且互不遮挡`, async () => {
    const page = await openPage(width, height, locale, reducedMotion);
    try {
      await page.evaluate(() => scrollTo({ top: innerHeight, behavior: "instant" }));
      await page.waitForFunction(
        () => document.querySelector("[data-departure-gate]")?.dataset.state === "active",
      );
      await page.waitForTimeout(300);
      const layout = await page.locator("[data-departure-gate]").evaluate((gate) => {
        const rect = (selector) => gate.querySelector(selector).getBoundingClientRect().toJSON();
        return {
          copy: rect(".departure-gate__copy"),
          card: rect("[data-departure-pass]"),
          reader: rect("[data-departure-reader]"),
          skip: rect("[data-departure-skip]"),
          overflow: document.documentElement.scrollWidth > innerWidth,
          targets: [...gate.querySelectorAll("button")].map((button) => {
            const bounds = button.getBoundingClientRect();
            return (
              document
                .elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2)
                ?.closest("button") === button
            );
          }),
        };
      });
      assert.equal(layout.overflow, false);
      for (const [name, bounds] of Object.entries(layout).filter(([, value]) => value?.width)) {
        assert.ok(
          bounds.top >= -1 &&
            bounds.bottom <= height + 1 &&
            bounds.left >= -1 &&
            bounds.right <= width + 1,
          `${name}: ${JSON.stringify(bounds)}`,
        );
      }
      const overlaps = (a, b) =>
        a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      for (const [a, b] of [
        ["copy", "reader"],
        ["copy", "card"],
        ["card", "reader"],
        ["reader", "skip"],
        ["card", "skip"],
      ]) {
        assert.equal(
          overlaps(layout[a], layout[b]),
          false,
          `${a} / ${b}: ${JSON.stringify(layout)}`,
        );
      }
      assert.ok(layout.targets.every(Boolean), "所有控件中心均须可点击");
      if (width <= 760 && height <= 600 && reducedMotion !== "reduce") {
        /* 矮屏改为横向布局后仍需真实拖放，防止静态 translate 与手势 transform 相互覆盖。 */
        const card = await page.locator("[data-departure-pass]").boundingBox();
        const reader = await page.locator("[data-departure-reader]").boundingBox();
        await page.mouse.move(card.x + card.width / 2, card.y + card.height / 2);
        await page.mouse.down();
        await page.mouse.move(reader.x + reader.width / 2, reader.y + reader.height / 2, {
          steps: 5,
        });
        await page.mouse.up();
        assert.equal(
          await page.locator("[data-departure-gate]").getAttribute("data-state"),
          "validated",
        );
      } else {
        await page.locator("[data-departure-reader]").focus();
        await page.keyboard.press("Enter");
      }
      await page.waitForFunction(() => !document.querySelector("[data-departure-gate]"));
      assert.equal(await page.locator("main").evaluate((main) => main.inert), false);
    } finally {
      await page.close();
    }
  });
}
