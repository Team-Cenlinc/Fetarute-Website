import { railwayLines, type HexColor, type RailwayLine } from "@/data/railway";

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
  /** 供 CSS 使用的自定义属性名称，例如 --line-mt。 */
  cssVariable: string;
}

/**
 * 将线路代码规范为 CSS custom property 名称。
 * 对外线路代码保留原始大小写，CSS token 则统一小写并过滤特殊字符，保证导出样式可安全解析。
 */
export function getRailwayLineCssVariableName(code: RailwayLine["code"]): string {
  const normalizedCode = code.toLowerCase().replace(/[^a-z0-9-]/g, "-");

  if (!normalizedCode) {
    throw new Error("线路代码无法转换为 CSS 自定义属性名称。");
  }

  return `--line-${normalizedCode}`;
}

/**
 * 根据线路实体色选择站牌色块上的浅色或深色文字。
 * 返回语义 CSS token 而非重复中性色值，使色块在浅深外观下都优先采用与背景对比度更高的前景。
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
  const darkTextLuminance = 0.007;
  const lightTextLuminance = 0.91;
  const darkContrast = (luminance + 0.05) / (darkTextLuminance + 0.05);
  const lightContrast = (lightTextLuminance + 0.05) / (luminance + 0.05);

  return darkContrast >= lightContrast ? "var(--color-scene-fallback)" : "var(--color-on-hero)";
}

/**
 * 从铁路领域数据派生的线路色表。
 * 此表不另存任何色值；新增线路后会自动拥有可供页面和导出器查询的 CSS token。
 */
export const railwayLinePaletteByCode: ReadonlyMap<string, RailwayLinePaletteEntry> = new Map(
  railwayLines.map((line) => [
    line.code,
    {
      color: line.color,
      cssVariable: getRailwayLineCssVariableName(line.code),
    },
  ]),
);

/**
 * 将所有已录入线路色导出为 CSS 变量声明。
 * Layout 在根元素写入这些 token，使首屏动画和后续线路专题无需在各自组件内重新声明颜色。
 */
export function getRailwayLineCssVariables(): string {
  return railwayLines
    .map((line) => `${getRailwayLineCssVariableName(line.code)}: ${line.color};`)
    .join("\n");
}
