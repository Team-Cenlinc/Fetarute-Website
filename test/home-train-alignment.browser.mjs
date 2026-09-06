import assert from "node:assert/strict";
import { after, test } from "node:test";

/* 复用本机 Playwright；这项 DOM 几何回归不进入静态检查，也不为官网增加浏览器运行时依赖。 */
const { chromium, webkit } = await import(process.env.FETARUTE_PLAYWRIGHT_MODULE ?? "playwright");
const engine = process.env.FETARUTE_TEST_BROWSER ?? "chromium";
assert.ok(["chromium", "webkit"].includes(engine), "浏览器必须为 chromium 或 webkit");
const browser = await (engine === "webkit" ? webkit : chromium).launch({
  headless: true,
  ...(engine === "chromium" ? { channel: "chrome" } : {}),
});
after(() => browser.close());
const baseUrl = process.env.FETARUTE_HOME_TEST_URL ?? "http://127.0.0.1:4323";

/* 弯轨触发最小尺寸与按 vw 缩放时都要锁住横轨中心，避免往返滚动出现垂直漂移。 */
for (const width of [440, 1024, 1440]) {
  for (const sectionKind of width < 1024 ? ["启示湾"] : ["启示湾", "三服汇", "同岸", "续行"]) {
    test(`${engine} ${width}px ${sectionKind}: 横向行驶保持同一高度`, async () => {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      try {
        await page.goto(`${baseUrl}/zh-Hans/#onward`, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        if (sectionKind === "三服汇") {
          /* 冷深链会跳过 Gallery；先完成增强高度与路线帧，再采样后方横轨的文档坐标。 */
          await page.locator("[data-home-gallery]").scrollIntoViewIfNeeded();
          await page.waitForFunction(
            () =>
              document.querySelector("[data-home-gallery]").dataset.homeGalleryEnhanced === "true",
          );
          await page.evaluate(
            () =>
              new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
          );
        }
        const samples = await page.evaluate(async (kind) => {
          const section =
            kind === "启示湾"
              ? document.querySelector("[data-home-arrival-route]")
              : kind === "三服汇"
                ? document.querySelector("[data-home-section-breaker-route]")
                : kind === "同岸"
                  ? document.querySelector("[data-home-transfer-breaker]")
                  : document.querySelector('[data-home-transfer-composition="open"]');
          const globalVisual = document.querySelector("[data-home-arrival-train-visual]");
          const globalHit = document.querySelector("[data-home-arrival-train]");
          const tracks =
            kind === "启示湾"
              ? [
                  {
                    rail: section.querySelector("[data-home-arrival-horizontal]"),
                    visual: globalVisual,
                    hit: globalHit,
                    segment: "horizontal",
                  },
                ]
              : kind === "三服汇"
                ? [
                    {
                      rail: section.querySelector("[data-home-section-breaker-horizontal-track]"),
                      visual: globalVisual,
                      hit: globalHit,
                      segment: "breaker-horizontal",
                    },
                  ]
                : kind === "同岸"
                  ? [
                      {
                        rail: section.querySelector(
                          "[data-home-transfer-incoming-horizontal-track]",
                        ),
                        visual: globalVisual,
                        hit: globalHit,
                        segment: "transfer-incoming-platform",
                      },
                      {
                        rail: section.querySelector(
                          "[data-home-transfer-outgoing-horizontal-track]",
                        ),
                        visual: globalVisual,
                        hit: globalHit,
                        segment: "transfer-outgoing-horizontal",
                      },
                    ]
                  : [
                      {
                        rail: section.querySelector(
                          "[data-home-transfer-outgoing-horizontal-track]",
                        ),
                        visual: section.querySelector("[data-home-transfer-incoming-train]"),
                        hit: section.querySelector("[data-home-transfer-incoming-train]"),
                        segment: "onward-incoming-horizontal",
                      },
                      {
                        rail: section.querySelector(
                          "[data-home-transfer-incoming-horizontal-track]",
                        ),
                        visual: globalVisual,
                        hit: section.querySelector("[data-home-transfer-outgoing-train]"),
                        segment: "onward-outgoing-horizontal",
                      },
                    ];
          const sectionBounds = section.getBoundingClientRect();
          const start = sectionBounds.top + scrollY;
          const distance =
            kind === "启示湾"
              ? document.querySelector("[data-home-introduction-route]").getBoundingClientRect()
                  .top - sectionBounds.top
              : Number.parseFloat(
                  section.style.getPropertyValue(
                    kind === "三服汇"
                      ? "--home-section-breaker-scroll-distance"
                      : "--home-transfer-scroll-distance",
                  ),
                );
          const samples = [];
          for (const direction of [1, -1]) {
            for (let step = 0; step <= 80; step++) {
              const progress = direction === 1 ? step / 80 : 1 - step / 80;
              scrollTo({ top: start + distance * progress, behavior: "instant" });
              await new Promise((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(resolve)),
              );
              for (const { rail, visual, hit, segment } of tracks) {
                const body = visual.getBoundingClientRect();
                const track = rail.getBoundingClientRect();
                if (
                  hit.dataset.routeSegment !== segment ||
                  visual.dataset.routeCurved === "true" ||
                  body.left < track.left ||
                  body.right > track.right
                )
                  continue;
                const target = hit.getBoundingClientRect();
                samples.push({
                  direction,
                  segment,
                  centerY: body.top + body.height / 2,
                  error: body.top + body.height / 2 - track.top - track.height / 2,
                  hitError: target.top + target.height / 2 - track.top - track.height / 2,
                });
              }
            }
          }
          return samples;
        }, sectionKind);
        const expectedSegments =
          sectionKind === "启示湾"
            ? ["horizontal"]
            : sectionKind === "三服汇"
              ? ["breaker-horizontal"]
              : sectionKind === "同岸"
                ? ["transfer-incoming-platform", "transfer-outgoing-horizontal"]
                : ["onward-incoming-horizontal", "onward-outgoing-horizontal"];
        for (const segment of expectedSegments) {
          for (const direction of [1, -1]) {
            const pass = samples.filter(
              (sample) => sample.direction === direction && sample.segment === segment,
            );
            assert.ok(
              pass.length >= 5,
              `${segment} 必须覆盖足够多的完整横轨车身姿态：${pass.length}`,
            );
            const drift =
              Math.max(...pass.map(({ error }) => error)) -
              Math.min(...pass.map(({ error }) => error));
            assert.ok(drift < 0.05, `${segment} 横向行驶时垂直漂移 ${drift}px`);
            assert.ok(
              pass.every(({ error, hitError }) => Math.abs(error) < 0.05 && Math.abs(hitError) < 1),
              `横轨车身应精确同高，点击区容许不足 1px 的尺寸取整：${JSON.stringify(pass.slice(0, 3))}`,
            );
          }
        }
      } finally {
        await page.close();
      }
    });
  }
}

/* 包含手机、触发 88px 车长上限的宽屏、1024px 两侧及减少动态；三语共用真实页面布局。 */
const scenarios = [
  [390, 844, "zh-Hans", "no-preference"],
  [600, 900, "zh-Hans", "no-preference"],
  [820, 1180, "en", "no-preference"],
  [1023, 900, "zh-Hant", "no-preference"],
  [1024, 900, "zh-Hans", "no-preference"],
  [1440, 900, "en", "no-preference"],
  [600, 900, "zh-Hans", "reduce"],
];

for (const [width, height, locale, reducedMotion] of scenarios) {
  test(`${engine} ${width}×${height} ${locale} ${reducedMotion}: 车身、命中区与轨道同轴`, async () => {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion });
    try {
      /* 等深链初始定位与资源加载完成，避免冷启动时的 hash 恢复覆盖测试主动发出的滚动。 */
      await page.goto(`${baseUrl}/${locale}/#onward`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);

      /** 等到真实滚动路段提交后测量，避免把上一帧的列车状态误认为当前位置。 */
      const checkTrack = async (section, track, segment, delta = 200) => {
        await page.locator(section).evaluate((element, offset) => {
          scrollTo({
            top: element.getBoundingClientRect().top + scrollY + offset,
            behavior: "instant",
          });
        }, delta);
        await page.waitForFunction(
          (expected) =>
            document.querySelector("[data-home-arrival-train]")?.dataset.routeSegment === expected,
          segment,
        );
        const geometry = await page.evaluate(async (trackSelector) => {
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
          const visual = document.querySelector("[data-home-arrival-train-visual]");
          const hit = document.querySelector("[data-home-arrival-train]");
          const rail = document.querySelector(trackSelector).getBoundingClientRect();
          const body = visual.getBoundingClientRect();
          const target = hit.getBoundingClientRect();
          return {
            bodyCenter: body.x + body.width / 2,
            trackCenter: rail.x + rail.width / 2,
            hitCenter: target.x + target.width / 2,
            bodyLength: body.height,
            hitLength: target.height,
            visible: visual.dataset.routeVisible,
          };
        }, track);
        assert.equal(geometry.visible, "true");
        assert.ok(
          Math.abs(geometry.bodyCenter - geometry.trackCenter) < 1,
          `${segment}: ${JSON.stringify(geometry)}`,
        );
        assert.ok(
          Math.abs(geometry.bodyCenter - geometry.hitCenter) < 1,
          `${segment}: 车身偏离命中区`,
        );
        assert.ok(
          Math.abs(geometry.bodyLength - geometry.hitLength) < 1,
          `${segment}: 车身与命中区长度不同`,
        );
      };

      await checkTrack(
        "[data-home-onward-content]",
        "[data-home-onward-route-track]",
        "onward-content-track",
      );
      /* 减少动态时，低矮页尾尚未跨过视口阅读线，列车仍可归属于同轴的续行正文。 */
      await checkTrack(
        "[data-home-footer]",
        ".home-footer__track",
        reducedMotion === "reduce" ? "onward-content-track" : "footer",
      );
      await checkTrack(
        "[data-home-onward-content]",
        "[data-home-onward-route-track]",
        "onward-content-track",
        400,
      );
      await checkTrack(
        "[data-home-tri-server]",
        "[data-home-tri-server-track]",
        reducedMotion === "reduce" ? "static" : "tri-server",
      );
    } finally {
      await page.close();
    }
  });
}
