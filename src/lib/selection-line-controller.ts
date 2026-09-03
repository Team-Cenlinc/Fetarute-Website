import { railwaySelectionPalette, type RailwaySelectionPaletteOption } from "../data/palette.ts";

/**
 * 选区线路控制器的可替换依赖。
 * 随机源、选区状态与样式写入都由调用方提供，使浏览器事件状态机可以脱离 DOM 做行为测试。
 */
export interface SelectionLineControllerDependencies {
  /** 可用于选区背景与前景的线路色组合。 */
  palette: readonly RailwaySelectionPaletteOption[];
  /** 返回大于等于 0 且小于 1 的随机数，决定下一条选区线路。 */
  getRandom: () => number;
  /** 查询文档当前是否存在非折叠且包含文字的选区。 */
  hasSelection: () => boolean;
  /** 将抽中的线路背景与配套前景写入页面语义 token。 */
  applyPalette: (palette: RailwaySelectionPaletteOption) => void;
}

/**
 * 原生选区事件使用的两个入口。
 * selectstart 负责支持浏览器的选前换色，selectionchange 负责移动 Safari 回退与选择周期收束。
 */
export interface SelectionLineController {
  /** 在支持 selectstart 的浏览器中于选区绘制前准备颜色。 */
  prepareSelectionLine: () => void;
  /** 在选区变化后同步移动 Safari 回退和当前选择周期。 */
  syncSelectionLineFallback: () => void;
}

/**
 * 创建一次文档生命周期内的选区线路状态机。
 * 同一次拖选只写入一次颜色，新选择会重新抽取，并在存在多个候选时跳过上一条线路。
 */
export function createSelectionLineController({
  palette,
  getRandom,
  hasSelection,
  applyPalette,
}: SelectionLineControllerDependencies): SelectionLineController {
  let previousSelectionLineIndex = -1;
  let hasActiveSelection = false;
  let selectionColorPrepared = false;

  /** 为一次新的原生文字选择动作换色，并记住线路以避免下一次连续同色。 */
  function chooseSelectionLine(): void {
    if (palette.length === 0) {
      return;
    }

    const availableCount =
      previousSelectionLineIndex < 0 ? palette.length : Math.max(1, palette.length - 1);
    let nextIndex = Math.floor(getRandom() * availableCount);

    // 有多个候选时跳过上一条线路，避免连续两次选区看起来没有响应。
    if (previousSelectionLineIndex >= 0 && nextIndex >= previousSelectionLineIndex) {
      nextIndex += 1;
    }

    nextIndex %= palette.length;
    previousSelectionLineIndex = nextIndex;
    applyPalette(palette[nextIndex]);
  }

  /** 先写颜色并记录已准备状态，避免紧随其后的 selectionchange 再抽一次。 */
  function prepareSelectionLine(): void {
    chooseSelectionLine();
    selectionColorPrepared = true;
  }

  /** 只在无选区到有选区的边界执行 Safari 回退，拖动现有选区手柄时保持颜色稳定。 */
  function syncSelectionLineFallback(): void {
    if (!hasSelection()) {
      hasActiveSelection = false;
      selectionColorPrepared = false;
      return;
    }

    if (!hasActiveSelection && !selectionColorPrepared) {
      chooseSelectionLine();
    }

    hasActiveSelection = true;
    selectionColorPrepared = false;
  }

  return { prepareSelectionLine, syncSelectionLineFallback };
}

/** 生成选区线路所需随机数；优先使用系统随机源，受限环境才退回 Math.random。 */
function getSelectionRandom(): number {
  try {
    const randomValues = new Uint32Array(1);
    window.crypto.getRandomValues(randomValues);
    return randomValues[0] / 2 ** 32;
  } catch {
    return Math.random();
  }
}

/**
 * 将选区线路状态机连接到当前文档。
 * 两个原生事件互为渐进增强与兼容回退，都不取消或接管浏览器自己的选择行为。
 */
export function setupSelectionLineController(): void {
  const controller = createSelectionLineController({
    palette: railwaySelectionPalette,
    getRandom: getSelectionRandom,
    hasSelection: () => {
      const selection = document.getSelection();
      return Boolean(selection && !selection.isCollapsed && selection.toString());
    },
    applyPalette: (palette) => {
      const rootStyle = document.documentElement.style;
      rootStyle.setProperty("--color-selection", palette.background);
      rootStyle.setProperty("--color-selection-text", palette.foreground);
    },
  });

  document.addEventListener("selectstart", controller.prepareSelectionLine, { capture: true });
  document.addEventListener("selectionchange", controller.syncSelectionLineFallback);
}
