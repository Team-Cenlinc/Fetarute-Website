/** 样式失效时一次测量的列车面板参数；滚动帧只消费缓存，避免每帧测字或读取计算样式。 */
export interface TrainTooltipStyle {
  preferredInlineSize: number;
  anchorGap: number;
  borderBlockSize: number;
}

/**
 * 两页共用字体与宽度测量。按全部章节测出稳定宽度，防止长站名换行或切站时面板忽宽忽窄。
 * 真实视口仍在定位阶段约束最大宽度，窄屏英文允许自然换行。
 */
export function readTrainTooltipStyle(panel: HTMLElement): TrainTooltipStyle {
  const style = getComputedStyle(panel);
  const number = (value: string) => Number.parseFloat(value) || 0;
  let preferredInlineSize =
    number(style.getPropertyValue("--home-arrival-tooltip-preferred-inline-size")) || 232;
  const title = panel.querySelector<HTMLElement>("[data-home-journey-current-name]");
  const links = [...panel.querySelectorAll<HTMLElement>("[data-home-journey-target]")];
  const context = document.createElement("canvas").getContext("2d");
  const borderInlineSize = number(style.borderLeftWidth) + number(style.borderRightWidth);

  /** 用实际字体和字距测量文本，保留末字符字距，与 CSS 行盒的宽度一致。 */
  function textWidth(text: string, textStyle: CSSStyleDeclaration) {
    if (!context) return 0;
    context.font = `${textStyle.fontWeight} ${textStyle.fontSize} ${textStyle.fontFamily}`;
    return context.measureText(text).width + [...text].length * number(textStyle.letterSpacing);
  }

  if (title?.parentElement && context) {
    const titleStyle = getComputedStyle(title);
    const headingStyle = getComputedStyle(title.parentElement);
    const headingInset = number(headingStyle.paddingLeft) + number(headingStyle.paddingRight);
    for (const link of links) {
      const name = link.dataset.homeJourneySectionName ?? link.textContent ?? "";
      preferredInlineSize = Math.max(
        preferredInlineSize,
        textWidth(name, titleStyle) + headingInset + borderInlineSize,
      );
      const label = link.querySelector<HTMLElement>(".home-journey-quick-pick__stop-label");
      const stop = link.closest<HTMLElement>("[data-home-journey-stop]");
      const map = link.closest<HTMLElement>("[data-home-journey-map]");
      if (!label || !stop || !map) continue;
      const labelStyle = getComputedStyle(label);
      const mapStyle = getComputedStyle(map);
      const rowInset =
        number(getComputedStyle(stop).paddingLeft) +
        number(mapStyle.paddingLeft) +
        number(mapStyle.paddingRight) +
        number(labelStyle.paddingLeft) +
        number(labelStyle.paddingRight);
      preferredInlineSize = Math.max(
        preferredInlineSize,
        textWidth(name, labelStyle) + rowInset + borderInlineSize,
      );
    }
  }
  return {
    preferredInlineSize: Math.ceil(preferredInlineSize),
    anchorGap: number(style.getPropertyValue("--home-arrival-tooltip-anchor-gap")) || 8,
    borderBlockSize: number(style.borderTopWidth) + number(style.borderBottomWidth),
  };
}
