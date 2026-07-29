import { buildFontSubsets, resolveTargetNames } from "./subset.ts";

/**
 * 执行网页字体子集生成 CLI。
 *
 * 不传参数时生成全部 Noto Sans 目标；传入 sc、tc、jp、display 或 display-italic 时只验证一个目标，方便逐项检查源字体。
 */
async function main(): Promise<void> {
  await buildFontSubsets(resolveTargetNames(process.argv.slice(2)));
}

await main();
