import assert from "node:assert/strict";
import { after, test } from "node:test";

/* 复用项目已有的外部 Playwright 模块，官网本身不新增浏览器或测试依赖。 */
const { chromium, webkit } = await import(process.env.FETARUTE_PLAYWRIGHT_MODULE ?? "playwright");
const engine = process.env.FETARUTE_TEST_BROWSER ?? "chromium";
assert.ok(["chromium", "webkit"].includes(engine));
const browser = await (engine === "webkit" ? webkit : chromium).launch({
  headless: true,
  ...(engine === "chromium" ? { channel: "chrome" } : {}),
});
after(() => browser.close());
const baseUrl = process.env.FETARUTE_HOME_TEST_URL ?? "http://127.0.0.1:4323";

/* 覆盖桌面短屏、断点两侧、三种语言以及减少动态，检查实际布局而不是 CSS 字面值。 */
for (const [width, height, locale, reducedMotion] of [
  [1024, 600, "en", "no-preference"],
  [1024, 1200, "zh-Hans", "no-preference"],
  [1280, 720, "zh-Hant", "no-preference"],
  [1440, 900, "zh-Hans", "no-preference"],
  [1920, 1080, "en", "no-preference"],
  [1440, 900, "zh-Hans", "reduce"],
  [1023, 900, "en", "no-preference"],
  [390, 844, "zh-Hans", "no-preference"],
  [320, 568, "en", "no-preference"],
]) {
  test(`${width}×${height} ${locale} ${reducedMotion}: 同岸阅读与 Footer 净空`, async () => {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.goto(`${baseUrl}/${locale}/#shared-shore`, { waitUntil: "networkidle" });
      const story = page.locator(".home-community__short-story--presence:not([hidden])");
      await story.evaluate((element) =>
        element.scrollIntoView({ block: "start", behavior: "instant" }),
      );
      await page.waitForTimeout(250);
      const storyLayout = await story.evaluate((element) => {
        const image = element.querySelector(".home-community__short-media").getBoundingClientRect();
        const heading = element.querySelector("h3").getBoundingClientRect();
        const header = document.querySelector(".site-header").getBoundingClientRect();
        return { image: image.toJSON(), heading: heading.toJSON(), header: header.toJSON() };
      });
      if (width >= 1024) {
        assert.ok(storyLayout.image.width <= width * 0.5, "短故事照片不能再铺满桌面版心");
        assert.ok(storyLayout.heading.right < storyLayout.image.left, "图文必须分栏");
        assert.ok(
          storyLayout.heading.top > storyLayout.header.bottom + 24,
          "锚点标题应避开 Header",
        );
      } else {
        assert.ok(storyLayout.image.top >= storyLayout.heading.bottom, "小屏仍为纵向故事");
      }
      for (const expandedStory of [
        page.locator(".home-community__short-story--memory:not([hidden])"),
        story,
      ]) {
        if (!(await expandedStory.count())) continue;
        await expandedStory.locator("summary").click();
        await page.waitForTimeout(350);
        const detail = await expandedStory.evaluate((element) => {
          const image = element
            .querySelector(".home-community__short-media")
            .getBoundingClientRect();
          const copy = element.querySelector(
            ".home-community__short-body, .home-community__presence-story-copy",
          );
          const paragraphs = [...copy.children].map((child) =>
            child.getBoundingClientRect().toJSON(),
          );
          return {
            image: image.toJSON(),
            paragraphs,
            color: getComputedStyle(copy).color,
          };
        });
        for (const text of detail.paragraphs) {
          assert.ok(
            text.top >= detail.image.top + 10 && text.bottom <= detail.image.bottom - 10,
            `展开文案必须完整落在图片内: ${JSON.stringify(detail)}`,
          );
          assert.ok(text.left >= detail.image.left + 10 && text.right <= detail.image.right - 10);
        }
        assert.equal(detail.color, "rgb(244, 246, 245)", "深色照片上使用专用浅色前景");
        await expandedStory.locator("summary").click();
      }

      await page.locator("[data-home-onward-content]").scrollIntoViewIfNeeded();
      await page.waitForFunction(
        () =>
          document.querySelector("[data-home-onward-content]").dataset.homeOnwardEnhanced ===
          "true",
      );
      const journey = await page.locator("[data-home-onward-journey]").evaluate((element) => ({
        start: element.getBoundingClientRect().top + scrollY,
        release:
          element.getBoundingClientRect().top +
          scrollY +
          element.offsetHeight -
          element.querySelector(".home-onward__stage").offsetHeight,
      }));
      await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), journey.start);
      await page.waitForTimeout(200);
      const navigation = await page.evaluate(() => ({
        nav: document
          .querySelector(".home-onward__board-navigation")
          .getBoundingClientRect()
          .toJSON(),
        screen: document
          .querySelector(".home-onward__board-screen")
          .getBoundingClientRect()
          .toJSON(),
        shell: document.querySelector(".home-onward__board-shell").getBoundingClientRect().toJSON(),
        guide: document.querySelector(".home-onward__guide").getBoundingClientRect().toJSON(),
      }));
      assert.ok(
        navigation.nav.bottom <= navigation.shell.top - 12,
        "桌面和小屏切换按钮均须完整位于灰框外",
      );

      if (width >= 1024) {
        assert.ok(navigation.guide.width > navigation.shell.width, "桌面导视牌应比 PIDS 更宽");
        assert.ok(navigation.shell.right + 24 <= navigation.guide.left, "两块牌保留清晰间隔");
      }

      if (width >= 1024 && reducedMotion !== "reduce") {
        const end = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
        /* 从 sticky 解锁前一路取样到底部，并反向返回，暴露过渡中裁切与位移反馈抖动。 */
        const positions = Array.from(
          { length: 13 },
          (_, index) => journey.release - 80 + ((end - journey.release + 80) * index) / 12,
        );
        for (const y of [...positions, ...positions.toReversed()]) {
          await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), y);
          await page.waitForTimeout(50);
          const gap = await page.evaluate(() => {
            const footerTop = document.querySelector(".home-footer").getBoundingClientRect().top;
            return Math.min(
              ...[".home-onward__board-shell", ".home-onward__guide"].map(
                (selector) =>
                  footerTop - document.querySelector(selector).getBoundingClientRect().bottom,
              ),
            );
          });
          assert.ok(gap >= 23, `Footer 不应裁切末屏，实测净空 ${gap}px`);
        }
      }
      await page.locator(".home-footer").scrollIntoViewIfNeeded();
      await page.evaluate(() =>
        scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
      );
      await page.waitForTimeout(200);
      const footer = page.locator(".home-footer");
      const copyGap = await footer.evaluate(
        (element) =>
          element.querySelector(".home-footer__description").getBoundingClientRect().top -
          element.querySelector("h2").getBoundingClientRect().bottom,
      );
      assert.ok(copyGap >= 10 && copyGap <= 24, "页尾标题和说明不应被链接列拉开");
      assert.equal(await footer.locator("a").count(), 1);
      assert.equal(await footer.locator('a[hreflang], a[target="_blank"]').count(), 0);
      assert.equal(await footer.locator(".home-footer__restart").getAttribute("href"), "#home");
      const signature = await footer.locator(".home-footer__signature").evaluate((element) => {
        const logo = element.querySelector(".home-footer__wordmark").getBoundingClientRect();
        const legal = element.querySelector(".home-footer__legal").getBoundingClientRect();
        const bounds = element.getBoundingClientRect();
        return { logo: logo.toJSON(), legal: legal.toJSON(), bounds: bounds.toJSON() };
      });
      assert.ok(signature.logo.left >= signature.bounds.left - 1);
      assert.ok(signature.legal.right <= signature.bounds.right + 1);
      assert.ok(
        signature.legal.left >= signature.logo.right ||
          signature.legal.top >= signature.logo.bottom,
        "Logo 与版权应自然分栏或换行，不能重叠",
      );
      const footerTargets = await footer.locator("a").evaluateAll((links) =>
        links.map((link) => {
          const bounds = link.getBoundingClientRect();
          return {
            label: link.textContent.trim(),
            height: bounds.height,
            visible: bounds.bottom <= innerHeight + 1 && bounds.top >= 0,
            hit:
              document
                .elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2)
                ?.closest("a") === link,
          };
        }),
      );
      for (const target of footerTargets) {
        /* CSS 像素经滚动 transform 后可能产生浮点误差，保留十分之一像素的测量容差。 */
        assert.ok(target.height >= 43.9 && target.visible && target.hit, JSON.stringify(target));
      }
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  });
}

test("页尾只保留返回起点，语言与 Wiki 入口仍由 Header 提供", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(`${baseUrl}/en/#footer`, { waitUntil: "networkidle" });
    const footer = page.locator(".home-footer");
    assert.equal(await footer.locator("a").count(), 1);
    assert.ok(await page.locator('.site-header a[lang="zh-Hant"]').count());
    assert.ok(await page.locator('.site-header a[href="https://wiki.fetarute.org"]').count());
    await footer.locator(".home-footer__restart").focus();
    await page.keyboard.press("Enter");
    await page.waitForURL((url) => url.hash === "#home");
    await page.waitForFunction(() => window.scrollY < 2);
  } finally {
    await page.close();
  }
});

/* 窄高、矮屏和宽屏使用同一列车比例，避免 svh 与 vw 分别缩放造成方块化。 */
test("桌面窗口缩放后，列车保持 2:1 且 Header 两行导视紧凑对齐", async () => {
  const page = await browser.newPage();
  try {
    await page.goto(`${baseUrl}/zh-Hans/#onward`, { waitUntil: "networkidle" });
    for (const [width, height] of [
      [1024, 1200],
      [1024, 600],
      [1440, 900],
      [1920, 1080],
    ]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(300);
      const train = await page.locator("[data-home-arrival-train-visual]").evaluate((element) => ({
        width: element.offsetWidth,
        height: element.offsetHeight,
      }));
      assert.ok(Math.abs(train.width / train.height - 2) < 0.03, JSON.stringify(train));
      assert.ok(train.height >= 44, "车体变细后仍可点击 Tooltip");
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(800);
    const rows = await page
      .locator(".home-nav__text-stack, .service-desk__copy, .exit-menu__copy")
      .evaluateAll((elements) =>
        elements.map((element) => ({
          gap: parseFloat(getComputedStyle(element).rowGap),
          top: element.getBoundingClientRect().top,
        })),
      );
    assert.ok(rows.every((row) => row.gap === 4));
    assert.ok(
      Math.max(...rows.map((row) => row.top)) - Math.min(...rows.map((row) => row.top)) <= 1,
      `三块导视标题使用同一基线: ${JSON.stringify(rows)}`,
    );
  } finally {
    await page.close();
  }
});

/* 穷举静态发布的英文故事，避免随机选择恰好漏掉最长文案；只隔离展示夹具，不改生产选择器。 */
test("全部英文短故事在窄屏和桌面断点内完整覆盖照片", async () => {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  try {
    await page.goto(`${baseUrl}/en/#shared-shore`, { waitUntil: "networkidle" });
    for (const width of [320, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      const layouts = await page.evaluate(() => {
        const stories = [...document.querySelectorAll(".home-community__short-story")];
        const original = stories.map((story) => story.hidden);
        const results = stories.map((story) => {
          stories.forEach((candidate) => {
            candidate.hidden = candidate !== story;
          });
          const details = story.querySelector("details");
          details.open = true;
          const copy = story.querySelector(
            ".home-community__short-body,.home-community__presence-story-copy",
          );
          const image = story.querySelector(".home-community__short-media").getBoundingClientRect();
          const paragraphs = [...copy.children].map((child) => child.getBoundingClientRect());
          const result = {
            title: story.querySelector("h3").textContent,
            topGap: Math.min(...paragraphs.map((p) => p.top)) - image.top,
            bottomGap: image.bottom - Math.max(...paragraphs.map((p) => p.bottom)),
          };
          details.open = false;
          return result;
        });
        stories.forEach((story, index) => {
          story.hidden = original[index];
        });
        return results;
      });
      assert.ok(layouts.length >= 6, "覆盖全部两类短故事");
      for (const layout of layouts) {
        assert.ok(
          layout.topGap >= 13.9 && layout.bottomGap >= 13.9,
          JSON.stringify({ width, ...layout }),
        );
      }
    }
  } finally {
    await page.close();
  }
});
