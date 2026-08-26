import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { interfacePalette } from "../src/data/palette.ts";
import {
  getRailwayLineKey,
  railwayLineByKey,
  railwayLines,
  type RailwayLine,
} from "../src/data/railway.ts";

const cardWidth = 1200;
const cardHeight = 630;
/** 固定分享卡沿用正式深色画布，避免导出脚本另存一份近似背景色。 */
const shareCardScrimColor = interfacePalette.dark.canvas;
/** Logo 使用全站首屏前景色，在图片遮罩上维持与官网一致的浅色品牌标记。 */
const shareCardLogoColor = interfacePalette.light.onHero;

/** 读取分享卡片必须存在的服联快线，缺失时在构建期明确失败而不生成伪造的主线色。 */
function getRequiredPrimaryLine(): RailwayLine {
  const line = railwayLineByKey.get(getRailwayLineKey("FTA", "SL"));

  if (!line) {
    throw new Error("无法生成分享卡片：服联快线未录入铁路数据。");
  }

  return line;
}

const primaryLine = getRequiredPrimaryLine();

/**
 * 分享图中显示的彩带颜色。
 * 服联快线始终处于第一位，其余颜色从真实线路数据依序补入；卡片只借用它们的导视色，不展示线路代码、站序或网络图。
 */
const shareCardLines: readonly RailwayLine[] = [
  primaryLine,
  ...railwayLines.filter((line) => line !== primaryLine),
].slice(0, 3);

/**
 * 生成分享图底部的静态线路彩带。
 * 彩带只保留官网导视色的轻量印象，不能被理解为真实线路图、站序或地图地理位置。
 */
function createRibbonOverlaySvg(lines: readonly RailwayLine[]): Buffer {
  const ribbons = lines
    .map((line, index) => {
      const startY = 488 + index * 46;
      const middleY = 550 - index * 44;
      const endY = 536 + index * 28;

      return `<path d="M -80 ${startY} C 220 ${startY - 70}, 420 ${middleY + 86}, 690 ${middleY} S 1010 ${endY - 92}, 1280 ${endY}" fill="none" stroke="${line.color}" stroke-width="${12 - index * 3}" stroke-linecap="round" stroke-opacity="${0.68 - index * 0.08}" />`;
    })
    .join("\n");

  return Buffer.from(
    `
    <svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}">
      <defs>
        <linearGradient id="share-card-scrim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${shareCardScrimColor}" stop-opacity="0.62" />
          <stop offset="0.5" stop-color="${shareCardScrimColor}" stop-opacity="0.4" />
          <stop offset="1" stop-color="${shareCardScrimColor}" stop-opacity="0.62" />
        </linearGradient>
      </defs>
      <rect width="${cardWidth}" height="${cardHeight}" fill="url(#share-card-scrim)" />
      ${ribbons}
    </svg>`,
    "utf8",
  );
}

/**
 * 合成可供社交爬虫稳定抓取的 1200×630 PNG。
 * 输出总是同一路径和同一内容；更新实景、Logo 或铁路数据时由构建重新生成，而不是在分享请求时随机变化。
 */
async function buildSocialCard(): Promise<void> {
  const landingScenePath = fileURLToPath(
    new URL("../src/assets/pages/home/landing/survival-pyutocor-dusk.png", import.meta.url),
  );
  const logoPath = fileURLToPath(
    new URL("../src/assets/fetarute-branding/fetarute-logo.svg", import.meta.url),
  );
  const outputPath = fileURLToPath(new URL("../public/fetarute-share-card.png", import.meta.url));
  const logoSvg = (await readFile(logoPath, "utf8")).replaceAll("currentColor", shareCardLogoColor);
  const logoPng = await sharp(Buffer.from(logoSvg)).resize({ width: 458 }).png().toBuffer();

  await sharp(landingScenePath)
    .resize(cardWidth, cardHeight, { fit: "cover", position: "centre" })
    .composite([
      { input: createRibbonOverlaySvg(shareCardLines) },
      { input: logoPng, left: 371, top: 262 },
    ])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);
}

await buildSocialCard();
