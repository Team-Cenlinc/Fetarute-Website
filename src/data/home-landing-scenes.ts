/** 首页 Landing 场景的稳定身份，供图片、替代文本、生成器与裁切焦点共用同一份登记。 */
export type HomeLandingSceneId =
  | "pyutocor-dusk"
  | "survival-bayside"
  | "survival-fueya"
  | "survival-kitariku-haixing-road-bridge"
  | "survival-kl-x-bridge"
  | "survival-port-pyutocor"
  | "survival-pyutocor-day"
  | "survival-pyutocor-from-mountain"
  | "survival-pyutocor-railway-avenue"
  | "survival-syuchun";

/**
 * 与构建期图片模块无关的 Landing 场景维护信息。
 * 独立为纯 TypeScript 数据，是为了让 Node 取色脚本与 Astro 页面读取同一份文件名、焦点和反光色，
 * 避免平行清单悄然漂移。
 */
export interface HomeLandingSceneDefinition {
  /** 供文案、图片模块映射与生成器共同引用的唯一键。 */
  id: HomeLandingSceneId;
  /** 位于 src/assets/pages/home/landing 的原始素材文件名，供维护脚本定位二进制图片。 */
  assetFilename: string;
  /** 图片在窄屏裁切时优先保留的视觉焦点，采用 CSS object-position 语法。 */
  focalPoint: string;
  /** 在固定桌面参考画布上从标题覆盖区预计算得到的稳定 CSS 反光色。 */
  reflectionColor: string;
  /** 场景文案投影只调整空间强度；中性阴影色由全站 palette 提供。 */
  copyShadow: {
    /** 投影边缘的模糊半径，随左侧背景的纹理复杂度收束或放开。 */
    blur: string;
    /** 投影的不透明度，用于在明亮实景上维持标题与说明的可读性。 */
    opacity: string;
  };
}

/**
 * 首页可用的受控服务器截图池。
 * 新增素材时只在这里登记文件名、焦点和反光色；图片模块和维护脚本都会据此取值。
 */
export const homeLandingSceneDefinitions: readonly HomeLandingSceneDefinition[] = [
  {
    id: "pyutocor-dusk",
    assetFilename: "survival-pyutocor-dusk.png",
    focalPoint: "center center",
    reflectionColor: "hsl(21.93deg 28.00% 72.00%)",
    copyShadow: { blur: "14px", opacity: "72%" },
  },
  {
    id: "survival-bayside",
    assetFilename: "survival-bayside.jpg",
    focalPoint: "32% center",
    reflectionColor: "hsl(27.25deg 28.00% 65.97%)",
    copyShadow: { blur: "18px", opacity: "86%" },
  },
  {
    id: "survival-fueya",
    assetFilename: "survival-fueya.jpg",
    focalPoint: "68% 58%",
    reflectionColor: "hsl(30.68deg 28.00% 72.00%)",
    copyShadow: { blur: "20px", opacity: "90%" },
  },
  {
    id: "survival-kitariku-haixing-road-bridge",
    assetFilename: "survival-kitariku-haixing-rd-bridge.jpg",
    focalPoint: "56% 55%",
    reflectionColor: "hsl(44.72deg 60.00% 72.00%)",
    copyShadow: { blur: "22px", opacity: "94%" },
  },
  {
    id: "survival-kl-x-bridge",
    assetFilename: "survival-kl-x-bridge.jpg",
    focalPoint: "57% center",
    reflectionColor: "hsl(32.69deg 28.00% 72.00%)",
    copyShadow: { blur: "20px", opacity: "90%" },
  },
  {
    id: "survival-port-pyutocor",
    assetFilename: "survival-port-pyutocor.jpg",
    focalPoint: "58% 52%",
    reflectionColor: "hsl(21.09deg 44.46% 72.00%)",
    copyShadow: { blur: "21px", opacity: "92%" },
  },
  {
    id: "survival-pyutocor-day",
    assetFilename: "survival-pyutocor-day.jpg",
    focalPoint: "58% 52%",
    reflectionColor: "hsl(221.66deg 28.00% 57.28%)",
    copyShadow: { blur: "20px", opacity: "90%" },
  },
  {
    id: "survival-pyutocor-from-mountain",
    assetFilename: "survival-pyutocor-from-mountain.jpg",
    focalPoint: "54% 52%",
    reflectionColor: "hsl(189.69deg 28.00% 59.99%)",
    copyShadow: { blur: "19px", opacity: "88%" },
  },
  {
    id: "survival-pyutocor-railway-avenue",
    assetFilename: "survival-pyutocor-rwy-avenue.jpg",
    focalPoint: "54% 64%",
    reflectionColor: "hsl(22.52deg 60.00% 62.49%)",
    copyShadow: { blur: "15px", opacity: "76%" },
  },
  {
    id: "survival-syuchun",
    assetFilename: "survival-syuchun.jpg",
    focalPoint: "52% 60%",
    reflectionColor: "hsl(14.53deg 36.03% 72.00%)",
    copyShadow: { blur: "12px", opacity: "68%" },
  },
];
