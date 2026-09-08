import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

/* 复用现有外部浏览器依赖，以实际像素捕捉 DOM/SVG 在小数坐标处露出的接缝。 */
const { chromium, webkit } = await import(process.env.FETARUTE_PLAYWRIGHT_MODULE ?? "playwright");
const engine = process.env.FETARUTE_TEST_BROWSER ?? "chromium";
const browser = await (engine === "webkit" ? webkit : chromium).launch({
  headless: true,
  ...(engine === "chromium" ? { channel: "chrome" } : {}),
});
after(() => browser.close());
const baseUrl = process.env.FETARUTE_HOME_TEST_URL ?? "http://127.0.0.1:4323";
const screenshotDirectory = process.env.FETARUTE_SCREENSHOT_DIR;

/** 从截图中的线宽内部取样，避开正常外轮廓抗锯齿，只检查连接面有无透底像素。 */
async function seamPixels(page, points, expected, name) {
  const png = await page.screenshot();
  if (screenshotDirectory) {
    await mkdir(screenshotDirectory, { recursive: true });
    await page.screenshot({ path: `${screenshotDirectory}/${engine}-${name}.png` });
  }
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const scale = info.width / page.viewportSize().width;
  const mismatches = [];
  for (const [x, y] of points) {
    assert.ok(
      x >= 0 && y >= 0 && x * scale < info.width && y * scale < info.height,
      "接缝取样点必须位于截图内",
    );
    const offset = (Math.floor(y * scale) * info.width + Math.floor(x * scale)) * info.channels;
    const actual = [...data.subarray(offset, offset + 3)];
    if (actual.some((value, index) => Math.abs(value - expected[index]) > 2)) {
      mismatches.push({ x, y, actual, expected });
    }
  }
  return mismatches;
}

for (const deviceScaleFactor of [1, 2]) {
  test(`${engine} DPR ${deviceScaleFactor}: 两页 Tooltip 的横支线在小数像素处不露细缝`, async () => {
    const page = await browser.newPage({
      viewport: { width: 1281, height: 900 },
      deviceScaleFactor,
      colorScheme: "dark",
    });
    try {
      const failures = [];
      for (const community of [true, false]) {
        await page.goto(`${baseUrl}/zh-Hans/${community ? "community/" : "#shared-shore"}`, {
          waitUntil: "networkidle",
        });
        await page.evaluate(() => document.fonts.ready);
        if (!community) {
          await page.locator("[data-home-tri-server]").evaluate((element) => {
            scrollTo({
              top: element.getBoundingClientRect().top + scrollY + 200,
              behavior: "instant",
            });
          });
        }
        const train = page.locator(
          community ? "[data-community-train]" : "[data-home-arrival-train]",
        );
        await train.click();
        const panel = page.locator(".home-arrival__train-tooltip");
        await page.waitForTimeout(300);
        for (const fraction of [0, 0.25, 0.5, 0.75]) {
          await panel.evaluate((element, fraction) => {
            /* 覆盖滚动/缩放会产生的四种像素相位，不改变真实 Tooltip 的绘制层级。 */
            element.style.translate = `${300 + fraction}px ${150 + fraction}px`;
          }, fraction);
          const branches = await panel
            .locator(
              ".home-journey-quick-pick__stop:not(.home-journey-quick-pick__stop--transfer) a",
            )
            .evaluateAll((links) =>
              links.map((link) => {
                const anchor = link.getBoundingClientRect();
                const ol = link.closest("ol");
                const track = getComputedStyle(ol, "::before");
                const branch = getComputedStyle(link, "::before");
                return {
                  x:
                    ol.getBoundingClientRect().left +
                    parseFloat(track.left) +
                    parseFloat(track.width),
                  y: anchor.top + anchor.height / 2,
                  color: branch.backgroundColor.match(/\d+/g).slice(0, 3).map(Number),
                };
              }),
            );
          for (const [index, branch] of branches.entries()) {
            const points = [-1, -0.5, 0, 0.5, 1].flatMap((x) =>
              [-4, 0, 4].map((y) => [branch.x + x, branch.y + y]),
            );
            const mismatches = await seamPixels(
              page,
              points,
              branch.color,
              `${community ? "community" : "home"}-${deviceScaleFactor}-${fraction}-${index}`,
            );
            if (mismatches.length)
              failures.push({ community, fraction, index, pixels: mismatches.slice(0, 3) });
          }
        }
      }
      assert.deepEqual(failures, [], "主线与横支线的连接面应全为线路色");
    } finally {
      await page.close();
    }
  });

  test(`${engine} DPR ${deviceScaleFactor}: 同岸四处直轨与弯轨接点保持同色覆盖`, async () => {
    const page = await browser.newPage({
      viewport: { width: 1281, height: 900 },
      deviceScaleFactor,
      reducedMotion: "reduce",
      colorScheme: "dark",
    });
    try {
      await page.goto(`${baseUrl}/zh-Hans/#shared-shore`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const section = page.locator("#shared-shore");
      const stage = section.locator(".home-transfer-breaker__stage");
      const failures = [];
      for (const width of [1024, 1281, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        await section.evaluate((element) =>
          scrollTo({ top: element.getBoundingClientRect().top + scrollY, behavior: "instant" }),
        );
        for (const fraction of [0, 0.25, 0.5, 0.75]) {
          await stage.evaluate((element, fraction) => {
            element.style.translate = `${fraction}px ${fraction}px`;
          }, fraction);
          const joints = await stage.evaluate((element) => {
            const right = element.querySelector(".home-transfer-breaker__right-bend");
            const left = element.querySelector(".home-transfer-breaker__left-bend");
            const r = right.getBoundingClientRect();
            const l = left.getBoundingClientRect();
            const incoming = getComputedStyle(right).color.match(/\d+/g).slice(0, 3).map(Number);
            const outgoing = getComputedStyle(left).color.match(/\d+/g).slice(0, 3).map(Number);
            /* 按真实 SVG viewBox 的端点投影，覆盖水平和垂直两种连接方向。 */
            return [
              { x: r.right - (r.width * 31) / 249, y: r.top, horizontal: false, color: incoming },
              { x: r.left, y: r.bottom - (r.height * 31) / 250, horizontal: true, color: incoming },
              { x: l.right, y: l.top + (l.height * 31) / 250, horizontal: true, color: outgoing },
              { x: l.left + (l.width * 31) / 249, y: l.bottom, horizontal: false, color: outgoing },
            ];
          });
          for (const [index, joint] of joints.entries()) {
            const points = [-2, -1, -0.5, 0, 0.5, 1, 2].flatMap((along) =>
              [-6, 0, 6].map((across) => [
                joint.x + (joint.horizontal ? along : across),
                joint.y + (joint.horizontal ? across : along),
              ]),
            );
            const mismatches = await seamPixels(
              page,
              points,
              joint.color,
              `shared-shore-${deviceScaleFactor}-${width}-${fraction}-${index}`,
            );
            if (mismatches.length)
              failures.push({ width, fraction, index, pixels: mismatches.slice(0, 3) });
          }
        }
      }
      assert.deepEqual(failures, [], "同岸直轨与 SVG 接点不能露出画纸底色");
    } finally {
      await page.close();
    }
  });
}
