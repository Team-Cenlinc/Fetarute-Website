import assert from "node:assert/strict";
import { after, test } from "node:test";

/* Gate 的视口变化与拖拽必须在真实 DOM 中一起验证，复用已有外置浏览器依赖。 */
const { chromium, webkit } = await import(process.env.FETARUTE_PLAYWRIGHT_MODULE ?? "playwright");
const engine = process.env.FETARUTE_TEST_BROWSER ?? "chromium";
assert.ok(["chromium", "webkit"].includes(engine));
const browser = await (engine === "webkit" ? webkit : chromium).launch({
  headless: true,
  ...(engine === "chromium" ? { channel: "chrome" } : {}),
});
after(() => browser.close());
const baseUrl = process.env.FETARUTE_HOME_TEST_URL ?? "http://127.0.0.1:4323";

/** 每个场景使用新会话，只略过 Launch，保留 Gate 的真实滑入、锁定与焦点行为。 */
async function openGate(options = {}) {
  const page = await browser.newPage({
    viewport: { width: 440, height: 956 },
    isMobile: true,
    hasTouch: true,
    ...options,
  });
  await page.addInitScript(() => sessionStorage.setItem("fetarute.launch.seen", "true"));
  await page.goto(`${baseUrl}/zh-Hans/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    scrollTo({ top: innerHeight, behavior: "instant" });
  });
  await page.waitForFunction(
    () => document.querySelector("[data-departure-gate]")?.dataset.state === "active",
  );
  await page.waitForTimeout(300);
  return page;
}

/** 卡片的真实中心同时用于指针落点与漂移断言，避免仅检查状态却漏掉视觉跳动。 */
async function getCenter(page, selector) {
  return page.locator(selector).evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  });
}

for (const [heightDelta, offsetDelta] of [
  [-80, 0],
  [80, 0],
  [-40, 40],
]) {
  test(`${engine}: 拖卡期间可见高度${heightDelta}px、顶部偏移${offsetDelta}px仍跟手并准确验票`, async () => {
    const page = await openGate();
    try {
      const start = await getCenter(page, "[data-departure-pass]");
      await page.mouse.move(start.x, start.y);
      await page.mouse.down();
      await page.evaluate(
        ({ heightDelta, offsetDelta }) => {
          const height = visualViewport.height + heightDelta;
          const offset = visualViewport.offsetTop + offsetDelta;
          Object.defineProperty(visualViewport, "height", {
            configurable: true,
            get: () => height,
          });
          Object.defineProperty(visualViewport, "offsetTop", {
            configurable: true,
            get: () => offset,
          });
          visualViewport.dispatchEvent(new Event("resize"));
        },
        { heightDelta, offsetDelta },
      );
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      const resized = await getCenter(page, "[data-departure-pass]");
      assert.ok(
        Math.hypot(resized.x - start.x, resized.y - start.y) < 0.1,
        `指针不动时卡片漂移：${JSON.stringify({ start, resized })}`,
      );
      /* 向视口内轻移；高度收缩时不能为了立刻把整张卡片塞回边界而跳动。 */
      await page.mouse.move(start.x + 1, start.y - 1);
      const nudged = await getCenter(page, "[data-departure-pass]");
      assert.ok(
        Math.hypot(nudged.x - start.x - 1, nudged.y - start.y + 1) < 0.1,
        "视口更新后的首个 pointermove 必须继续使用相同的指针相对位置",
      );
      const reader = await getCenter(page, "[data-departure-reader]");
      /* 取真实感应区内偏下的落点，旧 Reader 缓存会错误拒绝这个位置。 */
      await page.mouse.move(reader.x, reader.y + 100);
      await page.mouse.up();
      assert.equal(
        await page.locator("[data-departure-gate]").getAttribute("data-state"),
        "validated",
      );
      await page.waitForFunction(() => !document.querySelector("[data-departure-gate]"));
      assert.equal(
        await page.evaluate(() => document.documentElement.hasAttribute("data-departure-gating")),
        false,
      );
    } finally {
      await page.close();
    }
  });
}

test(`${engine}: 松手先于视口动画帧时仍使用最新感应区`, async () => {
  const page = await openGate();
  try {
    await page.locator("[data-departure-pass]").evaluate((element) => {
      element.addEventListener(
        "pointerdown",
        (event) => {
          window.gateDragPointerId = event.pointerId;
        },
        { once: true },
      );
    });
    const start = await getCenter(page, "[data-departure-pass]");
    const reader = await getCenter(page, "[data-departure-reader]");
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    /* 此移动视口的感应半径约 129px；高度缩小 80px 时 Reader 上移约 5.6px，使这个圈外落点进入圈内。 */
    await page.mouse.move(reader.x, reader.y - 132);
    assert.equal(
      await page.locator("[data-departure-gate]").getAttribute("data-state"),
      "dragging",
    );
    const state = await page.evaluate(() => {
      const height = visualViewport.height - 80;
      Object.defineProperty(visualViewport, "height", { configurable: true, get: () => height });
      visualViewport.dispatchEvent(new Event("resize"));
      /* 同一任务内派发松开，保证排队的 rAF 尚未执行，覆盖真实输入抢先到达的顺序。 */
      window.dispatchEvent(new PointerEvent("pointerup", { pointerId: window.gateDragPointerId }));
      return document.querySelector("[data-departure-gate]").dataset.state;
    });
    assert.equal(state, "validated");
    await page.mouse.up();
  } finally {
    await page.close();
  }
});

test(`${engine}: 视口变化后无效落点仍回位，略过入口保持可用`, async () => {
  const page = await openGate();
  try {
    const start = await getCenter(page, "[data-departure-pass]");
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.evaluate(() => {
      const height = visualViewport.height - 80;
      Object.defineProperty(visualViewport, "height", { configurable: true, get: () => height });
      visualViewport.dispatchEvent(new Event("resize"));
    });
    await page.mouse.move(start.x - 10, start.y - 20);
    await page.mouse.up();
    await page.waitForFunction(
      () => document.querySelector("[data-departure-gate]")?.dataset.state === "active",
    );
    const skip = page.locator("[data-departure-skip]");
    const box = await skip.boundingBox();
    assert.ok(box.y + box.height <= 876, "略过按钮必须留在收缩后的可见区域");
    await skip.click();
    await page.waitForFunction(() => !document.querySelector("[data-departure-gate]"));
  } finally {
    await page.close();
  }
});

test(`${engine}: 连续视口更新不会把小步拖动误判为点击`, async () => {
  const page = await openGate();
  try {
    const start = await getCenter(page, "[data-departure-pass]");
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    /* 每笔输入小于拖动门槛，但整段手势超过门槛；重建定位基准不能清掉按下起点。 */
    for (let step = 1; step <= 4; step++) {
      await page.mouse.move(start.x - step * 4, start.y);
      await page.evaluate(async () => {
        const height = visualViewport.height - 1;
        Object.defineProperty(visualViewport, "height", { configurable: true, get: () => height });
        visualViewport.dispatchEvent(new Event("resize"));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
    }
    await page.mouse.up();
    assert.equal(
      await page.locator("[data-departure-gate]").getAttribute("data-state"),
      "returning",
      "未进入感应区的小步拖动应回位，不能作为点击验票",
    );
    await page.waitForFunction(
      () => document.querySelector("[data-departure-gate]")?.dataset.state === "active",
    );
  } finally {
    await page.close();
  }
});

test(`${engine}: 减少动态时仍可在视口改变后用键盘验票`, async () => {
  const page = await openGate({ reducedMotion: "reduce" });
  try {
    await page.evaluate(() => {
      const height = visualViewport.height - 80;
      Object.defineProperty(visualViewport, "height", { configurable: true, get: () => height });
      visualViewport.dispatchEvent(new Event("resize"));
    });
    await page.locator("[data-departure-reader]").focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => !document.querySelector("[data-departure-gate]"));
    assert.equal(await page.locator("main").evaluate((element) => element.inert), false);
  } finally {
    await page.close();
  }
});

test(`${engine}: Gate 退回 Home 后停止视口工作，重新激活后恢复且不重复写相同值`, async () => {
  const page = await openGate({
    viewport: { width: 1440, height: 900 },
    isMobile: false,
    hasTouch: false,
  });
  try {
    await page.mouse.move(900, 600);
    /* 第一笔上滚解除 modal 的 overflow 锁，第二笔才推进真实文档滚动。 */
    await page.mouse.wheel(0, -10);
    await page.waitForTimeout(50);
    await page.mouse.wheel(0, -900);
    await page.waitForFunction(
      () => document.querySelector("[data-departure-gate]")?.dataset.state === "armed",
    );
    const writes = await page.evaluate(async () => {
      const gate = document.querySelector("[data-departure-gate]");
      let writes = 0;
      const setProperty = gate.style.setProperty.bind(gate.style);
      gate.style.setProperty = (property, ...args) => {
        if (
          property === "--departure-gate-document-top" ||
          property.startsWith("--departure-gate-visible")
        )
          writes++;
        return setProperty(property, ...args);
      };
      window.gateViewportWrites = () => writes;
      for (let index = 0; index < 20; index++) {
        scrollTo({ top: index * 2, behavior: "instant" });
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      }
      return writes;
    });
    assert.equal(writes, 0, "隐藏的 Gate 不应继续读写视口状态");
    await page.evaluate(() => scrollTo({ top: innerHeight, behavior: "instant" }));
    await page.waitForFunction(
      () => document.querySelector("[data-departure-gate]")?.dataset.state === "active",
    );
    const sceneHeight = await page.evaluate(async () => {
      const height = visualViewport.height - 80;
      Object.defineProperty(visualViewport, "height", { configurable: true, get: () => height });
      visualViewport.dispatchEvent(new Event("resize"));
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return document.querySelector(".departure-gate__scene").getBoundingClientRect().height;
    });
    assert.equal(sceneHeight, 820, "回到 Gate 后仍应跟随可见高度");
    const idleWrites = await page.evaluate(async () => {
      const before = window.gateViewportWrites();
      for (let index = 0; index < 5; index++) {
        visualViewport.dispatchEvent(new Event("resize"));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      }
      return window.gateViewportWrites() - before;
    });
    assert.equal(idleWrites, 0, "重复 viewport 事件不应写入相同样式");
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector("[data-departure-gate]"));
  } finally {
    await page.close();
  }
});
