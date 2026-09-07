import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdir } from "node:fs/promises";

/* 沿用现有浏览器回归的外部 Playwright 依赖，不为静态官网新增测试运行时。 */
const { chromium, webkit } = await import(process.env.FETARUTE_PLAYWRIGHT_MODULE ?? "playwright");
const engine = process.env.FETARUTE_TEST_BROWSER ?? "chromium";
assert.ok(["chromium", "webkit"].includes(engine));
const browser = await (engine === "webkit" ? webkit : chromium).launch({
  headless: true,
  ...(engine === "chromium" ? { channel: "chrome" } : {}),
});
after(() => browser.close());
const baseUrl = process.env.FETARUTE_COMMUNITY_TEST_URL ?? "http://127.0.0.1:4324";
const screenshotDirectory = process.env.FETARUTE_SCREENSHOT_DIR;

/** 保存可选的视觉证据；默认回归不向工作区写入截图。 */
async function screenshot(page, name, fullPage = false) {
  if (!screenshotDirectory) return;
  await mkdir(screenshotDirectory, { recursive: true });
  /* 只为视觉记录等待既有 Header 的 compact 过渡，避免把中间帧当作最终布局。 */
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${screenshotDirectory}/${engine}-${name}.png`, fullPage });
}

/** 所有场景通过公开路由和真实初始化进入地图，收集脚本异常和加载错误。 */
async function openPage(options = {}, locale = "zh-Hans") {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, ...options });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(`${baseUrl}/${locale}/community/`, { waitUntil: "networkidle" });
  if (options.javaScriptEnabled !== false) {
    await page.waitForSelector('[data-community-enhanced="true"]');
  }
  await page.evaluate(() => document.fonts.ready);
  return { page, errors };
}

/** 检查浮层没有越过可见视口，尺寸容许亚像素舍入但不能因资料类别而变化。 */
async function assertPanel(page, panel, expected) {
  assert.equal(await panel.isVisible(), true);
  const box = await panel.boundingBox();
  const viewport = page.viewportSize();
  assert.ok(box.x >= 7 && box.y >= 7, JSON.stringify(box));
  assert.ok(box.x + box.width <= viewport.width - 7, JSON.stringify(box));
  assert.ok(box.y + box.height <= viewport.height - 7, JSON.stringify(box));
  if (expected) {
    assert.ok(Math.abs(box.width - expected.width) < 1, JSON.stringify(box));
    assert.ok(Math.abs(box.height - expected.height) < 1, JSON.stringify(box));
  }
  if (await panel.evaluate((element) => element.classList.contains("community-guide"))) {
    const content = await panel.locator("[data-home-journey-picker]").boundingBox();
    assert.ok(
      Math.abs(box.height - content.height - 4) < 2,
      "列车外框应贴合内容，不能被 Popover 的默认 inset 撑满视口",
    );
  }
  assert.equal(await page.locator("[data-community-disclosure][open]").count(), 1);
  return { width: box.width, height: box.height };
}

test(`${engine}: 共用地图保留不同地块，所有 hover 面板同尺寸且展开不改变布局`, async () => {
  const { page, errors } = await openPage();
  try {
    await screenshot(page, "landing");
    const plots = page.locator("[data-community-entity]");
    assert.equal(await plots.count(), 8);
    const widths = new Set();
    for (let index = 0; index < (await plots.count()); index++) {
      const plot = plots.nth(index);
      const trigger = plot.locator(":scope > summary");
      await trigger.locator(".community-plot__label").scrollIntoViewIfNeeded();
      const before = await plots.evaluateAll((elements) =>
        elements.map((element) => {
          const box = element.getBoundingClientRect();
          /* hover 可能为避开 Header 自动滚动；文档坐标才表示地块是否真的重排。 */
          return [box.x + scrollX, box.y + scrollY, box.width, box.height];
        }),
      );
      widths.add(Math.round(before[index][2]));
      await trigger.locator(".community-plot__label").hover();
      await assertPanel(page, plot.locator("[data-community-panel]"), { width: 360, height: 320 });
      assert.deepEqual(
        await plots.evaluateAll((elements) =>
          elements.map((element) => {
            const box = element.getBoundingClientRect();
            return [box.x + scrollX, box.y + scrollY, box.width, box.height];
          }),
        ),
        before,
      );
      if (index === 0) await screenshot(page, "player-expanded");
      await page.keyboard.press("Escape");
      assert.equal(await plot.getAttribute("open"), null);
      await page.mouse.move(2, 2);
    }
    assert.ok(widths.size > 1, "不同地块不能被统一成等尺寸卡片");
    await page.locator(".community-district__hint").click();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await screenshot(page, "district", true);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: 随机异形地块完整容纳头像和姓名，不只容纳中心点`, async () => {
  const { page, errors } = await openPage({ reducedMotion: "reduce" });
  try {
    for (const [seed, width, height] of [
      [4, 320, 568],
      [4, 390, 844],
      [15, 1440, 900],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto(`${baseUrl}/zh-Hans/community/?mapSeed=${seed}`, {
        waitUntil: "networkidle",
      });
      const clipped = await page
        .locator("[data-community-entity] > summary")
        .evaluateAll((summaries) => {
          /** 浏览器实际裁切轮廓是可见边界；用完整内容盒检查，不依赖生成器内部标注算法。 */
          function inside(x, y, points) {
            let result = false;
            for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
              const [xi, yi] = points[i],
                [xj, yj] = points[j];
              if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
                result = !result;
            }
            return result;
          }
          return summaries.flatMap((summary) => {
            const box = summary.getBoundingClientRect();
            const points = getComputedStyle(summary)
              .clipPath.slice(8, -1)
              .split(",")
              .map((point) => {
                const [x, y] = point.trim().split(/\s+/).map(parseFloat);
                return [box.left + (box.width * x) / 100, box.top + (box.height * y) / 100];
              });
            return [
              ...summary.querySelectorAll(".community-plot__portrait, .community-plot__name"),
            ].flatMap((content) => {
              const rect = content.getBoundingClientRect();
              const ys = [
                rect.top + 0.5,
                rect.bottom - 0.5,
                ...points.map(([, y]) => y).filter((y) => y > rect.top && y < rect.bottom),
              ];
              return ys.flatMap((y) =>
                [rect.left + 0.5, rect.right - 0.5]
                  .filter((x) => !inside(x, y, points))
                  .map((x) => ({ id: summary.parentElement.id, content: content.className, x, y })),
              );
            });
          });
        });
      assert.deepEqual(clipped, [], `seed=${seed}, viewport=${width}×${height}: 标注被地块裁切`);
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: 1920×1080 原画板比例下保留线路和头像，展开仍为相同尺寸`, async () => {
  const { page, errors } = await openPage({ viewport: { width: 1920, height: 1080 } });
  try {
    await screenshot(page, "native-landing");
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    assert.equal(await page.locator(".community-mosaic img").count(), 5);
    await page.locator(".community-mosaic").click();
    await screenshot(page, "native-map");
    const plot = page.locator("[data-community-entity]").first();
    await plot.locator(".community-plot__label").hover();
    await assertPanel(page, plot.locator("[data-community-panel]"), { width: 360, height: 320 });
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: 预览可进入、点击固定、Escape 恢复焦点，列车和地点互斥`, async () => {
  const { page, errors } = await openPage();
  try {
    const plot = page.locator("[data-community-entity]").first();
    const trigger = plot.locator(":scope > summary");
    const panel = plot.locator("[data-community-panel]");
    await trigger.scrollIntoViewIfNeeded();
    await trigger.locator(".community-plot__label").hover();
    await panel.hover();
    await page.waitForTimeout(250);
    assert.equal(await panel.isVisible(), true, "鼠标应能从地块进入面板");
    await trigger.locator(".community-plot__label").click();
    await page.mouse.move(2, 2);
    await page.waitForTimeout(250);
    assert.equal(await plot.getAttribute("data-pinned"), "true");
    assert.equal(await panel.isVisible(), true);
    await page.keyboard.press("Escape");
    assert.equal(await panel.isVisible(), false);
    assert.equal(await trigger.evaluate((element) => document.activeElement === element), true);
    await page.keyboard.press("Enter");
    await assertPanel(page, panel, { width: 360, height: 320 });
    await page.keyboard.press("Tab");
    assert.equal(
      await panel.locator("button").evaluate((element) => document.activeElement === element),
      true,
    );
    await page.keyboard.press("Escape");
    await page.keyboard.press("Tab");
    assert.equal(await page.locator("[data-community-entity]").nth(1).getAttribute("open"), "");
    await page.locator(".community-train > summary").click();
    assert.equal(await page.locator("[data-community-entity][open]").count(), 0);
    await assertPanel(page, page.locator(".community-guide"));
    await screenshot(page, "train-guide");
    await page.locator('[data-home-journey-section-id="community-contact"]').click();
    await page.waitForFunction(
      () =>
        location.hash === "#community-contact" &&
        document
          .querySelector('[data-home-journey-section-id="community-contact"]')
          .getAttribute("aria-current") === "step",
    );
    assert.equal(await page.locator("[data-community-disclosure][open]").count(), 0);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

for (const scenario of [
  { locale: "zh-Hans", width: 390, height: 844 },
  { locale: "en", width: 320, height: 568 },
  { locale: "zh-Hant", width: 760, height: 390 },
]) {
  test(`${engine}: ${scenario.locale} ${scenario.width}×${scenario.height} 触屏一次点按展开，尺寸统一且无横向溢出`, async () => {
    const { page, errors } = await openPage(
      {
        viewport: { width: scenario.width, height: scenario.height },
        hasTouch: true,
        reducedMotion: "reduce",
      },
      scenario.locale,
    );
    try {
      await screenshot(page, `${scenario.locale}-${scenario.width}-landing`);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      const plots = page.locator("[data-community-entity]");
      let size;
      for (let index = 0; index < (await plots.count()); index++) {
        const plot = plots.nth(index);
        const trigger = plot.locator(":scope > summary");
        await trigger.scrollIntoViewIfNeeded();
        await trigger.locator(".community-plot__label").tap();
        size = await assertPanel(page, plot.locator("[data-community-panel]"), size);
        assert.equal(await plot.getAttribute("data-pinned"), "true");
        const panel = plot.locator("[data-community-panel]");
        assert.equal(
          await panel.evaluate((element) => element.scrollWidth <= element.clientWidth),
          true,
        );
        if (index === 0) await screenshot(page, `${scenario.locale}-${scenario.width}-expanded`);
        await panel.locator("[data-community-close]").tap();
        assert.equal(await panel.isVisible(), false);
      }
      await page.locator(".community-train > summary").tap();
      const guide = page.locator(".community-guide");
      await assertPanel(page, guide);
      assert.equal(
        await guide.evaluate((element) => element.scrollWidth <= element.clientWidth),
        true,
      );
      await screenshot(page, `${scenario.locale}-${scenario.width}-guide`);
      await guide.locator("[data-home-journey-close]").tap();
      assert.equal(await guide.isVisible(), false);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  });
}

test(`${engine}: 无脚本时原生 details 仍可展开，未确认伙伴没有假链接`, async () => {
  const { page, errors } = await openPage({ javaScriptEnabled: false });
  try {
    const plot = page.locator('[data-community-entity="server"]').first();
    await plot.locator(":scope > summary").click();
    assert.equal(await plot.locator("[data-community-panel]").isVisible(), true);
    assert.equal(await plot.locator("a").count(), 0);
    assert.equal(
      await page.locator('meta[name="robots"]').getAttribute("content"),
      "noindex, follow",
    );
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: L 形空缺不是点击热区，Header 注册社区且页尾保持反色`, async () => {
  for (const width of [1440, 390]) {
    const { page, errors } = await openPage({ viewport: { width, height: 900 } });
    try {
      const menu = page.locator(".mobile-header-tool--destination");
      if (width <= 760) await menu.locator(":scope > summary").click();
      const link =
        width > 760
          ? page.locator(".community-nav")
          : menu.locator('a[href="/zh-Hans/community/"]');
      assert.equal(await link.isVisible(), true);
      assert.equal(await link.getAttribute("aria-current"), "page");
      if (width > 760)
        assert.equal(await page.locator('.exit-menu a[href="/zh-Hans/community/"]').count(), 0);
      await page.keyboard.press("Escape");
      const map = page.locator("[data-community-map-block]").first();
      await map.evaluate((element) =>
        scrollTo({ top: element.getBoundingClientRect().top + scrollY - 130, behavior: "instant" }),
      );
      const hit = await map.evaluate((element, wide) => {
        const park = element
          .querySelector(`.community-map-base--${wide ? "desktop" : "mobile"} .community-map-park`)
          .getBoundingClientRect();
        const target = document.elementFromPoint(park.x + park.width / 2, park.y + park.height / 2);
        return target?.closest("[data-community-entity]")?.id ?? null;
      }, width > 760);
      assert.equal(hit, null, "L 形地块空缺中的公园不可触发玩家介绍");
      assert.match(
        await page
          .locator("[data-community-entity] > summary")
          .first()
          .evaluate((element) => getComputedStyle(element).clipPath),
        /^polygon\(/,
      );
      if (width > 760) assert.equal(await page.locator(".community-nav").isVisible(), true);
      await page.keyboard.press("Escape");
      for (const colorScheme of ["light", "dark"]) {
        await page.emulateMedia({ colorScheme });
        const colors = await page.locator(".community-contact").evaluate((element) => {
          const style = getComputedStyle(element);
          return [style.backgroundColor, style.color];
        });
        assert.deepEqual(colors, ["rgb(27, 32, 34)", "rgb(250, 251, 250)"]);
      }
      await page.locator(".community-train > summary").click();
      const guide = page.locator(".community-guide");
      assert.equal(await guide.locator("[data-home-journey-picker]").count(), 1);
      await guide.locator('[data-home-journey-section-id="community-contact"]').click();
      await page.waitForFunction(
        () =>
          document
            .querySelector('[data-home-journey-section-id="community-contact"]')
            .getAttribute("aria-current") === "step",
      );
      await screenshot(page, `footer-${width}`);
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  }
});

test(`${engine}: 整图按种子生成、两区不混排、缩放保持本次地图`, async () => {
  const { page, errors } = await openPage();
  try {
    const geometry = () =>
      page
        .locator(".community-map-base--desktop")
        .evaluateAll((svgs) => svgs.map((svg) => svg.innerHTML));
    await page.goto(`${baseUrl}/zh-Hans/community/?mapSeed=7`, { waitUntil: "networkidle" });
    const first = await geometry();
    assert.equal(
      await page
        .locator(
          '[data-community-zone="players"] [data-community-entity]:not([data-community-entity="player"])',
        )
        .count(),
      0,
    );
    assert.equal(
      await page
        .locator('[data-community-zone="connections"] [data-community-entity="player"]')
        .count(),
      0,
    );
    assert.equal(
      await page.locator('[data-community-zone="players"] [data-community-entity]').count(),
      5,
    );
    assert.equal(
      await page.locator('[data-community-zone="connections"] [data-community-entity]').count(),
      3,
    );
    await page.setViewportSize({ width: 390, height: 844 });
    assert.deepEqual(await geometry(), first);
    await page.reload({ waitUntil: "networkidle" });
    assert.deepEqual(await geometry(), first);
    await page.goto(`${baseUrl}/zh-Hans/community/?mapSeed=128`, { waitUntil: "networkidle" });
    assert.notDeepEqual(await geometry(), first);
    for (const kind of ["park", "school", "square", "culture"])
      assert.ok((await page.locator(`[data-landmark="${kind}"]`).count()) > 0);
    await screenshot(page, "generated-map-mobile", true);
    await page.setViewportSize({ width: 1440, height: 900 });
    await screenshot(page, "generated-map-desktop", true);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: 新增主导航牌在中间断点不挤出 Header`, async () => {
  const { page, errors } = await openPage({}, "en");
  try {
    for (const width of [761, 820, 1023, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const header = await page.locator(".site-header").boundingBox();
      const community = await page.locator(".community-nav").boundingBox();
      assert.ok(
        community.x >= header.x && community.x + community.width <= header.x + header.width,
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: PN 在浦蓝线上方交会，站点标记位于换乘交点`, async () => {
  const { default: sharp } = await import("sharp");
  const { page, errors } = await openPage({ reducedMotion: "reduce" });
  try {
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page
        .locator(".community-district__crossing")
        .evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
      const sample = await page.locator("#community-connections").evaluate((section) => {
        const root = section.closest("[data-community-page]");
        const rail = parseFloat(getComputedStyle(root, "::before").left);
        const crossing = section.querySelector(".community-district__crossing");
        const station = section.querySelector(".community-station");
        const a = crossing.getBoundingClientRect(),
          b = station.getBoundingClientRect();
        return {
          crossingY: a.y + a.height / 2,
          stationY: b.y + b.height / 2,
          stationX: b.x + b.width / 2,
          railX: rail + parseFloat(getComputedStyle(root, "::before").width) / 2,
          linePoint: [Math.floor(rail + 1), Math.floor(a.y + 1)],
          stationPoint: [Math.floor(b.x + b.width / 2), Math.floor(b.y + b.height / 2)],
          lineColor: getComputedStyle(crossing)
            .backgroundColor.match(/\d+/g)
            .slice(0, 3)
            .map(Number),
          stationColor: getComputedStyle(station, "::before")
            .backgroundColor.match(/\d+/g)
            .slice(0, 3)
            .map(Number),
        };
      });
      assert.ok(Math.abs(sample.crossingY - sample.stationY) < 1, "站点应落在换乘交点而不是标题旁");
      assert.ok(Math.abs(sample.railX - sample.stationX) < 1);
      const { data, info } = await sharp(await page.screenshot())
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      for (const [point, expected] of [
        [sample.linePoint, sample.lineColor],
        [sample.stationPoint, sample.stationColor],
      ]) {
        const offset = (point[1] * info.width + point[0]) * info.channels;
        assert.deepEqual(
          [...data.subarray(offset, offset + 3)],
          expected,
          "交点实际像素必须按蓝线→粉线→站点的顺序覆盖",
        );
      }
      await screenshot(page, `interchange-${width}`);
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: 真正卸载后迟到的复制结果不得写入已释放页面`, async () => {
  const { page, errors } = await openPage();
  try {
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: () =>
            new Promise((resolve) => {
              window.communityResolveCopy = resolve;
            }),
        },
      });
    });
    await page.locator("[data-community-copy]").click();
    await page.evaluate(() => {
      window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }));
      window.communityResolveCopy();
    });
    assert.equal(await page.locator("[data-community-copy-feedback]").textContent(), "");
    assert.equal(
      await page.locator("[data-community-page]").getAttribute("data-community-enhanced"),
      null,
    );
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: 河道两端在不同视口均流出画面，不能在屏内截止`, async () => {
  const { page, errors } = await openPage();
  try {
    for (const width of [320, 390, 760, 768, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      const mouths = await page
        .locator("[data-community-river-in],[data-community-river-out]")
        .evaluateAll((nodes) =>
          nodes.map((node) => {
            const matrix = node.getScreenCTM();
            return [...node.points].map(
              (point) => new DOMPoint(point.x, point.y).matrixTransform(matrix).x,
            );
          }),
        );
      assert.equal(mouths.length, 2);
      assert.ok(
        mouths[0].some((x) => x > width),
        `入水口应跨过屏幕右边缘: ${mouths[0]}`,
      );
      assert.ok(
        mouths[1].some((x) => x < 0),
        `出水口应跨过屏幕左边缘: ${mouths[1]}`,
      );
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: 小屏 DS 保留完整线宽、站点和标题间距`, async () => {
  const { page, errors } = await openPage({ reducedMotion: "reduce" });
  try {
    for (const width of [320, 390, 440, 760, 767]) {
      await page.setViewportSize({ width, height: 844 });
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      const geometry = await page.locator(".community-landing").evaluate((landing) => {
        const root = landing.closest("[data-community-page]");
        const track = landing.querySelector(".community-landing__tracks");
        const end = landing
          .querySelector(".community-landing__arrival-end")
          .getBoundingClientRect();
        const ws = landing.querySelector(".community-landing__station").getBoundingClientRect();
        const title = landing.querySelector("h1").getBoundingClientRect();
        const stroke = parseFloat(getComputedStyle(track).strokeWidth);
        return {
          stroke,
          railWidth: parseFloat(getComputedStyle(root, "::before").width),
          trackLeft: end.x + end.width / 2 - stroke / 2,
          trackRight: end.x + end.width / 2 + stroke / 2,
          titleLeft: title.left,
          stationDelta: Math.abs(end.y + end.height / 2 - ws.y - ws.height / 2),
        };
      });
      assert.ok(
        Math.abs(geometry.stroke - geometry.railWidth) < 1,
        `DS与浦蓝线应保持同一线宽: ${JSON.stringify(geometry)}`,
      );
      assert.ok(
        geometry.trackLeft >= 8 && geometry.trackRight <= geometry.titleLeft - 8,
        "DS 竖段不得贴边或压住标题",
      );
      assert.ok(geometry.stationDelta < 1, "两条线的到站标记应水平对齐");
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});
