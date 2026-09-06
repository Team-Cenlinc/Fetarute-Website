import assert from "node:assert/strict";
import { after, test } from "node:test";

/* 复用本机浏览器依赖；布局次数检测补足静态测试无法证明滚动性能的缺口。 */
const { chromium, webkit } = await import(process.env.FETARUTE_PLAYWRIGHT_MODULE ?? "playwright");
const engine = process.env.FETARUTE_TEST_BROWSER ?? "chromium";
assert.ok(["chromium", "webkit"].includes(engine));
const browser = await (engine === "webkit" ? webkit : chromium).launch({
  headless: true,
  ...(engine === "chromium" ? { channel: "chrome" } : {}),
});
after(() => browser.close());
const baseUrl = process.env.FETARUTE_HOME_TEST_URL ?? "http://127.0.0.1:4323";
const trainSelector = "[data-home-arrival-train]";
const tooltipSelector = "#home-arrival-train-tooltip";

/** 固定到同一条竖轨，等字体与深链恢复完成，避免把资源加载误算成弹窗开销。 */
async function preparePage(options = {}, locale = "zh-Hans") {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    ...options,
  });
  await page.goto(`${baseUrl}/${locale}/#onward`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const start = await page.locator("[data-home-tri-server]").evaluate((element) => {
    const top = element.getBoundingClientRect().top + scrollY + 200;
    scrollTo({ top, behavior: "instant" });
    return top;
  });
  await page.waitForFunction(() => !document.querySelector("[data-home-arrival-train]").disabled);
  await page.waitForTimeout(250);
  return { page, start };
}

/** 用真实布局计数而非机器相关的毫秒阈值，捕获弹窗跟随时逐帧回流的回归。 */
test(
  `${engine}: 打开 Tooltip 不为每个滚动帧增加布局`,
  { skip: engine !== "chromium" },
  async () => {
    const { page, start } = await preparePage();
    try {
      const session = await page.context().newCDPSession(page);
      await session.send("Performance.enable");
      const layoutCount = async () =>
        (await session.send("Performance.getMetrics")).metrics.find(
          (metric) => metric.name === "LayoutCount",
        ).value;
      const counts = [];
      for (const open of [false, true]) {
        await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), start);
        if (open) await page.locator(trainSelector).tap();
        await page.waitForTimeout(300);
        const before = await layoutCount();
        await page.evaluate(async (top) => {
          for (let frame = 0; frame < 60; frame++) {
            await new Promise(requestAnimationFrame);
            scrollTo({ top: top + frame * 3, behavior: "instant" });
          }
          await new Promise(requestAnimationFrame);
        }, start);
        counts.push((await layoutCount()) - before);
        assert.equal(
          await page.locator(tooltipSelector).getAttribute("aria-hidden"),
          String(!open),
        );
      }
      assert.ok(counts[1] <= counts[0] + 5, `关闭/打开的布局次数：${counts.join(" / ")}`);
    } finally {
      await page.close();
    }
  },
);

/** 从弹窗标题发起浏览器原生触摸滚动，检查局部 touch-action 是否吞掉纵向手势。 */
test(`${engine}: 从 Tooltip 标题滑动仍能滚动页面`, { skip: engine !== "chromium" }, async () => {
  const { page } = await preparePage();
  try {
    await page.locator(trainSelector).tap();
    await page.waitForTimeout(250);
    const bounds = await page.locator(".home-journey-quick-pick__current strong").boundingBox();
    const x = bounds.x + bounds.width / 2;
    const y = bounds.y + bounds.height / 2;
    const before = await page.evaluate(() => scrollY);
    const session = await page.context().newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (let step = 1; step <= 10; step++) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y: y - step * 8 }],
      });
      await page.waitForTimeout(16);
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(150);
    const distance = (await page.evaluate(() => scrollY)) - before;
    assert.ok(distance > 40, `标题区域的 80px 触摸滑动只滚动了 ${distance}px`);
    assert.equal(await page.locator(tooltipSelector).getAttribute("aria-hidden"), "false");
  } finally {
    await page.close();
  }
});

/* 窄屏英文、常见手机宽度、桌面和减少动态都必须保留完整交互及安全边界。 */
for (const [width, height, locale, reducedMotion] of [
  [390, 844, "zh-Hans", "no-preference"],
  [440, 956, "zh-Hant", "no-preference"],
  [320, 568, "en", "no-preference"],
  [1280, 720, "en", "no-preference"],
  [390, 844, "zh-Hans", "reduce"],
]) {
  test(`${engine} ${width}×${height} ${locale} ${reducedMotion}: Tooltip 跟随与关闭`, async () => {
    const mobile = width < 1024;
    const { page, start } = await preparePage(
      {
        viewport: { width, height },
        isMobile: mobile,
        hasTouch: mobile,
        reducedMotion,
      },
      locale,
    );
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      const train = page.locator(trainSelector);
      const tooltip = page.locator(tooltipSelector);
      if (mobile) await train.tap();
      else {
        await train.hover();
        await page.waitForFunction(
          () =>
            document.querySelector("#home-arrival-train-tooltip").getAttribute("aria-hidden") ===
            "false",
        );
        await train.click();
      }
      await page.waitForTimeout(250);
      for (const offset of [0, 80, 180, 80]) {
        await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), start + offset);
        await page.evaluate(
          () =>
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
        const state = await tooltip.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          const train = document.querySelector("[data-home-arrival-train]").getBoundingClientRect();
          const header = document.querySelector(".site-header").getBoundingClientRect();
          return {
            left: bounds.left,
            top: bounds.top,
            right: bounds.right,
            bottom: bounds.bottom,
            width: innerWidth,
            height: innerHeight,
            open: element.getAttribute("aria-hidden"),
            inert: element.inert,
            placement: element.dataset.placement,
            center: bounds.top + bounds.height / 2,
            expectedCenter: Math.max(
              header.bottom + 12 + bounds.height / 2,
              Math.min(train.top + train.height / 2, innerHeight - 20 - bounds.height / 2),
            ),
          };
        });
        assert.equal(state.open, "false");
        assert.equal(state.inert, false);
        assert.ok(state.left >= 19 && state.right <= state.width - 19, JSON.stringify(state));
        assert.ok(state.top >= 19 && state.bottom <= state.height - 19, JSON.stringify(state));
        if (state.placement === "right" || state.placement === "left") {
          assert.ok(
            Math.abs(state.center - state.expectedCenter) < 1,
            `跟随不能被开合过渡拖慢：${JSON.stringify(state)}`,
          );
        }
      }
      /* 320px 英文使用 corner 回退，弹窗可覆盖列车，此时由下方关闭按钮负责收起。 */
      if (mobile && width >= 390) {
        await train.tap();
        assert.equal(await tooltip.getAttribute("aria-hidden"), "true");
        await train.tap();
        assert.equal(await tooltip.getAttribute("aria-hidden"), "false");
      }
      await page.locator("[data-home-journey-close]").click();
      assert.equal(await tooltip.getAttribute("aria-hidden"), "true");
      assert.equal(await train.getAttribute("aria-expanded"), "false");
      assert.equal(await tooltip.evaluate((element) => element.inert), true);
      await train.blur();
      await train.focus();
      assert.equal(await tooltip.getAttribute("aria-hidden"), "false");
      await page.keyboard.press("Escape");
      assert.equal(await tooltip.getAttribute("aria-hidden"), "true");
      if (mobile) await train.tap();
      else await train.click();
      await tooltip.locator('[data-home-journey-target-id="beginning-bay"]').click();
      await page.waitForTimeout(350);
      assert.equal(await tooltip.getAttribute("aria-hidden"), "true");
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  });
}
