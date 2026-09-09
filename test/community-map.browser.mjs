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
async function openPage(options = {}, locale = "zh-Hans", mapSeed) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, ...options });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(
    `${baseUrl}/${locale}/community/${mapSeed === undefined ? "" : `?mapSeed=${mapSeed}`}`,
    { waitUntil: "networkidle" },
  );
  if (options.javaScriptEnabled !== false) {
    await page.waitForSelector('[data-community-enhanced="true"]');
  }
  await page.evaluate(() => document.fonts.ready);
  return { page, errors };
}

test(`${engine}: 社区到达线在运行时几何完成前不显示占位路径`, async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  let releaseMapRuntime;
  const mapRuntimeRequested = Promise.withResolvers();
  const mapRuntimeReleased = new Promise((resolve) => {
    releaseMapRuntime = resolve;
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  try {
    await page.route("**/src/lib/community/map-runtime.ts*", async (route) => {
      mapRuntimeRequested.resolve();
      await mapRuntimeReleased;
      await route.continue();
    });
    void page.goto(`${baseUrl}/zh-Hans/community/`, { waitUntil: "commit" });
    const path = page.locator("[data-community-arrival-path]");
    await path.waitFor({ state: "attached" });
    assert.equal(
      await Promise.race([
        mapRuntimeRequested.promise.then(() => true),
        page.waitForTimeout(3000).then(() => false),
      ]),
      true,
      "测试必须拦截到写入到达线几何的运行时模块",
    );
    const initial = await path.evaluate((element) => ({
      d: element.getAttribute("d"),
      visibility: getComputedStyle(element).visibility,
    }));
    assert.equal(initial.d, "M 3000 -2258 L 119 623 L 119 900");
    assert.equal(initial.visibility, "hidden", JSON.stringify(initial));
    releaseMapRuntime();
    await page.waitForSelector('[data-community-enhanced="true"]', { timeout: 5000 });
    const final = await path.evaluate((element) => ({
      d: element.getAttribute("d"),
      visibility: getComputedStyle(element).visibility,
    }));
    assert.notEqual(final.d, initial.d, JSON.stringify(final));
    assert.equal(final.visibility, "visible", JSON.stringify(final));
    assert.deepEqual(errors, []);
  } finally {
    releaseMapRuntime?.();
    await page.close();
  }
});

test(`${engine}: 社区列车随阅读进度换站、移动并把章节写回 hash`, async () => {
  const { page, errors } = await openPage();
  try {
    const trains = page.locator("[data-community-train]");
    assert.equal(await trains.count(), 3, "三条已绘制线路都应有可操作的列车");
    const routeTrain = page.locator('[data-community-train-line="route"]');
    const arrivalTrain = page.locator('[data-community-train-line="arrival"]');
    const connectionTrain = page.locator('[data-community-train-line="connection"]');
    const getArrivalPose = () =>
      page.locator(".community-landing").evaluate((landing) => {
        const path = landing.querySelector("[data-community-arrival-path]");
        const train = landing.querySelector(".community-train--arrival");
        const x = Number.parseFloat(train.style.getPropertyValue("--community-arrival-train-x"));
        const y = Number.parseFloat(train.style.getPropertyValue("--community-arrival-train-y"));
        const angle = Number.parseFloat(
          train.style.getPropertyValue("--community-arrival-train-angle"),
        );
        const length = path.getTotalLength();
        let nearestDistance = 0;
        let nearestDistanceSquared = Number.POSITIVE_INFINITY;
        for (let sample = 0; sample <= 4096; sample += 1) {
          const distance = (length * sample) / 4096;
          const point = path.getPointAtLength(distance);
          const distanceSquared = (point.x - x) ** 2 + (point.y - y) ** 2;
          if (distanceSquared < nearestDistanceSquared) {
            nearestDistance = distance;
            nearestDistanceSquared = distanceSquared;
          }
        }
        const span = Math.min(12, Math.max(1, length * 0.002));
        const before = path.getPointAtLength(Math.max(0, nearestDistance - span));
        const after = path.getPointAtLength(Math.min(length, nearestDistance + span));
        const tangentAngle =
          Math.atan2(after.y - before.y, after.x - before.x) * (180 / Math.PI) - 90;
        const angleDelta = ((angle - tangentAngle + 540) % 360) - 180;
        return { x, y, angle, tangentAngle, angleDelta, nearestDistanceSquared };
      });
    const arrivalBefore = await getArrivalPose();
    assert.ok(
      arrivalBefore.nearestDistanceSquared < 4,
      `DS 列车必须落在路径上: ${JSON.stringify(arrivalBefore)}`,
    );
    assert.ok(
      Math.abs(arrivalBefore.angleDelta) < 1,
      `DS 列车必须与路径切线同向: ${JSON.stringify(arrivalBefore)}`,
    );
    const routeTopBefore = (await routeTrain.boundingBox()).y;
    const connectionOffsetBefore = await connectionTrain.evaluate((train) =>
      train.parentElement.style.getPropertyValue("--community-connection-train-offset"),
    );
    await arrivalTrain.click();
    assert.equal(await arrivalTrain.getAttribute("aria-expanded"), "true");
    assert.equal(await page.locator(".community-guide").getAttribute("aria-hidden"), "false");
    const arrivalTooltipTranslate = await page
      .locator(".community-guide")
      .evaluate((panel) => getComputedStyle(panel).translate);
    await page
      .locator("#community-connections")
      .evaluate((element) => element.scrollIntoView({ behavior: "instant", block: "start" }));
    await page.waitForFunction(() => window.location.hash === "#community-connections");
    const routeTopAfter = (await routeTrain.boundingBox()).y;
    assert.notEqual(Math.round(routeTopAfter), Math.round(routeTopBefore));
    const arrivalAfter = await getArrivalPose();
    assert.notEqual(
      `${arrivalAfter.x},${arrivalAfter.y}`,
      `${arrivalBefore.x},${arrivalBefore.y}`,
      "DS 列车应随阅读进度沿路径旅行",
    );
    assert.ok(
      Math.abs(arrivalAfter.angleDelta) < 1,
      `DS 列车滚动后仍必须与路径切线同向: ${JSON.stringify(arrivalAfter)}`,
    );
    const connectionOffsetAfter = await connectionTrain.evaluate((train) =>
      train.parentElement.style.getPropertyValue("--community-connection-train-offset"),
    );
    assert.notEqual(connectionOffsetAfter, connectionOffsetBefore, "PN 列车应随阅读进度横向旅行");
    await connectionTrain.click();
    assert.equal(await connectionTrain.getAttribute("aria-expanded"), "true");
    assert.equal(await page.locator(".community-guide").getAttribute("aria-hidden"), "false");
    const connectionTooltipTranslate = await page
      .locator(".community-guide")
      .evaluate((panel) => getComputedStyle(panel).translate);
    assert.notEqual(
      connectionTooltipTranslate,
      arrivalTooltipTranslate,
      "切换到 PN 列车时 Tooltip 必须改用新的真实锚点",
    );
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: 社区正文与地图跟随系统和手动 palette，刷新后保持所选外观`, async () => {
  const { page, errors } = await openPage({ colorScheme: "dark" });
  try {
    const initialLines = await page.locator("[data-community-page]").evaluate((element) => {
      const style = getComputedStyle(element);
      return ["route", "arrival", "connection"].map((name) =>
        style.getPropertyValue(`--community-${name}`).trim(),
      );
    });
    const checkPalette = async () => {
      const result = await page.locator("[data-community-page]").evaluate((root) => {
        const probe = document.createElement("span");
        root.append(probe);
        const color = (token) => {
          probe.style.color = `var(${token})`;
          return getComputedStyle(probe).color;
        };
        const pairs = [
          ["正文底色", getComputedStyle(root).backgroundColor, color("--palette-canvas")],
          ["正文文字", getComputedStyle(root).color, color("--palette-text")],
          [
            "地块底色",
            getComputedStyle(root.querySelector(".community-plot > summary")).backgroundColor,
            color("--palette-journey-map"),
          ],
          [
            "资料浮层",
            getComputedStyle(root.querySelector(".community-panel")).backgroundColor,
            color("--palette-surface-raised"),
          ],
          [
            "章节文字衬底",
            getComputedStyle(root.querySelector(".community-district__heading h2")).backgroundColor,
            color("--palette-canvas"),
          ],
          [
            "页尾底色",
            getComputedStyle(root.querySelector(".community-contact")).backgroundColor,
            color("--palette-text"),
          ],
          [
            "页尾文字",
            getComputedStyle(root.querySelector(".community-contact")).color,
            color("--palette-surface"),
          ],
        ];
        for (const [selector, token] of [
          [".community-map-river", "river"],
          [".community-map-park", "park"],
          [".community-map-plaza", "square"],
        ]) {
          pairs.push([
            token,
            getComputedStyle(root.querySelector(selector)).fill,
            color(`--palette-map-${token}`),
          ]);
        }
        probe.remove();
        return {
          pairs,
          scheme: getComputedStyle(root).colorScheme,
          rootScheme: getComputedStyle(document.documentElement).colorScheme,
          lines: ["route", "arrival", "connection"].map((name) =>
            getComputedStyle(root).getPropertyValue(`--community-${name}`).trim(),
          ),
        };
      });
      for (const [label, actual, expected] of result.pairs) assert.equal(actual, expected, label);
      assert.equal(result.scheme, result.rootScheme, "社区不能把原生控件锁在浅色");
      assert.deepEqual(result.lines, initialLines, "外观变化不能改铁路线路身份色");
    };
    await checkPalette();
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const system of ["light", "dark"]) {
        await page.emulateMedia({ colorScheme: system });
        for (const choice of ["light", "dark", "system"]) {
          const menu = page.locator(
            width > 760
              ? ".service-desk"
              : ".mobile-header-tool--service:has([data-appearance-choice])",
          );
          await menu.locator(":scope > summary").click();
          await menu.locator(`[data-appearance-choice="${choice}"]`).click();
          await page.keyboard.press("Escape");
          /* 地块已有 150ms 背景过渡，核对过渡结束后的材料色。 */
          await page.waitForTimeout(180);
          await checkPalette();
          await page.reload({ waitUntil: "networkidle" });
          await checkPalette();
        }
      }
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: 无脚本首帧也继承系统深浅底色`, async () => {
  for (const colorScheme of ["light", "dark"]) {
    const { page, errors } = await openPage({ javaScriptEnabled: false, colorScheme });
    try {
      const colors = await page.evaluate(() => ({
        body: getComputedStyle(document.body).backgroundColor,
        community: getComputedStyle(document.querySelector("[data-community-page]"))
          .backgroundColor,
        bodyText: getComputedStyle(document.body).color,
        communityText: getComputedStyle(document.querySelector("[data-community-page]")).color,
      }));
      assert.equal(colors.community, colors.body);
      assert.equal(colors.communityText, colors.bodyText);
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  }
});

test(`${engine}: 列车预览与首页一致，滚动关闭预览但保留点击固定的导览`, async () => {
  const { page, errors } = await openPage();
  try {
    const train = page.locator('[data-community-train-line="route"]');
    await train.hover();
    await page.waitForTimeout(180);
    assert.equal(await train.getAttribute("aria-expanded"), "true");
    await page.evaluate(() => scrollTo({ top: 200, behavior: "instant" }));
    await page.waitForTimeout(200);
    assert.equal(await train.getAttribute("aria-expanded"), "false");
    await train.click();
    await page.evaluate(() => scrollTo({ top: 400, behavior: "instant" }));
    await page.waitForTimeout(200);
    assert.equal(await train.getAttribute("aria-expanded"), "true");
    await page.keyboard.press("Escape");
    assert.equal(await train.getAttribute("aria-expanded"), "false");
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: 列车导览沿用首页站牌节奏，中文站名不被固定窄宽度挤成两行`, async () => {
  const { page, errors } = await openPage();
  try {
    await page.locator('[data-community-train-line="route"]').click();
    const lines = await page.locator(".community-guide").evaluate((panel) =>
      [
        ...panel.querySelectorAll(
          "[data-home-journey-current-name], .home-journey-quick-pick__stop-label",
        ),
      ].map((label) => {
        const range = document.createRange();
        range.selectNodeContents(label);
        return { text: label.textContent, lines: range.getClientRects().length };
      }),
    );
    assert.ok(
      lines.every((label) => label.lines === 1),
      JSON.stringify(lines),
    );
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: 社区列车以偏色回应交互，浦蓝线贯穿两个换乘站`, async () => {
  const { page, errors } = await openPage();
  try {
    const train = page.locator('[data-community-train-line="route"]');
    const restingColor = await train.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await train.hover();
    await page.waitForTimeout(250);
    const hovered = await train.evaluate((element) => {
      const style = getComputedStyle(element);
      return { color: style.backgroundColor, outline: style.outlineStyle };
    });
    assert.notEqual(hovered.color, restingColor, "鼠标预览必须改变车身颜色");
    assert.equal(hovered.outline, "none", "普通 hover 不给车身加矩形框");
    const stops = await page.locator("[data-home-journey-stop]").evaluateAll((elements) =>
      elements.map((element) => ({
        id: element.dataset.homeJourneyStop,
        color: element.dataset.homeJourneyLineColor,
        transfer: Boolean(element.querySelector("[data-home-journey-transfer]")),
      })),
    );
    assert.equal(new Set(stops.map((stop) => stop.color)).size, 1, "换乘站不能改变本页主线");
    assert.deepEqual(
      stops.filter((stop) => stop.transfer).map((stop) => stop.id),
      ["community-center", "community-connections"],
    );
    await train.click();
    await page.mouse.move(1000, 850);
    assert.equal(await train.getAttribute("aria-expanded"), "true");
    assert.notEqual(
      await train.evaluate((element) => getComputedStyle(element).backgroundColor),
      restingColor,
    );
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: 社区 Footer 复用首页高度与签名节奏，窄屏内容完整`, async () => {
  const { page, errors } = await openPage();
  try {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const sizes = [];
      for (const path of ["/zh-Hans/", "/zh-Hans/community/"]) {
        await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        const footer = page.locator("footer").last();
        sizes.push(
          await footer.evaluate((element) => {
            const style = getComputedStyle(element);
            return { height: element.getBoundingClientRect().height, minimum: style.minHeight };
          }),
        );
        assert.equal(await footer.locator(".home-footer__signature").count(), 1);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      }
      assert.equal(sizes[1].minimum, sizes[0].minimum);
      assert.equal(sizes[1].height, sizes[0].height);
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

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
    assert.equal(await panel.getAttribute("aria-hidden"), "false");
    assert.equal(await panel.evaluate((element) => element.inert), false);
    const content = await panel.locator("[data-home-journey-picker]").boundingBox();
    assert.ok(
      Math.abs(box.height - content.height - 4) < 2,
      "列车外框应贴合内容，不能被 Popover 的默认 inset 撑满视口",
    );
  }
  assert.equal(
    await page.locator("[data-community-disclosure][open]").count(),
    (await panel.getAttribute("id")) === "community-train-panel" ? 0 : 1,
  );
  return { width: box.width, height: box.height };
}

test(`${engine}: 共用地图保留不同地块，所有 hover 面板同尺寸且展开不改变布局`, async () => {
  const { page, errors } = await openPage();
  try {
    await screenshot(page, "landing");
    const plots = page.locator("[data-community-entity]:not([hidden])");
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
      [15, 2560, 1440],
      [15, 3840, 2160],
      [15, 5120, 2880],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto(`${baseUrl}/zh-Hans/community/?mapSeed=${seed}`, {
        waitUntil: "networkidle",
      });
      const clipped = await page
        .locator("[data-community-entity]:not([hidden]) > summary")
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
    assert.equal(await page.locator("[data-community-mosaic-player]").count(), 17);
    assert.equal(
      await page.locator('[data-community-zone="players"] [data-community-map-block]').count(),
      1,
    );
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
  /* 种子5的下一地块外框可见但姓名在屏外，防止只在偶然布局中通过键盘回归。 */
  const { page, errors } = await openPage({}, "zh-Hans", 5);
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
    assert.ok(
      await page
        .locator("[data-community-entity]")
        .nth(1)
        .locator(".community-plot__label")
        .evaluate((label) => {
          const bounds = label.getBoundingClientRect();
          const header = document.querySelector(".site-header").getBoundingClientRect();
          return bounds.top >= header.bottom && bounds.bottom <= innerHeight;
        }),
      "键盘聚焦必须把姓名标注带入Header下方的可见区",
    );
    await page.locator('[data-community-train-line="route"]').click();
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
      /* 单街区只抽取四位玩家；隐藏的候选资料不参与可见几何或触屏交互断言。 */
      const plots = page.locator("[data-community-entity]:not([hidden])");
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
      await page.locator('[data-community-train-line="route"]').tap();
      const guide = page.locator(".community-guide");
      await assertPanel(page, guide);
      assert.equal(
        await guide.evaluate((element) => element.scrollWidth <= element.clientWidth),
        true,
      );
      await screenshot(page, `${scenario.locale}-${scenario.width}-guide`);
      await guide.locator("[data-home-journey-close]").tap();
      assert.equal(await guide.getAttribute("aria-hidden"), "true");
      assert.equal(await guide.evaluate((element) => element.inert), true);
      await page.waitForFunction(
        () => getComputedStyle(document.querySelector(".community-guide")).opacity === "0",
      );
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

test(`${engine}: L 形空缺不是点击热区，Header 注册社区且导览抵达页尾`, async () => {
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
          .locator("[data-community-entity]:not([hidden]) > summary")
          .first()
          .evaluate((element) => getComputedStyle(element).clipPath),
        /^polygon\(/,
      );
      if (width > 760) assert.equal(await page.locator(".community-nav").isVisible(), true);
      await page.keyboard.press("Escape");
      await page.locator('[data-community-train-line="route"]').click();
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
      17,
    );
    assert.equal(
      await page.locator('[data-community-zone="connections"] [data-community-entity]').count(),
      4,
    );
    assert.equal(
      await page
        .locator('[data-community-zone="players"] [data-community-entity]:not([hidden])')
        .count(),
      4,
      "完整资料保留在 DOM，玩家街区只显示四位并为空间设施留地",
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

test(`${engine}: PN 覆盖浦蓝线，两枚站点上下对齐并分属两线`, async () => {
  const { default: sharp } = await import("sharp");
  const { page, errors } = await openPage({ reducedMotion: "reduce" });
  try {
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.locator(".community-district__crossing").evaluate((element) => {
        /* 把站点放到列车下方再采样，避免把途经圆标的固定列车误判为站点底色。 */
        const box = element.getBoundingClientRect();
        scrollTo({
          top: scrollY + box.y + box.height / 2 - innerHeight * 0.72,
          behavior: "instant",
        });
      });
      assert.equal(await page.locator("#community-connections .community-station").count(), 2);
      const sample = await page.locator("#community-connections").evaluate((section) => {
        const root = section.closest("[data-community-page]");
        const rail = parseFloat(getComputedStyle(root, "::before").left);
        const crossing = section.querySelector(".community-district__crossing");
        const station = crossing.querySelector(
          ".community-station:not(.community-station--approach)",
        );
        const approach = crossing.querySelector(".community-station--approach");
        const a = crossing.getBoundingClientRect(),
          b = station.getBoundingClientRect(),
          c = approach.getBoundingClientRect();
        return {
          crossingY: a.y + a.height / 2,
          stationY: b.y + b.height / 2,
          stationX: b.x + b.width / 2,
          approachY: c.y + c.height / 2,
          approachX: c.x + c.width / 2,
          railWidth: a.height,
          railX: rail + parseFloat(getComputedStyle(root, "::before").width) / 2,
          linePoint: [Math.floor(rail + 1), Math.floor(a.y + 1)],
          stationPoint: [Math.floor(b.x + b.width / 2), Math.floor(b.y + b.height / 2)],
          approachPoint: [Math.floor(c.x + c.width / 2), Math.floor(c.y + c.height / 2)],
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
      assert.ok(Math.abs(sample.railX - sample.approachX) < 1, "上方站点也应对准蓝线中心");
      assert.ok(
        Math.abs(sample.stationY - sample.approachY - sample.railWidth) < 1,
        "两枚圆标相距一个线宽：上方留在蓝线，下方落在粉线交点",
      );
      const { data, info } = await sharp(await page.screenshot())
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      for (const [point, expected] of [
        [sample.linePoint, sample.lineColor],
        [sample.stationPoint, sample.stationColor],
        [sample.approachPoint, sample.stationColor],
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

test(`${engine}: 窄屏英文 Footer 保留复制结果与手动选择群号的空间`, async () => {
  const { page, errors } = await openPage({ viewport: { width: 320, height: 568 } }, "en");
  try {
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            if (window.communityCopyShouldFail) throw new Error("Clipboard unavailable");
            window.communityCopiedText = text;
          },
        },
      });
    });
    const copy = page.locator("[data-community-copy]");
    const feedback = page.locator("[data-community-copy-feedback]");
    await copy.click();
    assert.equal(
      await page.evaluate(() => window.communityCopiedText),
      await copy.getAttribute("data-community-copy"),
    );
    assert.equal(await feedback.textContent(), await copy.getAttribute("data-copied-label"));
    await page.evaluate(() => {
      window.communityCopyShouldFail = true;
    });
    await copy.click();
    assert.equal(await feedback.textContent(), await copy.getAttribute("data-copy-failed-label"));
    const message = await feedback.boundingBox();
    const signature = await page.locator(".home-footer__signature").boundingBox();
    assert.ok(message.y + message.height <= signature.y, "两行失败提示不能盖住品牌签名");
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.equal(
      await page.locator(".community-contact__number span").evaluate((element) => {
        const style = getComputedStyle(element);
        return style.userSelect ?? style.webkitUserSelect;
      }),
      "all",
    );
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

test(`${engine}: 穿城河口在缩放后连续衔接，河道两端仍流出画面`, async () => {
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
      const seams = await page.locator("[data-community-atlas]").evaluate((atlas) => {
        const screenPoints = (node) =>
          [...node.points].map((point) =>
            new DOMPoint(point.x, point.y).matrixTransform(node.getScreenCTM()),
          );
        const rivers = [...atlas.querySelectorAll(".community-map-river")]
          .filter((node) => node.getBoundingClientRect().width > 0)
          .map(screenPoints);
        const inlet = screenPoints(atlas.querySelector("[data-community-river-in]"));
        const outlet = screenPoints(atlas.querySelector("[data-community-river-out]"));
        const distance = (point, options) =>
          Math.min(...options.map((other) => Math.hypot(point.x - other.x, point.y - other.y)));
        const first = rivers[0],
          last = rivers.at(-1);
        const links = atlas.querySelector("[data-community-river-links]");
        const linkSamples = [];
        if (links) {
          const matrix = links.getScreenCTM();
          const length = links.getTotalLength();
          for (let offset = 0; offset <= length; offset += 0.5)
            linkSamples.push(links.getPointAtLength(offset).matrixTransform(matrix));
        }
        return {
          distances: [
            distance(first[0], inlet),
            distance(first.at(-1), inlet),
            distance(last[1], outlet),
            distance(last[2], outlet),
            ...rivers
              .slice(1)
              .flatMap((river, index) =>
                [rivers[index][1], rivers[index][2], river[0], river[3]].map((point) =>
                  distance(point, linkSamples),
                ),
              ),
          ],
          links: links?.getAttribute("d"),
        };
      });
      assert.ok(
        seams.distances.every((distance) => distance < 1),
        `河口不得再连接旧的地图右边缘: ${JSON.stringify(seams)}`,
      );
      assert.ok(seams.links?.includes("Z"), "章节之间需要连接真实上下河口");
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: 正文增高后河口重新对齐，卸载后不再更新连接`, async () => {
  const { page, errors } = await openPage({ reducedMotion: "reduce" });
  try {
    const geometry = await page
      .locator(".community-map-river")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("points")));
    const before = await page.locator("[data-community-river-in]").getAttribute("points");
    await page.locator(".community-district__hint").evaluate((hint) => {
      hint.style.maxWidth = "180px";
      hint.textContent = hint.textContent.repeat(3);
    });
    await page.waitForFunction(
      (previous) =>
        document.querySelector("[data-community-river-in]").getAttribute("points") !== previous,
      before,
    );
    const distance = await page.evaluate(() => {
      const inlet = document.querySelector("[data-community-river-in]");
      const river = [...document.querySelectorAll(".community-map-river")].find(
        (node) => node.getBoundingClientRect().width > 0,
      );
      const start = new DOMPoint(river.points[0].x, river.points[0].y).matrixTransform(
        river.getScreenCTM(),
      );
      return Math.min(
        ...[...inlet.points].map((point) => {
          const end = new DOMPoint(point.x, point.y).matrixTransform(inlet.getScreenCTM());
          return Math.hypot(start.x - end.x, start.y - end.y);
        }),
      );
    });
    assert.ok(distance < 1, "正文重排后必须仍连接地图入口");
    assert.deepEqual(
      await page
        .locator(".community-map-river")
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("points"))),
      geometry,
      "正文重排不能洗牌地图",
    );
    const settled = await page.locator("[data-community-river-in]").getAttribute("points");
    await page.evaluate(() => {
      dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }));
      document.querySelector(".community-district__hint").style.maxWidth = "300px";
    });
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    assert.equal(await page.locator("[data-community-river-in]").getAttribute("points"), settled);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: DS 提前转入竖轨，完整线宽避开头像墙`, async () => {
  const { page, errors } = await openPage({ reducedMotion: "reduce" });
  try {
    for (const [width, height] of [
      [320, 568],
      [390, 844],
      [440, 956],
      [760, 390],
      [767, 1200],
      [768, 1200],
      [1024, 768],
      [1440, 900],
      [1920, 1080],
    ]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      const clearance = await page.locator(".community-landing").evaluate((landing) => {
        const wall = landing.querySelector(".community-mosaic").getBoundingClientRect();
        const path = landing.querySelector("[data-community-arrival-path]");
        const matrix = path.getScreenCTM();
        const halfStroke = parseFloat(getComputedStyle(path).strokeWidth) / 2;
        const length = path.getTotalLength();
        let nearest = Infinity;
        /* 沿实际SVG路径检查到整面头像墙的距离，包含空格占位；不能只靠遮住交叉部分过关。 */
        for (let distance = 0; distance <= length; distance += 2) {
          const point = path.getPointAtLength(distance).matrixTransform(matrix);
          nearest = Math.min(
            nearest,
            Math.hypot(
              Math.max(wall.left - point.x, 0, point.x - wall.right),
              Math.max(wall.top - point.y, 0, point.y - wall.bottom),
            ),
          );
        }
        return nearest - halfStroke;
      });
      assert.ok(clearance >= 12, `${width}×${height}: 橙线需与头像墙保持间距，实际 ${clearance}px`);
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: 进站双线保持紧邻换乘，超宽屏也不拉开站距`, async () => {
  const { page, errors } = await openPage({ reducedMotion: "reduce" });
  try {
    for (const width of [320, 390, 767, 768, 1024, 1440, 1920, 2560, 3840]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      const geometry = await page.locator(".community-landing").evaluate((landing) => {
        const ds = landing.querySelector(".community-landing__arrival-end").getBoundingClientRect();
        const ws = landing.querySelector(".community-landing__station").getBoundingClientRect();
        const path = landing.querySelector("[data-community-arrival-path]");
        const lineWidth = parseFloat(getComputedStyle(path).strokeWidth);
        return {
          gap: Math.abs(ds.left + ds.width / 2 - ws.left - ws.width / 2) - lineWidth,
          heightDelta: Math.abs(ds.top + ds.height / 2 - ws.top - ws.height / 2),
          lineWidth,
        };
      });
      assert.ok(
        geometry.gap >= 3.8 && geometry.gap <= 8.2,
        `${width}px: 换乘双线的边缘间距应为4–8px，不随超宽视口持续增大: ${JSON.stringify(geometry)}`,
      );
      assert.ok(geometry.heightDelta < 1, "换乘双圆仍须水平对齐");
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

test(`${engine}: 0% 首屏完整呈现社区中心与英文副标题`, async () => {
  const errors = [];
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1512, 863],
    [1920, 1080],
  ]) {
    /* svh 的小视口基准需在导航前确定；复用已打开页面会把首个尺寸错误带入后续断点。 */
    const { page, errors: pageErrors } = await openPage({
      reducedMotion: "reduce",
      viewport: { width, height },
    });
    try {
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() =>
              requestAnimationFrame(() => {
                scrollTo({ top: 0, behavior: "instant" });
                resolve(undefined);
              }),
            ),
          ),
      );
      const geometry = await page.locator(".community-landing").evaluate((landing) => {
        const heading = landing.querySelector("h1");
        const title = heading.querySelector("span:first-child").getBoundingClientRect();
        const subtitle = landing
          .querySelector(".community-landing__english")
          .getBoundingClientRect();
        const header = document.querySelector(".site-header").getBoundingClientRect();
        return {
          scrollY,
          viewportWidth: innerWidth,
          viewportHeight: innerHeight,
          headerBottom: header.bottom,
          landingTop: landing.getBoundingClientRect().top,
          title: { left: title.left, top: title.top, right: title.right, bottom: title.bottom },
          subtitle: {
            left: subtitle.left,
            top: subtitle.top,
            right: subtitle.right,
            bottom: subtitle.bottom,
          },
        };
      });
      assert.equal(geometry.scrollY, 0, `${width}×${height}: 必须在 0% 滑行位置断言首屏`);
      assert.ok(
        Math.abs(geometry.landingTop) < 1,
        `${width}×${height}: Landing 不得被列车容器推离首屏起点: ${JSON.stringify(geometry)}`,
      );
      for (const [label, bounds] of Object.entries({
        communityTitle: geometry.title,
        englishSubtitle: geometry.subtitle,
      })) {
        assert.ok(
          bounds.left >= 0 && bounds.right <= geometry.viewportWidth,
          `${width}×${height}: ${label} 不能横向裁切: ${JSON.stringify(geometry)}`,
        );
        assert.ok(
          bounds.top >= geometry.headerBottom && bounds.bottom <= geometry.viewportHeight,
          `${width}×${height}: ${label} 必须完整留在 Header 下方的首屏: ${JSON.stringify(geometry)}`,
        );
      }
      errors.push(...pageErrors);
    } finally {
      await page.close();
    }
  }
  assert.deepEqual(errors, []);
});

test(`${engine}: 首屏玩家墙始终避开固定 Header`, async () => {
  const errors = [];
  for (const [width, height] of [
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1512, 863],
    [1920, 1080],
    [390, 844],
    [320, 568],
    [568, 320],
  ]) {
    const { page, errors: pageErrors } = await openPage({
      reducedMotion: "reduce",
      viewport: { width, height },
    });
    try {
      const geometry = await page.locator(".community-landing").evaluate((landing) => {
        const header = document.querySelector(".site-header").getBoundingClientRect();
        const mosaic = landing.querySelector(".community-mosaic").getBoundingClientRect();
        return {
          headerBottom: header.bottom,
          mosaicTop: mosaic.top,
        };
      });
      assert.ok(
        geometry.mosaicTop >= geometry.headerBottom + 8,
        `${width}×${height}: 玩家墙必须给固定 Header 留出 8px 以上空间: ${JSON.stringify(geometry)}`,
      );
      errors.push(...pageErrors);
    } finally {
      await page.close();
    }
  }
  assert.deepEqual(errors, []);
});

test(`${engine}: 社区列车滚动帧只在统一读取后写入状态`, async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.addInitScript(() => {
      const nativeRequestAnimationFrame = requestAnimationFrame.bind(window);
      const mutations = new MutationObserver(() => {});
      mutations.observe(document, {
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class", "aria-current"],
      });
      let inFrame = false;
      let wroteCommunityState = false;
      window.communityTrainFrameReadProbe = {
        enabled: false,
        reads: 0,
        writes: 0,
        readsAfterWrite: {},
      };
      const consumeCommunityWrites = () => {
        const writes = mutations
          .takeRecords()
          .filter(
            ({ target }) =>
              target instanceof Element && Boolean(target.closest("[data-community-page]")),
          ).length;
        window.communityTrainFrameReadProbe.writes += writes;
        wroteCommunityState ||= writes > 0;
      };
      const recordLayoutRead = (name) => {
        if (!inFrame || !window.communityTrainFrameReadProbe.enabled) return;
        window.communityTrainFrameReadProbe.reads += 1;
        consumeCommunityWrites();
        if (wroteCommunityState)
          window.communityTrainFrameReadProbe.readsAfterWrite[name] =
            (window.communityTrainFrameReadProbe.readsAfterWrite[name] ?? 0) + 1;
      };
      const nativeGetBoundingClientRect = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = function (...args) {
        recordLayoutRead("getBoundingClientRect");
        return nativeGetBoundingClientRect.apply(this, args);
      };
      for (const property of ["scrollY", "innerHeight"]) {
        const descriptor = Object.getOwnPropertyDescriptor(window, property);
        if (!descriptor?.get) continue;
        Object.defineProperty(window, property, {
          ...descriptor,
          get() {
            recordLayoutRead(property);
            return descriptor.get.call(window);
          },
        });
      }
      window.requestAnimationFrame = (callback) =>
        nativeRequestAnimationFrame((timestamp) => {
          mutations.takeRecords();
          wroteCommunityState = false;
          inFrame = true;
          try {
            callback(timestamp);
          } finally {
            if (window.communityTrainFrameReadProbe.enabled) consumeCommunityWrites();
            inFrame = false;
          }
        });
    });
    await page.goto(`${baseUrl}/zh-Hans/community/`, { waitUntil: "networkidle" });
    await page.waitForSelector('[data-community-enhanced="true"]');
    await page.evaluate(() => document.fonts.ready);
    const start = await page.locator("#community-district").evaluate((element) => {
      const top = element.getBoundingClientRect().top + scrollY - 160;
      scrollTo({ top, behavior: "instant" });
      return top;
    });
    await page.evaluate(async (top) => {
      window.communityTrainFrameReadProbe.enabled = true;
      for (let frame = 0; frame < 24; frame += 1) {
        await new Promise(requestAnimationFrame);
        scrollTo({ top: top + frame * 12, behavior: "instant" });
      }
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      window.communityTrainFrameReadProbe.enabled = false;
    }, start);
    const probe = await page.evaluate(() => window.communityTrainFrameReadProbe);
    assert.deepEqual(errors, []);
    assert.ok(probe.reads > 0 && probe.writes > 0, `列车帧必须实际读写: ${JSON.stringify(probe)}`);
    assert.deepEqual(probe.readsAfterWrite, {}, JSON.stringify(probe));
  } finally {
    await page.close();
  }
});

test(`${engine}: 首屏头像每次加载洗牌，灰色邀请格保留在棋盘边缘`, async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    const orders = [];
    await page.addInitScript(() => {
      const value = Number(new URL(location.href).searchParams.get("mosaicTestRandom"));
      Math.random = () => value;
    });
    for (const random of [0.1, 0.8]) {
      await page.goto(`${baseUrl}/zh-Hans/community/?mosaicTestRandom=${random}`, {
        waitUntil: "networkidle",
      });
      const wall = page.locator(".community-mosaic");
      const order = await wall
        .locator("[data-community-mosaic-cell] img")
        .evaluateAll((images) => images.map((image) => image.getAttribute("src")));
      assert.equal(order.length, 17);
      assert.equal(new Set(order).size, 17);
      orders.push(order);
      assert.equal(await wall.locator("[data-community-mosaic-invitation]").count(), 6);
      const cells = await wall
        .locator("[data-community-mosaic-cell]")
        .evaluateAll((elements) =>
          elements.map((element) => [element.style.gridColumn, element.style.gridRow]),
        );
      assert.equal(new Set(cells.map((cell) => cell.join(","))).size, 23);
      await page.setViewportSize({ width: 390, height: 844 });
      assert.deepEqual(
        await wall
          .locator("[data-community-mosaic-cell] img")
          .evaluateAll((images) => images.map((image) => image.getAttribute("src"))),
        order,
        "调整窗口不能重新排列头像",
      );
    }
    assert.notDeepEqual(orders[0], orders[1], "新的页面访问必须消费随机源重新排列头像");
    assert.deepEqual([...orders[0]].sort(), [...orders[1]].sort());
  } finally {
    await page.close();
  }
});

test(`${engine}: 章节焦点不框住整屏，键盘仍能辨认玩家墙链接`, async () => {
  const { page, errors } = await openPage();
  try {
    const landing = page.locator("#community-center");
    await landing.focus();
    assert.equal(
      await landing.evaluate((element) => getComputedStyle(element).outlineStyle),
      "none",
    );
    await page.keyboard.press("Tab");
    const wall = page.locator(".community-mosaic");
    await wall.focus();
    assert.notEqual(
      await wall.evaluate((element) => getComputedStyle(element).outlineStyle),
      "none",
    );
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => location.hash === "#community-district");
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: 社区玩家与服务器标注随大屏继续放大`, async () => {
  const { page, errors } = await openPage({ reducedMotion: "reduce" }, "zh-Hans", 15);
  try {
    const sizes = [];
    for (const width of [1440, 2560, 3840]) {
      await page.setViewportSize({ width, height: Math.round((width * 9) / 16) });
      sizes.push(
        await page
          .locator(".community-plot__name")
          .first()
          .evaluate((element) => ({
            font: parseFloat(getComputedStyle(element).fontSize),
            portrait: element.parentElement
              .querySelector(".community-plot__portrait")
              .getBoundingClientRect().width,
          })),
      );
    }
    assert.ok(sizes[1].font >= 24 && sizes[2].font > sizes[1].font, JSON.stringify(sizes));
    assert.ok(
      sizes[1].portrait > sizes[0].portrait && sizes[2].portrait > sizes[1].portrait,
      JSON.stringify(sizes),
    );
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: SVG 地标选中文字使用选区前景，深浅线路背景都可读`, async () => {
  const { page, errors } = await openPage({ reducedMotion: "reduce" }, "zh-Hans", 15);
  try {
    const text = page
      .locator(".community-map-base--desktop [data-community-landmark] text")
      .filter({ hasText: "公园" })
      .first();
    await text.scrollIntoViewIfNeeded();
    await text.evaluate((element) => {
      const selection = getSelection();
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    });
    await page.waitForTimeout(50);
    for (const [background, foreground] of [
      ["#160f91", "#ffffff"],
      ["#ffe033", "#202626"],
    ]) {
      const styles = await text.evaluate(
        (element, { background, foreground }) => {
          document.documentElement.style.setProperty("--color-selection", background);
          document.documentElement.style.setProperty("--color-selection-text", foreground);
          const selected = getComputedStyle(element, "::selection");
          return { fill: selected.fill, color: selected.color, text: getSelection().toString() };
        },
        { background, foreground },
      );
      assert.ok(styles.text.length > 0);
      assert.equal(styles.fill, styles.color, JSON.stringify(styles));
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test(`${engine}: 首页渐变文字在选区内重新填充前景色`, async () => {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  try {
    await page.goto(`${baseUrl}/zh-Hans/#beginning-bay`, { waitUntil: "networkidle" });
    for (const selector of [".hero-title__base", ".hero-description"]) {
      const text = page.locator(selector);
      await text.evaluate((element) => {
        const selection = getSelection();
        const range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
      });
      await page.waitForTimeout(50);
      for (const foreground of ["#ffffff", "#202626"]) {
        const selected = await text.evaluate((element, color) => {
          document.documentElement.style.setProperty("--color-selection-text", color);
          const style = getComputedStyle(element, "::selection");
          return {
            color: style.color,
            fill: style.webkitTextFillColor,
            text: getSelection().toString(),
          };
        }, foreground);
        assert.ok(selected.text.length > 0);
        assert.equal(selected.fill, selected.color, JSON.stringify(selected));
      }
    }
  } finally {
    await page.close();
  }
});
