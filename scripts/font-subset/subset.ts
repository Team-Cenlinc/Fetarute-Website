import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fontTargets, fromRoot, OUTPUT_CHARS_FILE, ROOT_DIR } from "./config.ts";
import type { FontSubsetTarget, FontTargetName } from "./config.ts";

/**
 * subset-font 的最小调用签名。
 *
 * 该包未发布完整 TypeScript 类型，因此这里只声明官网脚本实际使用的输入输出边界，不额外增加类型依赖。
 */
type SubsetFont = (
  originalFont: Buffer,
  text: string,
  options: {
    targetFormat: "woff2";
    preserveNameIds?: number[];
  },
) => Promise<Buffer>;

const require = createRequire(import.meta.url);
const subsetFont = require("subset-font") as SubsetFont;

/**
 * 读取由字符抽取步骤生成的文本。
 *
 * @returns 传给 HarfBuzz subsetter 的最终字符文本。
 */
export async function readSubsetText(): Promise<string> {
  const chars = await readFile(OUTPUT_CHARS_FILE, "utf8").catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") {
      throw new Error("缺少 scripts/font-subset/chars.txt，请先运行 npm run font:extract。");
    }

    throw error;
  });

  const text = chars.replace(/\r?\n$/u, "");

  if (!text) {
    throw new Error("scripts/font-subset/chars.txt 为空，拒绝生成空字体子集。");
  }

  return text;
}

/**
 * 格式化文件大小，便于审阅生成产物是否意外膨胀。
 *
 * @param bytes - 文件大小，单位 byte。
 * @returns 适合命令行展示的 KiB 字符串。
 */
export function formatKiB(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

/**
 * 将 CLI 参数解析为有效字体目标。
 *
 * @param rawNames - 来自 process.argv.slice(2) 的目标名称列表。
 * @returns 已校验的字体目标名称列表。
 */
export function resolveTargetNames(rawNames: string[]): FontTargetName[] {
  const targetNames = Object.keys(fontTargets) as FontTargetName[];
  const selectedNames = rawNames.length ? rawNames : targetNames;
  const invalidName = selectedNames.find((name) => !targetNames.includes(name as FontTargetName));

  if (invalidName) {
    throw new Error(`未知字体目标 ${invalidName}，可用目标: ${targetNames.join(", ")}。`);
  }

  return selectedNames as FontTargetName[];
}

/**
 * 生成单个字体面孔的 woff2 子集。
 *
 * @param name - 面孔名称，用于日志和命令行筛选。
 * @param target - 当前面孔的输入与输出路径配置。
 * @param text - chars.txt 中的最终字符文本。
 */
export async function subsetOneFont(
  name: FontTargetName,
  target: FontSubsetTarget,
  text: string,
): Promise<void> {
  const sourcePath = fromRoot(target.source);
  const outputPath = fromRoot(target.output);
  const sourceBuffer = await readFile(sourcePath).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") {
      throw new Error(
        `缺少 ${target.source}。请把已获授权的源字体放入 fonts-source/，或在 scripts/font-subset/config.ts 更新目标路径。`,
      );
    }

    throw error;
  });
  const subsetBuffer = await subsetFont(sourceBuffer, text, {
    targetFormat: "woff2",
    preserveNameIds: [1, 2, 4, 6],
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, subsetBuffer);

  const outputStats = await stat(outputPath);

  console.log(
    `[font:subset] ${name}: ${target.source} -> ${target.output} (${formatKiB(sourceBuffer.byteLength)} -> ${formatKiB(outputStats.size)})`,
  );
}

/**
 * 生成一个或多个网页字体子集。
 *
 * subset-font 使用 HarfBuzz WASM 与 fontverter 输出 woff2，避免项目构建链路依赖 Python/fonttools。
 *
 * @param targetNames - 需要生成的字体目标名称列表。
 */
export async function buildFontSubsets(targetNames: FontTargetName[]): Promise<void> {
  const text = await readSubsetText();

  for (const name of targetNames) {
    await subsetOneFont(name, fontTargets[name], text);
  }

  console.log(`[font:subset] 字符清单: ${path.relative(ROOT_DIR, OUTPUT_CHARS_FILE)}`);
}
