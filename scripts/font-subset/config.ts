import path from "node:path";
import { fileURLToPath } from "node:url";

export const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(SCRIPT_DIR, "../..");
export const MANUAL_CHARS_FILE = path.join(SCRIPT_DIR, "manual-chars.txt");
export const OUTPUT_CHARS_FILE = path.join(SCRIPT_DIR, "chars.txt");

/**
 * 字体扫描配置。
 *
 * `roots` 覆盖官网源码、内容集合和维护文档；不存在的目录会被跳过，避免早期内容目录尚未建立时阻断字符抽取。
 * `extensions` 只允许源码和 Markdown，防止将字体产物、图片或锁文件意外加入 display 字体子集。
 */
export interface FontScanConfig {
  roots: string[];
  extensions: Set<string>;
  ignoredDirectories: Set<string>;
}

/**
 * 单个网页字体子集目标。
 *
 * 源字体始终放在 `fonts-source/`，生成的 woff2 才放入 `src/assets/fonts/`，以免完整字体被 Astro 原样发布。
 */
export interface FontSubsetTarget {
  source: string;
  output: string;
}

/**
 * 首轮 Noto Sans 字体目标名称。
 *
 * Display 是英文与数字的默认导视字族；SC、TC 与 JP 分别承担简体中文、繁体中文和日文界面，Display Italic 则只用于英文斜体强调。
 */
export type FontTargetName = "sc" | "tc" | "jp" | "display" | "display-italic";

/**
 * 当前项目的可扫描内容入口。
 *
 * `src/content/` 已被 `src` 覆盖；`docs` 额外纳入，保证将来在设计说明中预留的 CJK 短词不会缺字。
 */
export const scanConfig: FontScanConfig = {
  roots: ["src", "docs"],
  extensions: new Set([".astro", ".ts", ".tsx", ".js", ".jsx", ".md", ".mdx"]),
  ignoredDirectories: new Set(["node_modules", "dist", ".astro", ".git"]),
};

/**
 * Noto Sans 源文件和浏览器产物的固定映射。
 *
 * 变量字体保留 100–900 的字重轴，由 Astro Fonts API 在 `astro.config.ts` 以区间注册；页面与构建脚本不应散落字体文件路径。
 */
export const fontTargets: Record<FontTargetName, FontSubsetTarget> = {
  sc: {
    source: "fonts-source/NotoSansSC-VariableFont_wght.ttf",
    output: "src/assets/fonts/noto-sans-sc-subset.woff2",
  },
  tc: {
    source: "fonts-source/NotoSansTC-VariableFont_wght.ttf",
    output: "src/assets/fonts/noto-sans-tc-subset.woff2",
  },
  jp: {
    source: "fonts-source/NotoSansJP-VariableFont_wght.ttf",
    output: "src/assets/fonts/noto-sans-jp-subset.woff2",
  },
  display: {
    source: "fonts-source/NotoSansDisplay-VariableFont_wdth,wght.ttf",
    output: "src/assets/fonts/noto-sans-display-subset.woff2",
  },
  "display-italic": {
    source: "fonts-source/NotoSansDisplay-Italic-VariableFont_wdth,wght.ttf",
    output: "src/assets/fonts/noto-sans-display-italic-subset.woff2",
  },
};

/**
 * 网页字体需要覆盖的 CJK 字符范围。
 *
 * ASCII、品牌名、数字和未来上线前的短文案由 manual-chars.txt 明确维护，防止代码标识符把子集无意义地放大。
 */
export const cjkPattern = /[\u3000-\u303f\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uff00-\uffef]/gu;

/**
 * 把项目根目录相对路径转为绝对路径。
 *
 * 字体命令通常从仓库根目录运行，但统一在此解析可避免未来从其他 cwd 调用时写入错误位置。
 *
 * @param relativePath - 相对项目根目录的路径。
 * @returns 项目内的绝对路径。
 */
export function fromRoot(relativePath: string): string {
  return path.join(ROOT_DIR, relativePath);
}
