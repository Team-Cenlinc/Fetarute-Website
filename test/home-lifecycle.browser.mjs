import assert from "node:assert/strict";
import { after, test } from "node:test";

/* 沿用本机浏览器依赖，直接验证真实控制器的异步边界，不把正则匹配当作生命周期证明。 */
const { chromium, webkit } = await import(process.env.FETARUTE_PLAYWRIGHT_MODULE ?? "playwright");
const engine = process.env.FETARUTE_TEST_BROWSER ?? "chromium";
assert.ok(["chromium", "webkit"].includes(engine));
const browser = await (engine === "webkit" ? webkit : chromium).launch({
  headless: true,
  ...(engine === "chromium" ? { channel: "chrome" } : {}),
});
after(() => browser.close());
const baseUrl = process.env.FETARUTE_HOME_TEST_URL ?? "http://127.0.0.1:4323";

/** 先让正文进入懒加载范围，再通过可见按钮打开帮助页，保持与访问者相同的初始化路径。 */
async function openOnwardHelp(page) {
  await page.goto(`${baseUrl}/zh-Hans/#onward`, { waitUntil: "networkidle" });
  await page.locator("[data-home-onward-content]").scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () =>
      document.querySelector("[data-home-onward-content]").dataset.homeOnwardEnhanced === "true",
  );
  await page.locator('[data-home-onward-select-board="help"]').click();
  await page.waitForFunction(
    () =>
      document.querySelector("[data-home-onward-content]").dataset.homeOnwardBoardState === "help",
  );
}

for (const persisted of [false, true]) {
  test(`${engine}: 迟到的章节下载在${persisted ? "BFCache 返回后仍能初始化" : "真正卸载后跳过初始化"}`, async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const download = Promise.withResolvers();
    try {
      /* 下载与模块执行仍使用真实构建产物，只把网络完成时刻推迟到 pagehide 之后。 */
      await page.route("**/onward-controller.*.js", async (route) => {
        await download.promise;
        await route.continue();
      });
      const requested = page.waitForRequest("**/onward-controller.*.js");
      await page.goto(`${baseUrl}/zh-Hans/#onward`, { waitUntil: "domcontentloaded" });
      await page.locator("[data-home-onward-content]").scrollIntoViewIfNeeded();
      await requested;
      await page.evaluate((keepPage) => {
        window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: keepPage }));
        if (keepPage)
          window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
      }, persisted);
      download.resolve();
      await page.waitForLoadState("networkidle");
      assert.equal(
        await page.locator("[data-home-onward-content]").getAttribute("data-home-onward-enhanced"),
        persisted ? "true" : null,
      );
    } finally {
      download.resolve();
      await page.close();
    }
  });
}

for (const outcome of ["success", "false", "throw"]) {
  test(`${engine}: 旧复制 API ${outcome} 后清除临时输入框并恢复键盘焦点`, async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    try {
      await openOnwardHelp(page);
      await page.evaluate((result) => {
        Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
        document.execCommand = () => {
          if (result === "throw") throw new DOMException("Copy denied", "NotAllowedError");
          return result === "success";
        };
      }, outcome);
      const button = page.locator("[data-home-onward-copy-qq]");
      await button.focus();
      await page.keyboard.press("Enter");
      await page.waitForFunction(
        (state) => document.querySelector("[data-home-onward-copy-qq]").dataset.copyState === state,
        outcome === "success" ? "copied" : "failed",
      );
      assert.equal(await page.locator("textarea").count(), 0, "成功和异常路径都必须移除临时输入框");
      assert.equal(
        await button.evaluate((element) => document.activeElement === element),
        true,
        "复制后键盘焦点应留在原按钮上",
      );
    } finally {
      await page.close();
    }
  });
}

for (const persisted of [false, true]) {
  test(`${engine}: Clipboard 拒绝在${persisted ? "BFCache 返回后保留回退" : "真正卸载后停止回退"}`, async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    try {
      await openOnwardHelp(page);
      await page.evaluate(() => {
        window.copyAudit = { legacyCalls: 0, textareaAdds: 0 };
        /* 只替代浏览器权限边界，避免读写测试机器的真实剪贴板。 */
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: () =>
              new Promise((resolve, reject) => {
                window.rejectPendingCopy = reject;
              }),
          },
        });
        document.execCommand = () => {
          window.copyAudit.legacyCalls += 1;
          return true;
        };
        const append = document.body.append.bind(document.body);
        document.body.append = (...nodes) => {
          window.copyAudit.textareaAdds += nodes.filter(
            (node) => node.tagName === "TEXTAREA",
          ).length;
          return append(...nodes);
        };
      });
      await page.locator("[data-home-onward-copy-qq]").click();
      await page.evaluate(async (keepPage) => {
        window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: keepPage }));
        if (keepPage)
          window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
        window.rejectPendingCopy(new Error("Permission denied"));
        await new Promise((resolve) => setTimeout(resolve, 0));
      }, persisted);
      assert.deepEqual(await page.evaluate(() => window.copyAudit), {
        legacyCalls: persisted ? 1 : 0,
        textareaAdds: persisted ? 1 : 0,
      });
      if (persisted) {
        assert.equal(
          await page.locator("[data-home-onward-copy-qq]").getAttribute("data-copy-state"),
          "copied",
        );
      }
    } finally {
      await page.close();
    }
  });
}

for (const persisted of [false, true]) {
  test(`${engine}: 轮播 decode 在${persisted ? "BFCache 返回后继续换图" : "真正卸载后不再回滚旧面板"}`, async () => {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    try {
      await page.goto(`${baseUrl}/zh-Hans/#tri-server`, { waitUntil: "networkidle" });
      await page.locator("[data-home-tri-server]").scrollIntoViewIfNeeded();
      await page.waitForFunction(
        () =>
          document
            .querySelector("[data-home-tri-server-media-panel]")
            .closest("[data-home-tri-server-mobile-media-host]") !== null,
      );
      await page.evaluate(() => {
        const panel = document.querySelector("[data-home-tri-server-media-panel]");
        const carousel = panel.querySelector("[data-home-tri-server-carousel]");
        const slides = carousel.querySelectorAll("[data-home-tri-server-slide]");
        const image = slides[1].querySelector("img");
        window.carouselAudit = { pending: false, scrollCalls: 0, mutations: [] };
        /* 延迟的是图片解码边界；原生 scroll 事件仍交给发布产物中的完整控制器处理。 */
        Object.defineProperty(image, "complete", { configurable: true, get: () => false });
        Object.defineProperty(image, "naturalWidth", { configurable: true, get: () => 1920 });
        image.decode = () =>
          new Promise((resolve) => {
            window.carouselAudit.pending = true;
            window.resolveCarouselDecode = resolve;
          });
        const scrollTo = carousel.scrollTo.bind(carousel);
        carousel.scrollTo = (...args) => {
          window.carouselAudit.scrollCalls += 1;
          return scrollTo(...args);
        };
        carousel.scrollLeft = slides[1].offsetLeft;
        carousel.dispatchEvent(new Event("scroll"));
      });
      await page.waitForFunction(() => window.carouselAudit.pending);
      await page.evaluate(async (keepPage) => {
        window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: keepPage }));
        if (keepPage)
          window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
        window.carouselAudit.scrollCalls = 0;
        const panel = document.querySelector("[data-home-tri-server-media-panel]");
        /* 清理自身允许恢复状态；只记录 pagehide 返回后由迟到 decode 引发的续写。 */
        const observer = new MutationObserver((entries) => {
          window.carouselAudit.mutations.push(...entries.map((entry) => entry.attributeName));
        });
        observer.observe(panel, { attributes: true, attributeFilter: ["data-active-slide"] });
        window.resolveCarouselDecode();
        await new Promise((resolve) => setTimeout(resolve, 0));
        observer.disconnect();
      }, persisted);
      if (persisted) {
        assert.equal(
          await page
            .locator("[data-home-tri-server-media-panel]")
            .first()
            .getAttribute("data-active-slide"),
          "1",
        );
      } else {
        assert.deepEqual(await page.evaluate(() => window.carouselAudit), {
          pending: true,
          scrollCalls: 0,
          mutations: [],
        });
      }
    } finally {
      await page.close();
    }
  });
}
