import {
  getRailwayLineKey,
  railwayLines,
  type HexColor,
  type RailwayLine,
  type RailwayLineKey,
} from "./railway.ts";

/**
 * 界面外观模式。
 * 浅色与深色只替换中性材料和可读性层级，线路色在两种模式下保持不变以保护导视含义。
 */
export type InterfaceAppearance = "light" | "dark";

/**
 * 不承载线路语义的全站中性界面色。
 * 颜色由 Layout 输出为 CSS custom properties，组件只能使用语义名称，避免重新引入偏绿的局部灰阶。
 */
export interface InterfacePalette {
  /** 页面与启动层的基础底色。 */
  canvas: string;
  /** 普通导视牌与内容模块的实体表面。 */
  surface: string;
  /** 需要与普通表面拉开一层的按钮悬停与启动站牌表面。 */
  surfaceRaised: string;
  /** 列车章节图下半部的路线底色；与上半部的白色当前站牌保持明确材料分界。 */
  journeyMap: string;
  /** 主信息与轮廓使用的高对比中性色。 */
  text: string;
  /** 长说明、次级标签使用的低对比中性色。 */
  muted: string;
  /** 牌面、分隔线与输入轮廓共用的细边框色。 */
  border: string;
  /** 全站交互控制使用的无彩色，不能占用任何一条线路的颜色。 */
  action: string;
  /** 放置在 action 色上的文字与图标颜色。 */
  actionText: string;
  /** 正常完成或记录有效的绿色状态色，不与线路绿或车站导视色混用。 */
  statusOk: string;
  /** 状态正常色上的文字与图标，供提示条和状态徽记保持统一可读性。 */
  statusOkText: string;
  /** 需要留意但不阻断流程的琥珀状态色，刻意区别于 FTA 出口导视黄。 */
  statusCaution: string;
  /** 状态留意色上的文字与图标，随外观模式调整以保证远距离辨识。 */
  statusCautionText: string;
  /** 无效记录或无法继续时的红色状态色，不承担线路识别。 */
  statusError: string;
  /** 状态错误色上的文字与图标，避免组件各自选择前景色。 */
  statusErrorText: string;
  /** Fetarute 信息导视蓝，专门标识语言、帮助与界面设置，不与真实线路色混用。 */
  fetaruteInfo: string;
  /** 信息导视蓝上的浅色文字与图标，保证站牌在两种外观下都有足够对比。 */
  fetaruteInfoText: string;
  /** Fetarute 出口导视黄，专门标识前往其他站内目的地的出口牌。 */
  fetaruteExit: string;
  /** 出口导视黄上的文字与图标；随外观模式切换深浅前景以保持远距离阅读。 */
  fetaruteExitText: string;
  /** 图片尚未加载时的首屏场景底色。 */
  sceneFallback: string;
  /** 覆盖在首屏场景上的高亮文字与焦点轮廓。 */
  onHero: string;
  /** 首屏文字投影使用的中性阴影色，场景只可调整模糊与不透明度。 */
  heroCopyShadow: string;
  /** 首屏字形阴影共用的位移，使紧轮廓与环境层保持同一受光方向。 */
  heroCopyShadowOffset: string;
  /** 首屏字形紧轮廓阴影的模糊半径，用于从亮色实景中分离文字边缘。 */
  heroCopyEdgeShadowBlur: string;
  /** 首屏字形紧轮廓阴影相对场景不透明度的缩放比例。 */
  heroCopyEdgeShadowIntensity: string;
  /** 首屏字形环境阴影相对场景不透明度的缩放比例。 */
  heroCopyAmbientShadowIntensity: string;
  /** 图片 Gallery 的文字区域遮罩，保证实景明暗变化时标题仍可辨识。 */
  galleryScrim: string;
  /** 图片 Gallery 标题使用的环境投影，避免页面样式散落半透明黑色。 */
  galleryCopyShadow: string;
  /** 图片取样前与取样失败时使用的首屏文字反光回退色。 */
  heroCopyReflectionFallback: string;
  /** 悬浮导视牌所需的环境阴影。 */
  floatingShadow: string;
  /** 图片或地图等待状态悬浮提示使用的环境阴影。 */
  feedbackShadow: string;
  /** 实体卡片内缘用于区分页面底色的轻微高光。 */
  surfaceInsetShadow: string;
  /** Carousel 圆形控制在 hover 与 focus 时使用的环境阴影。 */
  controlShadow: string;
  /** Carousel 控制按下时收紧的环境阴影。 */
  controlPressedShadow: string;
}

/**
 * 每种外观模式的中性界面色。
 * 这里刻意不放绿色、蓝色或其他线路色；线路识别只能从 railway.ts 派生，避免全局 CTA 误读为某一线路。
 */
export const interfacePalette: Readonly<Record<InterfaceAppearance, InterfacePalette>> = {
  light: {
    canvas: "#F0F1F0",
    surface: "#FAFBFA",
    surfaceRaised: "#FCFDFC",
    journeyMap: "#E0E0E0",
    text: "#1B2022",
    muted: "#626A6D",
    border: "#C9CED0",
    action: "#1B2022",
    actionText: "#F4F6F5",
    statusOk: "#0F7A4F",
    statusOkText: "#F4F6F5",
    statusCaution: "#9A5D00",
    statusCautionText: "#F4F6F5",
    statusError: "#B8443E",
    statusErrorText: "#F4F6F5",
    fetaruteInfo: "#0067B1",
    fetaruteInfoText: "#F4F6F5",
    fetaruteExit: "#F3C742",
    fetaruteExitText: "#171B1D",
    sceneFallback: "#171B1D",
    onHero: "#F4F6F5",
    heroCopyShadow: "rgb(0 0 0)",
    heroCopyShadowOffset: "0 2px",
    heroCopyEdgeShadowBlur: "2px",
    heroCopyEdgeShadowIntensity: "26%",
    heroCopyAmbientShadowIntensity: "62%",
    galleryScrim: "rgb(0 0 0 / 0.48)",
    galleryCopyShadow: "0 2px 10px rgb(0 0 0 / 0.42)",
    heroCopyReflectionFallback: "#FFFFFF",
    floatingShadow: "0 0 42px -18px rgb(12 15 16 / 0.35)",
    feedbackShadow: "0 8px 24px rgb(27 32 34 / 0.14)",
    surfaceInsetShadow: "inset 0 1px 0 rgb(240 241 240 / 0.64)",
    controlShadow: "0 5px 15px rgb(27 32 34 / 0.12)",
    controlPressedShadow: "0 2px 7px rgb(27 32 34 / 0.1)",
  },
  dark: {
    canvas: "#111416",
    surface: "#1A1E20",
    surfaceRaised: "#24292B",
    journeyMap: "#1A1E20",
    text: "#EEF0EF",
    muted: "#B2B8B9",
    border: "#3D474A",
    action: "#EEF0EF",
    actionText: "#1B2022",
    statusOk: "#4FCB8A",
    statusOkText: "#1B2022",
    statusCaution: "#F0B84A",
    statusCautionText: "#1B2022",
    statusError: "#FF8C84",
    statusErrorText: "#1B2022",
    fetaruteInfo: "#155575",
    fetaruteInfoText: "#F4F6F5",
    fetaruteExit: "#7A5A16",
    fetaruteExitText: "#F4F6F5",
    sceneFallback: "#0D1011",
    onHero: "#F4F6F5",
    heroCopyShadow: "rgb(0 0 0)",
    heroCopyShadowOffset: "0 2px",
    heroCopyEdgeShadowBlur: "2px",
    heroCopyEdgeShadowIntensity: "26%",
    heroCopyAmbientShadowIntensity: "62%",
    galleryScrim: "rgb(0 0 0 / 0.48)",
    galleryCopyShadow: "0 2px 10px rgb(0 0 0 / 0.42)",
    heroCopyReflectionFallback: "#FFFFFF",
    floatingShadow: "0 0 58px -20px rgb(0 0 0 / 0.72)",
    feedbackShadow: "0 8px 24px rgb(0 0 0 / 0.55)",
    surfaceInsetShadow: "inset 0 1px 0 rgb(238 240 239 / 0.08)",
    controlShadow: "0 5px 15px rgb(0 0 0 / 0.45)",
    controlPressedShadow: "0 2px 7px rgb(0 0 0 / 0.35)",
  },
};

/**
 * 界面 palette 字段到 CSS 变量的稳定映射。
 * 新增字段必须在此显式登记，确保 Layout 输出和 global.css 消费同一套可审查的语义 token。
 */
const interfacePaletteCssVariableByKey: Readonly<Record<keyof InterfacePalette, string>> = {
  canvas: "--palette-canvas",
  surface: "--palette-surface",
  surfaceRaised: "--palette-surface-raised",
  journeyMap: "--palette-journey-map",
  text: "--palette-text",
  muted: "--palette-muted",
  border: "--palette-border",
  action: "--palette-action",
  actionText: "--palette-action-text",
  statusOk: "--palette-status-ok",
  statusOkText: "--palette-status-ok-text",
  statusCaution: "--palette-status-caution",
  statusCautionText: "--palette-status-caution-text",
  statusError: "--palette-status-error",
  statusErrorText: "--palette-status-error-text",
  fetaruteInfo: "--palette-fetarute-info",
  fetaruteInfoText: "--palette-fetarute-info-text",
  fetaruteExit: "--palette-fetarute-exit",
  fetaruteExitText: "--palette-fetarute-exit-text",
  sceneFallback: "--palette-scene-fallback",
  onHero: "--palette-on-hero",
  heroCopyShadow: "--palette-hero-copy-shadow",
  heroCopyShadowOffset: "--palette-hero-copy-shadow-offset",
  heroCopyEdgeShadowBlur: "--palette-hero-copy-edge-shadow-blur",
  heroCopyEdgeShadowIntensity: "--palette-hero-copy-edge-shadow-intensity",
  heroCopyAmbientShadowIntensity: "--palette-hero-copy-ambient-shadow-intensity",
  galleryScrim: "--palette-gallery-scrim",
  galleryCopyShadow: "--palette-gallery-copy-shadow",
  heroCopyReflectionFallback: "--palette-hero-copy-reflection-fallback",
  floatingShadow: "--palette-floating-shadow",
  feedbackShadow: "--palette-feedback-shadow",
  surfaceInsetShadow: "--palette-surface-inset-shadow",
  controlShadow: "--palette-control-shadow",
  controlPressedShadow: "--palette-control-pressed-shadow",
};

/**
 * 将一套界面 palette 序列化为可内联到 Layout 的 CSS 变量。
 * palette 只来自本文件的静态数据，因此在 SSG 阶段生成即可，不需要将主题逻辑交给客户端脚本。
 */
export function getInterfacePaletteCssVariables(palette: InterfacePalette): string {
  return (Object.entries(interfacePaletteCssVariableByKey) as [keyof InterfacePalette, string][])
    .map(([key, cssVariable]) => `${cssVariable}: ${palette[key]};`)
    .join("\n");
}

/**
 * 一条线路在 CSS 中的导视色引用。
 * color 保持来自铁路领域模型的唯一事实来源，cssVariable 让启动动画、线路图和专题页面可以无复制地复用它。
 */
export interface RailwayLinePaletteEntry {
  /** 线路自身的官方导视颜色。 */
  color: HexColor;
  /** 供 CSS 使用的自定义属性名称，例如 --line-surc-mt。 */
  cssVariable: string;
}

/**
 * 将运营方代码和线路代码规范为 CSS custom property 名称。
 * CSS token 使用复合身份并统一小写、清洗特殊字符，保证不同运营方的同名线路不会覆盖彼此。
 */
export function getRailwayLineCssVariableName(
  line: Pick<RailwayLine, "operatorCode" | "code">,
): string {
  const normalizedOperatorCode = line.operatorCode
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const normalizedLineCode = line.code
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!normalizedOperatorCode || !normalizedLineCode) {
    throw new Error(`线路无法转换为 CSS 自定义属性名称：${line.operatorCode}:${line.code}。`);
  }

  return `--line-${normalizedOperatorCode}-${normalizedLineCode}`;
}

/**
 * 根据线路实体色选择站牌色块上的浅色或深色文字。
 * 线路号是大号导视字，采用亮度阈值：浅色线路使用深字，深色线路使用浅字，避免底色只因微小对比差而始终落到深字。
 * 返回语义 CSS token 而非重复中性色值，使色块在浅深外观下仍与页面中性前景同步。
 */
export function getRailwayLineTextColor(color: HexColor): string {
  const channels = [1, 3, 5].map(
    (offset) => Number.parseInt(color.slice(offset, offset + 2), 16) / 255,
  );
  const linearChannels = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  const luminance =
    0.2126 * linearChannels[0] + 0.7152 * linearChannels[1] + 0.0722 * linearChannels[2];

  return luminance < 0.25 ? "var(--color-on-hero)" : "var(--color-scene-fallback)";
}

/**
 * 浏览器文字选区可使用的一组线路色。
 * 背景只引用铁路领域的 CSS token，前景则按线路亮度配对，避免深浅主题下选中文字失去对比。
 */
export interface RailwaySelectionPaletteOption {
  /** 作为选区背景的线路色 CSS 引用。 */
  background: string;
  /** 与线路色保持清晰对比的语义前景 CSS 引用。 */
  foreground: string;
}

/**
 * 从全部已录入线路派生文字选区候选；新增线路后会自动进入随机池，不另存颜色副本。
 */
export const railwaySelectionPalette: readonly RailwaySelectionPaletteOption[] = railwayLines.map(
  (line) => ({
    background: `var(${getRailwayLineCssVariableName(line)})`,
    foreground: getRailwayLineTextColor(line.color),
  }),
);

/**
 * 从铁路领域数据派生的线路色表。
 * 此表不另存任何色值；新增线路后会自动拥有可供页面和导出器查询的 CSS token。
 */
export const railwayLinePaletteByKey: ReadonlyMap<RailwayLineKey, RailwayLinePaletteEntry> =
  new Map(
    railwayLines.map((line) => [
      getRailwayLineKey(line.operatorCode, line.code),
      {
        color: line.color,
        cssVariable: getRailwayLineCssVariableName(line),
      },
    ]),
  );

/**
 * 线路 CSS 变量的构建期条目。
 * 先从铁路领域数据生成完整的复合命名，再检查变量名唯一，避免同名线路覆盖已经导出的色值。
 */
const railwayLineCssVariableEntries = railwayLines.map(
  (line) => [getRailwayLineCssVariableName(line), line.color] as const,
);

if (
  new Set(railwayLineCssVariableEntries.map(([cssVariable]) => cssVariable)).size !==
  railwayLineCssVariableEntries.length
) {
  throw new Error("线路 CSS 自定义属性名称重复，无法生成唯一的线路色变量。");
}

/**
 * 将所有已录入线路色导出为 CSS 变量声明。
 * Layout 在根元素写入这些 token，使首屏动画和后续线路专题无需在各自组件内重新声明颜色。
 */
export function getRailwayLineCssVariables(): string {
  return railwayLineCssVariableEntries
    .map(([cssVariable, color]) => `${cssVariable}: ${color};`)
    .join("\n");
}
