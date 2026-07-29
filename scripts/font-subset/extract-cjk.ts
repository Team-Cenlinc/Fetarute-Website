import { readFile } from "node:fs/promises";
import path from "node:path";
import { collectConfiguredSourceFiles } from "./collect.ts";
import { extractCjkCharacters, readManualCharacters, writeCharactersFile } from "./characters.ts";
import { OUTPUT_CHARS_FILE, ROOT_DIR } from "./config.ts";

/**
 * 执行 display 字体字符抽取 CLI。
 *
 * 输出字符清单不依赖完整字体，因此文案更新后可先单独运行，确认字符范围再生成二进制子集。
 */
async function main(): Promise<void> {
  const sourceFiles = await collectConfiguredSourceFiles();
  const sourceCharacters = new Set<string>();

  for (const file of sourceFiles) {
    const text = await readFile(file, "utf8");

    for (const character of extractCjkCharacters(text)) {
      sourceCharacters.add(character);
    }
  }

  if (sourceCharacters.size === 0) {
    console.warn(
      "[font:extract] warning: 源码和 Markdown 中没有抽取到 CJK 字符，请确认扫描路径或文案内容。",
    );
  }

  const manualCharacters = await readManualCharacters();
  const finalCharacters = new Set([...sourceCharacters, ...manualCharacters]);

  await writeCharactersFile(finalCharacters);

  console.log(`[font:extract] 扫描文件数: ${sourceFiles.length}`);
  console.log(`[font:extract] 源码唯一 CJK 字符数: ${sourceCharacters.size}`);
  console.log(`[font:extract] manual 合并后最终字符数: ${finalCharacters.size}`);
  console.log(`[font:extract] 输出: ${path.relative(ROOT_DIR, OUTPUT_CHARS_FILE)}`);
}

await main();
