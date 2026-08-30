/**
 * 首页实景的格式等效质量：WebP 沿用常见的 0.85 观感，AVIF 使用 65 避免同值 85 带来的异常膨胀。
 * 两种格式的质量刻度并不等价，因此不能机械共享同一个数字。
 */
export const homeSceneryImageQuality = {
  avif: 65,
  webp: 85,
} as const;

/** 三服车窗在手机、常规桌面与高密度桌面上的受控输出宽度。 */
export const homeTriServerImageWidths = [480, 960, 1600] as const;

/** 铁路回顾 Gallery 按卡片的移动端、常规桌面与大屏宽度生成候选。 */
export const homeGalleryImageWidths = [640, 1280, 1920] as const;

/** Landing 全屏实景覆盖常规手机、桌面与较高分辨率桌面。 */
export const homeLandingImageWidths = [960, 1600, 2560] as const;

/**
 * 根据源图宽度与页面上限生成递增、去重的响应式候选。
 * 最终候选始终等于源图与页面上限中的较小值，避免只有过小图片可选。
 */
export function getHomeSceneryOutputWidths(
  sourceWidth: number,
  maximumWidth: number,
  preferredWidths: readonly number[],
): number[] {
  const finalWidth = Math.min(sourceWidth, maximumWidth);
  const outputWidths = preferredWidths.filter((width) => width > 0 && width <= finalWidth);

  return [...new Set([...outputWidths, finalWidth])].sort((left, right) => left - right);
}
