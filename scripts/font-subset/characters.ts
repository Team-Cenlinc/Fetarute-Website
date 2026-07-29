import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cjkPattern, MANUAL_CHARS_FILE, OUTPUT_CHARS_FILE, ROOT_DIR } from "./config.ts";

/**
 * 从文本中抽取 CJK 字符。
 *
 * 自动路径只提取 CJK 字符，避免把大量 TypeScript 标识符和构建配置塞入 display 字体子集。
 *
 * @param text - 待扫描的文件内容。
 * @returns 当前文本中出现过的 CJK 字符集合。
 */
export function extractCjkCharacters(text: string): Set<string> {
  return new Set(text.match(cjkPattern) ?? []);
}

/**
 * 读取手工兜底字符表。
 *
 * manual-chars.txt 负责覆盖品牌名、拉丁字母、数字与未来页面尚未出现的短文案，从而降低发布后缺字风险。
 *
 * @returns 手工维护的字符集合；文件不存在时使用空集合继续抽取。
 */
export async function readManualCharacters(): Promise<Set<string>> {
  const manualText = await readFile(MANUAL_CHARS_FILE, "utf8").catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        console.warn(
          `[font:extract] warning: 未找到 ${path.relative(ROOT_DIR, MANUAL_CHARS_FILE)}，仅使用源码抽取结果。`,
        );

        return "";
      }

      throw error;
    },
  );

  return new Set([...manualText].filter((character) => character !== "\n" && character !== "\r"));
}

/**
 * 按 Unicode code point 稳定排序字符。
 *
 * 稳定输出能减少 chars.txt 的噪声 diff，也便于检查手工补字是否真正参与子集化。
 *
 * @param characters - 待排序字符集合。
 * @returns 稳定排序后的字符数组。
 */
export function sortCharacters(characters: Iterable<string>): string[] {
  return [...characters].sort(
    (left, right) => (left.codePointAt(0) ?? 0) - (right.codePointAt(0) ?? 0),
  );
}

/**
 * 写出 subset-font 使用的可审阅字符清单。
 *
 * @param characters - 最终合并后的字符集合。
 */
export async function writeCharactersFile(characters: Iterable<string>): Promise<void> {
  await writeFile(OUTPUT_CHARS_FILE, `${sortCharacters(characters).join("")}\n`, "utf8");
}
