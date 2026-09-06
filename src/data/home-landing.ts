import type { ImageMetadata } from "astro";
import {
  homeLandingSceneDefinitions,
  type HomeLandingSceneDefinition,
  type HomeLandingSceneId,
} from "@/data/home-landing-scenes";
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

/** 保持既有文案模块的场景身份导入路径稳定，实际定义集中在纯场景登记文件。 */
export type { HomeLandingSceneId } from "@/data/home-landing-scenes";

/**
 * Astro 构建期图片模块与纯场景登记之间的唯一映射。
 * 用稳定 id 衔接，保证页面的优化图片不会让维护脚本再维护一份文件名或裁切信息。
 */
const homeLandingImageById = {
  "pyutocor-dusk": pyutocorDuskScene,
  "survival-bayside": survivalBaysideScene,
  "survival-fueya": survivalFueyaScene,
  "survival-kitariku-haixing-road-bridge": survivalKitarikuHaixingRoadBridgeScene,
  "survival-kl-x-bridge": survivalKlXBridgeScene,
  "survival-port-pyutocor": survivalPortPyutocorScene,
  "survival-pyutocor-day": survivalPyutocorDayScene,
  "survival-pyutocor-from-mountain": survivalPyutocorFromMountainScene,
  "survival-pyutocor-railway-avenue": survivalPyutocorRailwayAvenueScene,
  "survival-syuchun": survivalSyuchunScene,
} satisfies Record<HomeLandingSceneId, ImageMetadata>;

/**
 * 适合首屏展示的一张服务器实景。
 * 纯维护数据来自同一份场景登记；这里只补上 Astro 构建阶段可优化的图片模块。
 */
export interface HomeLandingScene extends HomeLandingSceneDefinition {
  /** 由 Astro 在构建阶段优化的原始服务器截图。 */
  image: ImageMetadata;
}

/**
 * 首屏可用的受控服务器截图池。
 * 新增图片时必须一并登记其焦点，并在 messages.ts 补齐各语言的替代文本；文件夹本身不自动成为可展示内容。
 */
export const homeLandingScenes: readonly HomeLandingScene[] = homeLandingSceneDefinitions.map(
  (scene) => ({ ...scene, image: homeLandingImageById[scene.id] }),
);
