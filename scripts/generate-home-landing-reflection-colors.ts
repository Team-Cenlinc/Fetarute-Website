import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/**
 * 取色使用首页桌面设计稿的 1920 × 1080 参考画布。这个矩形对应现有中文标题的实际
 * 覆盖区（左侧 7.5vw gutter、520px 最大行宽及两行 100px 行高）。固定参考画布使素材
 * 维护结果不再随访问者的字体加载、窗口尺寸或设备像素比改变。
 */
const reference = {
  width: 1920,
  height: 1080,
  title: { left: 144, top: 692, width: 520, height: 200 },
} as const;

const scenes = [
  ["pyutocor-dusk", "survival-pyutocor-dusk.png", "center center"],
  ["survival-bayside", "survival-bayside.jpg", "32% center"],
  ["survival-fueya", "survival-fueya.jpg", "68% 58%"],
  ["survival-kitariku-haixing-road-bridge", "survival-kitariku-haixing-rd-bridge.jpg", "56% 55%"],
  ["survival-kl-x-bridge", "survival-kl-x-bridge.jpg", "57% center"],
  ["survival-port-pyutocor", "survival-port-pyutocor.jpg", "58% 52%"],
  ["survival-pyutocor-day", "survival-pyutocor-day.jpg", "58% 52%"],
  ["survival-pyutocor-from-mountain", "survival-pyutocor-from-mountain.jpg", "54% 52%"],
  ["survival-pyutocor-railway-avenue", "survival-pyutocor-rwy-avenue.jpg", "54% 64%"],
  ["survival-syuchun", "survival-syuchun.jpg", "52% 60%"],
] as const;

const assetDirectory = fileURLToPath(new URL("../src/assets/pages/home/landing/", import.meta.url));

const positionRatio = (value: string) => {
  if (value === "left" || value === "top") return 0;
  if (value === "right" || value === "bottom") return 1;
  if (value === "center") return 0.5;
  const percentage = Number.parseFloat(value);
  return Number.isFinite(percentage) ? Math.min(1, Math.max(0, percentage / 100)) : 0.5;
};

const pixelHsl = (red: number, green: number, blue: number) => {
  const [r, g, b] = [red / 255, green / 255, blue / 255];
  const maximum = Math.max(r, g, b);
  const minimum = Math.min(r, g, b);
  const delta = maximum - minimum;
  const lightness = (maximum + minimum) / 2;
  if (delta === 0) return { hue: 0, saturation: 0, lightness };
  const sector =
    maximum === r
      ? ((g - b) / delta) % 6
      : maximum === g
        ? (b - r) / delta + 2
        : (r - g) / delta + 4;
  return {
    hue: (sector * 60 + 360) % 360,
    saturation: delta / (1 - Math.abs(2 * lightness - 1)),
    lightness,
  };
};

/** 与原浏览器 getTitleReflectionColor 相同的筛选、权重及 HSL 收束规则。 */
export const getTitleReflectionColor = async (imagePath: string, focalPoint: string) => {
  const metadata = await sharp(imagePath).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`无法读取图片尺寸：${imagePath}`);

  const coverScale = Math.max(reference.width / metadata.width, reference.height / metadata.height);
  const renderedWidth = metadata.width * coverScale;
  const renderedHeight = metadata.height * coverScale;
  const [horizontal = "center", vertical = "center"] = focalPoint.split(" ");
  const sourceLeft =
    (reference.title.left - (reference.width - renderedWidth) * positionRatio(horizontal)) /
    coverScale;
  const sourceTop =
    (reference.title.top - (reference.height - renderedHeight) * positionRatio(vertical)) /
    coverScale;
  const sourceWidth = reference.title.width / coverScale;
  const sourceHeight = reference.title.height / coverScale;
  const left = Math.max(0, Math.floor(sourceLeft));
  const top = Math.max(0, Math.floor(sourceTop));
  const width = Math.min(metadata.width - left, Math.max(1, Math.ceil(sourceWidth)));
  const height = Math.min(metadata.height - top, Math.max(1, Math.ceil(sourceHeight)));
  const { data } = await sharp(imagePath)
    .extract({ left, top, width, height })
    // 原实现把整个 1920 × 1080 画布最长边压到 192px；标题区因此等比为 52px 宽。
    .resize({ width: Math.min(52, width), withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let hueX = 0;
  let hueY = 0;
  let saturationTotal = 0;
  let lightnessTotal = 0;
  let weightTotal = 0;
  for (let index = 0; index < data.length; index += 12) {
    const { hue, saturation, lightness } = pixelHsl(data[index], data[index + 1], data[index + 2]);
    if (saturation < 0.14 || lightness < 0.12 || lightness > 0.92) continue;
    const weight = saturation * (0.35 + lightness * 0.65);
    const angle = (hue * Math.PI) / 180;
    hueX += Math.cos(angle) * weight;
    hueY += Math.sin(angle) * weight;
    saturationTotal += saturation * weight;
    lightnessTotal += lightness * weight;
    weightTotal += weight;
  }
  if (weightTotal === 0) throw new Error(`标题取样区没有合格像素：${imagePath}`);
  const hue = ((Math.atan2(hueY, hueX) * 180) / Math.PI + 360) % 360;
  const saturation = Math.min(0.6, Math.max(0.28, (saturationTotal / weightTotal) * 0.9));
  const lightness = Math.min(0.72, Math.max(0.5, lightnessTotal / weightTotal + 0.3));
  return `hsl(${hue.toFixed(2)}deg ${(saturation * 100).toFixed(2)}% ${(lightness * 100).toFixed(2)}%)`;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  for (const [id, filename, focalPoint] of scenes) {
    const color = await getTitleReflectionColor(path.join(assetDirectory, filename), focalPoint);
    console.log(`${id}: ${color}`);
  }
}
