import {
  getRailwayLineKey,
  railwayLines,
  type HexColor,
  type RailwayLine,
  type RailwayLineKey,
} from "@/data/railway";

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
  /** 保证实景首屏文案可读的中性遮罩。 */
  heroScrim: string;
  /** 悬浮导视牌所需的环境阴影。 */
  floatingShadow: string;
  /** 启动动画站牌的近距离阴影。 */
  launchShadow: string;
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
    heroScrim: "rgb(9 12 13 / 0.55)",
    floatingShadow: "0 0 42px -18px rgb(12 15 16 / 0.35)",
    launchShadow: "0 16px 45px rgb(12 15 16 / 0.16)",
  },
  dark: {
    canvas: "#111416",
    surface: "#1A1E20",
    surfaceRaised: "#24292B",
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
    heroScrim: "rgb(4 6 7 / 0.68)",
    floatingShadow: "0 0 58px -20px rgb(0 0 0 / 0.72)",
    launchShadow: "0 16px 45px rgb(0 0 0 / 0.46)",
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
  heroScrim: "--palette-hero-scrim",
  floatingShadow: "--palette-floating-shadow",
  launchShadow: "--palette-launch-shadow",
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
