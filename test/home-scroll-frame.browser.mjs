import assert from "node:assert/strict";
import { after, test } from "node:test";

/* 在真实页面的帧回调内观察读写顺序；避免仅验证调度器而漏掉参与者内部的同步布局。 */
const { chromium, webkit } = await import(process.env.FETARUTE_PLAYWRIGHT_MODULE ?? "playwright");
const engine = process.env.FETARUTE_TEST_BROWSER ?? "chromium";
assert.ok(["chromium", "webkit"].includes(engine));
const browser = await (engine === "webkit" ? webkit : chromium).launch({
  headless: true,
  ...(engine === "chromium" ? { channel: "chrome" } : {}),
});
after(() => browser.close());
const baseUrl = process.env.FETARUTE_HOME_TEST_URL ?? "http://127.0.0.1:4323";

for (const [section, train, name] of [
  [
    '[data-home-transfer-breaker]:not([data-home-transfer-composition="open"])',
    "[data-home-arrival-train-visual]",
    "同岸",
  ],
  ["[data-home-community]", "[data-home-arrival-train-visual]", "同岸交接"],
  [
    '[data-home-transfer-composition="open"]',
    '[data-home-transfer-composition="open"] [data-home-transfer-incoming-train]',
    "续行",
  ],
]) {
  test(`${engine}: ${name}列车随地址栏连续更新，稳定计时结束时不补跳`, async () => {
    const page = await browser.newPage({
      viewport: { width: 440, height: 956 },
      isMobile: true,
      hasTouch: true,
    });
    try {
      await page.goto(`${baseUrl}/zh-Hans/#onward`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.locator(section).evaluate((element) =>
        scrollTo({
          top: element.getBoundingClientRect().top + scrollY - 200,
          behavior: "instant",
        }),
      );
      await page.waitForTimeout(500);
      const runs = await page.evaluate(async (selector) => {
        const element = document.querySelector(selector);
        const originalHeight = visualViewport.height;
        let height = originalHeight;
        /* 只替换浏览器栏报告的高度，保留真实 DOM、事件监听器、rAF 和 120ms 稳定计时。 */
        Object.defineProperty(visualViewport, "height", { configurable: true, get: () => height });
        const sample = () => {
          const bounds = element.getBoundingClientRect();
          return { height, y: bounds.top + bounds.height / 2, scroll: scrollY };
        };
        const runs = [];
        for (const direction of [-1, 1]) {
          const samples = [sample()];
          for (let index = 0; index < 8; index += 1) {
            height += direction * 10;
            visualViewport.dispatchEvent(new Event("resize"));
            await new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve)),
            );
            samples.push(sample());
          }
          await new Promise((resolve) => setTimeout(resolve, 200));
          runs.push({ samples, settled: sample() });
        }
        return runs;
      }, train);
      for (const { samples, settled } of runs) {
        assert.ok(
          Math.abs(settled.y - samples[0].y) > 5,
          `场景必须覆盖受可见高度影响的车位：${JSON.stringify(samples)}`,
        );
        assert.ok(
          samples.every((sample) => sample.scroll === settled.scroll),
          "固定文档滚动位置，单独检验地址栏变化造成的位移",
        );
        assert.ok(
          samples.slice(1).every((sample, index) => Math.abs(sample.y - samples[index].y) > 0.1),
          `每次高度更新都应在下一帧推动列车，不能冻结到计时结束：${JSON.stringify(samples)}`,
        );
        assert.ok(
          Math.abs(settled.y - samples.at(-1).y) < 0.1,
          `浏览器栏停止后列车额外跳动了 ${settled.y - samples.at(-1).y}px`,
        );
      }
    } finally {
      await page.close();
    }
  });
}

for (const width of [440, 1440]) {
  test(`${engine} ${width}px: 启示湾横轨在路线帧延迟时仍与列车一起纵向滚动`, async () => {
    const page = await browser.newPage({
      viewport: { width, height: 956 },
      isMobile: width < 1024,
      hasTouch: width < 1024,
    });
    try {
      await page.addInitScript(() => {
        const nativeRequestFrame = requestAnimationFrame.bind(window);
        window.holdRouteFrames = false;
        window.requestAnimationFrame = (callback) =>
          nativeRequestFrame((timestamp) => {
            if (!window.holdRouteFrames) callback(timestamp);
          });
      });
      await page.goto(`${baseUrl}/zh-Hans/#onward`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.locator("[data-home-arrival-route]").evaluate((element) =>
        scrollTo({
          top: element.getBoundingClientRect().top + scrollY + 10,
          behavior: "instant",
        }),
      );
      await page.waitForFunction(
        () =>
          document.querySelector("[data-home-arrival-train]").dataset.routeSegment === "horizontal",
      );
      await page.waitForTimeout(250);
      await page.evaluate(() => {
        window.holdRouteFrames = true;
        scrollBy({ top: 24, behavior: "instant" });
      });
      await page.waitForTimeout(60);
      const offsets = await page.evaluate(() => {
        const track = document
          .querySelector("[data-home-arrival-horizontal]")
          .getBoundingClientRect();
        return ["[data-home-arrival-train-visual]", "[data-home-arrival-train]"].map((selector) => {
          const train = document.querySelector(selector).getBoundingClientRect();
          return train.top + train.height / 2 - track.top - track.height / 2;
        });
      });
      assert.ok(
        offsets.every((offset, index) => Math.abs(offset) < (index === 0 ? 0.1 : 1)),
        `路线帧延迟时，车身/命中区偏离横轨 ${offsets.join(" / ")}px`,
      );
    } finally {
      await page.close();
    }
  });

  test(`${engine} ${width}px: 启示湾与正文切换定位时车身和点击区域连续`, async () => {
    const page = await browser.newPage({ viewport: { width, height: 956 } });
    try {
      await page.goto(`${baseUrl}/zh-Hans/#onward`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.locator("[data-home-introduction-route]").evaluate((element) =>
        scrollTo({
          top: element.getBoundingClientRect().top + scrollY - 20,
          behavior: "instant",
        }),
      );
      /* 先让 Gallery 的进入过渡结束，仅测量坐标系切换本身的连续性。 */
      await page.waitForTimeout(1000);
      const states = await page.evaluate(async () => {
        const intro = document.querySelector("[data-home-introduction-route]");
        const top = intro.getBoundingClientRect().top + scrollY;
        const states = [];
        for (const offset of [-2, -1, 0, 1, 2, 1, 0, -1, -2]) {
          scrollTo({ top: top + offset, behavior: "instant" });
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
          const body = document
            .querySelector("[data-home-arrival-train-visual]")
            .getBoundingClientRect();
          const hit = document.querySelector("[data-home-arrival-train]");
          const bounds = hit.getBoundingClientRect();
          states.push({
            position: hit.dataset.routePosition,
            x: body.left + body.width / 2,
            y: body.top + body.height / 2,
            hitX: bounds.left + bounds.width / 2,
            hitY: bounds.top + bounds.height / 2,
          });
        }
        return states;
      });
      assert.deepEqual(
        new Set(states.map(({ position }) => position)),
        new Set(["document", "viewport"]),
      );
      for (const [index, state] of states.entries()) {
        assert.ok(
          Math.abs(state.x - state.hitX) < 1 && Math.abs(state.y - state.hitY) < 1,
          `切换定位后点击区仍需覆盖车身：${JSON.stringify(state)}`,
        );
        if (index > 0)
          assert.ok(
            Math.hypot(state.x - states[index - 1].x, state.y - states[index - 1].y) < 4,
            `1px 滚动跨定位边界时不应跳跃：${JSON.stringify(states)}`,
          );
      }
    } finally {
      await page.close();
    }
  });
}

for (const width of [440, 1280]) {
  test(`${engine} ${width}px: 路线写入样式后不再读取窗口布局`, async () => {
    const page = await browser.newPage({
      viewport: { width, height: 956 },
      isMobile: width < 1024,
      hasTouch: width < 1024,
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.addInitScript(() => {
        const nativeRequestFrame = requestAnimationFrame.bind(window);
        const mutations = new MutationObserver(() => {});
        mutations.observe(document, {
          subtree: true,
          attributes: true,
          attributeFilter: ["style"],
        });
        let inFrame = false;
        let wroteTrainStyle = false;
        window.routeFrameReadProbe = {
          enabled: false,
          reads: 0,
          writes: 0,
          readsAfterWrite: {},
          examples: [],
        };
        const consumeTrainWrites = () => {
          const writes = mutations
            .takeRecords()
            .filter(({ target }) =>
              target.matches("[data-home-arrival-train], [data-home-arrival-train-visual]"),
            ).length;
          window.routeFrameReadProbe.writes += writes;
          wroteTrainStyle ||= writes > 0;
        };
        window.requestAnimationFrame = (callback) =>
          nativeRequestFrame((timestamp) => {
            mutations.takeRecords();
            wroteTrainStyle = false;
            inFrame = true;
            try {
              callback(timestamp);
            } finally {
              if (window.routeFrameReadProbe.enabled) consumeTrainWrites();
              inFrame = false;
            }
          });
        for (const property of ["scrollX", "scrollY", "innerWidth", "innerHeight"]) {
          const descriptor = Object.getOwnPropertyDescriptor(window, property);
          Object.defineProperty(window, property, {
            ...descriptor,
            get() {
              if (inFrame && window.routeFrameReadProbe.enabled) {
                window.routeFrameReadProbe.reads++;
                consumeTrainWrites();
                if (wroteTrainStyle) {
                  const probe = window.routeFrameReadProbe;
                  probe.readsAfterWrite[property] = (probe.readsAfterWrite[property] ?? 0) + 1;
                  if (probe.examples.length < 2) probe.examples.push(new Error(property).stack);
                }
              }
              return descriptor.get.call(window);
            },
          });
        }
      });
      await page.goto(`${baseUrl}/zh-Hans/#onward`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      for (const section of [
        "[data-home-arrival-route]",
        "[data-home-gallery]",
        "[data-home-tri-server]",
        "[data-home-onward-content]",
      ]) {
        const start = await page.locator(section).evaluate((element) => {
          const top = element.getBoundingClientRect().top + scrollY + 200;
          scrollTo({ top, behavior: "instant" });
          return top;
        });
        await page.waitForTimeout(250);
        await page.evaluate(async (top) => {
          window.routeFrameReadProbe.enabled = true;
          for (let frame = 0; frame < 24; frame++) {
            await new Promise(requestAnimationFrame);
            scrollTo({ top: top + frame * 4, behavior: "instant" });
          }
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
          window.routeFrameReadProbe.enabled = false;
        }, start);
      }
      const probe = await page.evaluate(() => window.routeFrameReadProbe);
      assert.deepEqual(errors, []);
      assert.ok(
        probe.reads > 0 && probe.writes > 0,
        `必须实际执行列车帧：${JSON.stringify(probe)}`,
      );
      assert.deepEqual(probe.readsAfterWrite, {}, JSON.stringify(probe));
    } finally {
      await page.close();
    }
  });
}

test(`${engine}: 相同列车姿态不重复提交样式`, async () => {
  const page = await browser.newPage({ viewport: { width: 440, height: 956 }, isMobile: true });
  try {
    await page.goto(`${baseUrl}/zh-Hans/#onward`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page
      .locator("[data-home-tri-server]")
      .evaluate((element) =>
        scrollTo({ top: element.getBoundingClientRect().top + scrollY + 200, behavior: "instant" }),
      );
    await page.waitForTimeout(300);
    const writes = await page.evaluate(async () => {
      let count = 0;
      const observer = new MutationObserver((records) => (count += records.length));
      for (const element of document.querySelectorAll(
        "[data-home-arrival-train], [data-home-arrival-train-visual]",
      )) {
        observer.observe(element, { attributes: true, attributeFilter: ["style"] });
      }
      for (let frame = 0; frame < 12; frame++) {
        dispatchEvent(new Event("resize"));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      }
      observer.disconnect();
      return count;
    });
    assert.equal(writes, 0, `同一姿态仍有 ${writes} 次 style 提交`);
  } finally {
    await page.close();
  }
});
