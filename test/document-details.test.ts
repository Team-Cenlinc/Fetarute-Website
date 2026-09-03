import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { railwaySelectionPalette } from "../src/data/palette.ts";
import { railwayLines } from "../src/data/railway.ts";
import { setupImageDragGuard } from "../src/lib/image-drag-guard.ts";
import { createSelectionLineController } from "../src/lib/selection-line-controller.ts";

const guardedImageSelector = "img:not([data-image-drag-allowed])";
const baseLayoutSource = readFileSync(
  new URL("../src/layouts/BaseLayout.astro", import.meta.url),
  "utf8",
);
const globalCssSource = readFileSync(new URL("../src/styles/global.css", import.meta.url), "utf8");

/**
 * 图片拖拽保护只依赖 closest 查询；这个最小替身覆盖普通图片、放行图片和非图片目标。
 */
class FakeElement {
  private readonly guardedImage: FakeElement | null;

  constructor(guardedImage: FakeElement | null = null) {
    this.guardedImage = guardedImage;
  }

  closest(selector: string): FakeElement | null {
    return selector === guardedImageSelector ? this.guardedImage : null;
  }
}

/**
 * 为单条测试安装最小浏览器环境，并在断言完成后还原 Node 全局，避免用真实 DOM 测试一个事件委托函数。
 */
function withFakeBrowser(
  run: (browser: {
    readonly listenerCount: () => number;
    readonly dragstart: (target: FakeElement) => boolean;
  }) => void,
): void {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const previousElement = globalThis.Element;
  let dragstartListener: ((event: DragEvent) => void) | undefined;
  let listenerCount = 0;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {},
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      addEventListener(type: string, listener: (event: DragEvent) => void) {
        if (type === "dragstart") {
          listenerCount += 1;
          dragstartListener = listener;
        }
      },
    },
  });
  Object.defineProperty(globalThis, "Element", {
    configurable: true,
    value: FakeElement,
  });

  try {
    run({
      listenerCount: () => listenerCount,
      dragstart(target) {
        let prevented = false;
        dragstartListener?.({
          target,
          preventDefault() {
            prevented = true;
          },
        } as unknown as DragEvent);
        return prevented;
      },
    });
  } finally {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: previousWindow,
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: previousDocument,
    });
    Object.defineProperty(globalThis, "Element", {
      configurable: true,
      value: previousElement,
    });
  }
}

test("全站图片默认阻止浏览器原生拖拽，并保留显式放行入口", () => {
  withFakeBrowser((browser) => {
    const guardedImage = new FakeElement();

    setupImageDragGuard();

    assert.equal(browser.dragstart(new FakeElement(guardedImage)), true);
    assert.equal(browser.dragstart(new FakeElement()), false);
  });
});

test("图片拖拽保护重复初始化时只注册一次捕获监听", () => {
  withFakeBrowser((browser) => {
    setupImageDragGuard();
    setupImageDragGuard();

    assert.equal(browser.listenerCount(), 1);
  });
});

test("文字选区候选逐条派生自已录入线路，并同时提供可读前景色", () => {
  assert.equal(railwaySelectionPalette.length, railwayLines.length);
  assert.equal(
    new Set(railwaySelectionPalette.map(({ background }) => background)).size,
    railwayLines.length,
  );

  for (const option of railwaySelectionPalette) {
    assert.match(option.background, /^var\(--line-[a-z0-9-]+\)$/);
    assert.match(option.foreground, /^var\(--color-(?:on-hero|scene-fallback)\)$/);
  }
});

test("文字选区每次选择只换一次颜色，下一次选择换到不同线路", () => {
  const appliedPalettes: (typeof railwaySelectionPalette)[number][] = [];
  let hasSelection = false;
  let randomCalls = 0;
  const controller = createSelectionLineController({
    palette: railwaySelectionPalette.slice(0, 3),
    getRandom: () => {
      randomCalls += 1;
      return 0;
    },
    hasSelection: () => hasSelection,
    applyPalette: (palette) => appliedPalettes.push(palette),
  });

  controller.prepareSelectionLine();
  hasSelection = true;
  controller.syncSelectionLineFallback();
  controller.syncSelectionLineFallback();

  assert.equal(randomCalls, 1);
  assert.equal(appliedPalettes.length, 1);

  hasSelection = false;
  controller.syncSelectionLineFallback();
  hasSelection = true;
  controller.syncSelectionLineFallback();

  assert.equal(randomCalls, 2);
  assert.equal(appliedPalettes.length, 2);
  assert.notEqual(appliedPalettes[0].background, appliedPalettes[1].background);
});

test("移动 Safari 回退可独立启动选择，并把背景与前景交给 selection 样式消费", () => {
  const appliedPalettes: (typeof railwaySelectionPalette)[number][] = [];
  let hasSelection = true;
  const controller = createSelectionLineController({
    palette: railwaySelectionPalette.slice(0, 2),
    getRandom: () => 0,
    hasSelection: () => hasSelection,
    applyPalette: (palette) => appliedPalettes.push(palette),
  });

  controller.syncSelectionLineFallback();
  controller.syncSelectionLineFallback();
  assert.equal(appliedPalettes.length, 1);

  hasSelection = false;
  controller.syncSelectionLineFallback();
  assert.match(globalCssSource, /::selection\s*{[^}]*color:\s*var\(--color-selection-text\)/s);
  assert.match(
    globalCssSource,
    /::selection\s*{[^}]*background-color:\s*var\(--color-selection\)/s,
  );
  assert.match(baseLayoutSource, /setupSelectionLineController\(\)/);
});
