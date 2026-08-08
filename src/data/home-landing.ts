import type { ImageMetadata } from "astro";
import pyutocorDuskScene from "@/assets/pages/home/landing/pyutocor-dusk.png";

/** 首页首屏场景的稳定身份，用于将图片、替代文本与裁切焦点保持对应。 */
export type HomeLandingSceneId = "pyutocor-dusk";

/**
 * 适合首屏随机抽取的一张服务器实景。
 * 清单只收录构图比例相近、左侧可放文案的铁路到站画面，避免随机后破坏首屏的阅读层级。
 */
export interface HomeLandingScene {
  /** 供三语替代文本和客户端选择逻辑共同引用的唯一键。 */
  id: HomeLandingSceneId;
  /** 由 Astro 在构建阶段优化的原始服务器截图。 */
  image: ImageMetadata;
  /** 图片在窄屏裁切时优先保留的视觉焦点，采用 CSS object-position 语法。 */
  focalPoint: string;
}

/**
 * 首屏可用的受控服务器截图池。
 * 新增图片时必须一并登记其焦点，并在 messages.ts 补齐各语言的替代文本；文件夹本身不自动成为可展示内容。
 */
export const homeLandingScenes: readonly HomeLandingScene[] = [
  {
    id: "pyutocor-dusk",
    image: pyutocorDuskScene,
    focalPoint: "center center",
  },
];
