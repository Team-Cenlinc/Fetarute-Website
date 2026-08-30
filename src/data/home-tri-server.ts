import type { ExternalDestinationKey } from "@/data/site";
import { externalDestinations } from "@/data/site";
import {
  buildHomeTriServerImageSets,
  type HomeTriServerId,
  type HomeTriServerImage,
  type HomeTriServerImageModule,
} from "@/data/home-tri-server-media";

/** 三服汇中一个子服务器的图片清单与正式 BlueMap 入口。 */
export interface HomeTriServerDefinition {
  /** 与图片子目录、DOM 状态和三语文案共同使用的稳定身份。 */
  id: HomeTriServerId;
  /** 自动从该服务器子目录读取的图片；稳定基序会在浏览器中按访问随机化。 */
  images: readonly HomeTriServerImage[];
  /** 由全站出口配置提供的正式 BlueMap 地址。 */
  mapHref: string;
}

/** 三服汇允许绑定的地图出口；Wiki 与本段的服务器媒体无关。 */
type HomeTriServerMapKey = Extract<
  ExternalDestinationKey,
  "creativeMap" | "lobbyMap" | "survivalMap"
>;

/** 服务器身份到正式地图出口的集中映射，避免组件根据展示顺序猜测 URL。 */
const homeTriServerMapKeyById: Readonly<Record<HomeTriServerId, HomeTriServerMapKey>> = {
  creative: "creativeMap",
  lobby: "lobbyMap",
  survival: "survivalMap",
};

/**
 * Vite 在构建阶段直接读取三个约定目录中的图片。
 * 文件名只提供构建期稳定基序；浏览器会在每次访问时随机化 Carousel，无需逐张 import。
 */
const homeTriServerImageModules = import.meta.glob<HomeTriServerImageModule>(
  "../assets/pages/home/tri-server-joint/{creative,lobby,survival}/*.{avif,jpeg,jpg,png,webp}",
  { eager: true },
);
const homeTriServerImageSets = buildHomeTriServerImageSets(homeTriServerImageModules);

/** 首页三服汇的正式展示顺序；延续上一段 Gallery 的创造、大厅、生存阅读顺序。 */
const homeTriServerIds: readonly HomeTriServerId[] = ["creative", "lobby", "survival"];

/**
 * 首页三服汇的服务器媒体清单。
 * 图片来自约定目录，地图来自 site.ts；任一地图缺失都会在构建时失败，避免上线一个无法启动的空入口。
 */
export const homeTriServerDefinitions: readonly HomeTriServerDefinition[] = homeTriServerIds.map(
  (id) => {
    const mapKey = homeTriServerMapKeyById[id];
    const mapDestination = externalDestinations.maps.find(
      (destination) => destination.key === mapKey,
    );

    if (!mapDestination) {
      throw new Error(`三服汇缺少 ${id} 对应的 BlueMap 正式地址。`);
    }

    return {
      id,
      images: homeTriServerImageSets[id],
      mapHref: mapDestination.href,
    };
  },
);
