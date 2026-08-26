import type { ImageMetadata } from "astro";
import pyutocorDuskScene from "@/assets/pages/home/landing/survival-pyutocor-dusk.png";
import survivalBaysideScene from "@/assets/pages/home/landing/survival-bayside.jpg";
import survivalFueyaScene from "@/assets/pages/home/landing/survival-fueya.jpg";
import survivalKitarikuHaixingRoadBridgeScene from "@/assets/pages/home/landing/survival-kitariku-haixing-rd-bridge.jpg";
import survivalKlXBridgeScene from "@/assets/pages/home/landing/survival-kl-x-bridge.jpg";
import survivalPortPyutocorScene from "@/assets/pages/home/landing/survival-port-pyutocor.jpg";
import survivalPyutocorDayScene from "@/assets/pages/home/landing/survival-pyutocor-day.jpg";
import survivalPyutocorFromMountainScene from "@/assets/pages/home/landing/survival-pyutocor-from-mountain.jpg";
import survivalPyutocorRailwayAvenueScene from "@/assets/pages/home/landing/survival-pyutocor-rwy-avenue.jpg";
import survivalSyuchunScene from "@/assets/pages/home/landing/survival-syuchun.jpg";

/** 首页首屏场景的稳定身份，用于将图片、替代文本与裁切焦点保持对应。 */
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
  /** 场景文案投影只调整空间强度；中性阴影色由全站 palette 提供，避免图片数据内散落色值。 */
  copyShadow: {
    /** 投影边缘的模糊半径，随左侧背景的纹理复杂度收束或放开。 */
    blur: string;
    /** 投影的不透明度，用于在明亮实景上维持标题与说明的可读性。 */
    opacity: string;
  };
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
    copyShadow: { blur: "14px", opacity: "72%" },
  },
  {
    id: "survival-bayside",
    image: survivalBaysideScene,
    focalPoint: "32% center",
    copyShadow: { blur: "18px", opacity: "86%" },
  },
  {
    id: "survival-fueya",
    image: survivalFueyaScene,
    focalPoint: "68% 58%",
    copyShadow: { blur: "20px", opacity: "90%" },
  },
  {
    id: "survival-kitariku-haixing-road-bridge",
    image: survivalKitarikuHaixingRoadBridgeScene,
    focalPoint: "56% 55%",
    copyShadow: { blur: "22px", opacity: "94%" },
  },
  {
    id: "survival-kl-x-bridge",
    image: survivalKlXBridgeScene,
    focalPoint: "57% center",
    copyShadow: { blur: "20px", opacity: "90%" },
  },
  {
    id: "survival-port-pyutocor",
    image: survivalPortPyutocorScene,
    focalPoint: "58% 52%",
    copyShadow: { blur: "21px", opacity: "92%" },
  },
  {
    id: "survival-pyutocor-day",
    image: survivalPyutocorDayScene,
    focalPoint: "58% 52%",
    copyShadow: { blur: "20px", opacity: "90%" },
  },
  {
    id: "survival-pyutocor-from-mountain",
    image: survivalPyutocorFromMountainScene,
    focalPoint: "54% 52%",
    copyShadow: { blur: "19px", opacity: "88%" },
  },
  {
    id: "survival-pyutocor-railway-avenue",
    image: survivalPyutocorRailwayAvenueScene,
    focalPoint: "54% 64%",
    copyShadow: { blur: "15px", opacity: "76%" },
  },
  {
    id: "survival-syuchun",
    image: survivalSyuchunScene,
    focalPoint: "52% 60%",
    copyShadow: { blur: "12px", opacity: "68%" },
  },
];
