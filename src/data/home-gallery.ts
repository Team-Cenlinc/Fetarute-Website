import type { ImageMetadata } from "astro";
import earlyFetaruteSyapoleCity from "@/assets/pages/home/beginning-bay/early-fetarute-syapole-city.png";
import huayuanLobbyCenter from "@/assets/pages/home/beginning-bay/huayuan-lobby-center.png";
import pyutocorSpawnBay from "@/assets/pages/home/beginning-bay/pyutocor-spawn-bay.png";

/** 首页铁路回顾 Gallery 的稳定图片身份，用于关联素材、三语说明与替代文本。 */
export type HomeGallerySceneId =
  "early-fetarute-syapole-city" | "pyutocor-spawn-bay" | "huayuan-lobby-center";

/** 一张由纵向阅读进度带过视口的铁路回顾图片。 */
export interface HomeGalleryScene {
  /** URL 与三语文案共同引用的稳定键，不使用可能调整的显示标题作为身份。 */
  id: HomeGallerySceneId;
  /** 由 Astro 在构建阶段输出 AVIF/WebP 的服务器原始截图。 */
  image: ImageMetadata;
  /** 卡片在不同宽高比下裁切时优先保留的视觉主体。 */
  focalPoint: string;
}

/**
 * “从一条铁路开始”之后的受控图片顺序。
 * 第一张与 Figma 67:259 使用同一原图；后两张按旧服连快线华园站、蒲塘桥的阅读顺序展开。
 */
export const homeGalleryScenes: readonly HomeGalleryScene[] = [
  {
    id: "early-fetarute-syapole-city",
    image: earlyFetaruteSyapoleCity,
    focalPoint: "center center",
  },
  {
    id: "huayuan-lobby-center",
    image: huayuanLobbyCenter,
    focalPoint: "center center",
  },
  {
    id: "pyutocor-spawn-bay",
    image: pyutocorSpawnBay,
    focalPoint: "center center",
  },
];
