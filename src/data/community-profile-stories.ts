import type { ImageMetadata } from "astro";
import acatineGreenportBridgeMemorial from "@/assets/pages/community/players/acatine-greenport-br-memorial.png";
import katsutaMinamotoStory from "@/assets/pages/community/players/katsuta-minamoto-story.png";
import type { CommunityPlayerStoryId } from "./community.ts";
import type { Locale } from "@/i18n/config.ts";

/** 一则获许可在 Community 资料卡展示的个人故事；媒体始终从仓库本地构建。 */
export interface CommunityPlayerStory {
  /** Astro 构建期处理的原始投稿图片，供资料卡和站内放大预览共同使用。 */
  image: ImageMetadata;
  /** 图片内容的无障碍描述；随投稿语境保留，不由页面组件临时编写。 */
  imageAlt: string;
  /** 各语言页面的故事正文；英文页可保留作者投稿原文。 */
  body: Readonly<Record<Locale, string>>;
}

/** 已公开的玩家故事，以资料键而非页面组件或显示名关联。 */
const communityPlayerStories: Readonly<Record<CommunityPlayerStoryId, CommunityPlayerStory>> = {
  "acatine-greenport-br-memorial": {
    image: acatineGreenportBridgeMemorial,
    imageAlt: "夜间的 E261 型列车车窗前，Acatine 坐在暖光车厢里，窗外是深色高架桥与沿岸灯光。",
    body: {
      "zh-Hans":
        "SURnorth 的格林波特大桥正在扩容，为更多列车，也为更多初次到来的人留出位置。那晚，我坐在 E261 型列车上经过施工中的桥区，车窗把沿岸的灯光与未完成的桥梁框在一起。Fetarute 也在这样向前延伸：欢迎上车，在下一站一起看看。",
      "zh-Hant":
        "SURnorth 的格林波特大橋正在擴容，為更多列車，也為更多初次到來的人留出位置。那晚，我坐在 E261 型列車上經過施工中的橋區，車窗把沿岸的燈光與未完成的橋梁框在一起。Fetarute 也在這樣向前延伸：歡迎上車，在下一站一起看看。",
      en: "Greenport Bridge on SURnorth is being widened to make room for more trains—and more first-time visitors. One evening, I rode an E261 through the work zone, with the shoreline lights and unfinished bridge framed by the carriage window. Fetarute is much the same: the route is still growing, but you are always welcome to come aboard and see what is waiting at the next stop.",
    },
  },
  "katsuta-minamoto": {
    image: katsutaMinamotoStory,
    imageAlt: "Katsuta_Minamoto建设中的北陆城市与有轨电车夜景",
    body: {
      "zh-Hans": "美丽新北陆建设中",
      "zh-Hant": "美麗新北陸建設中",
      en: "美丽新北陆建设中",
    },
  },
};

/** 把稳定故事资料解析为当前页面可直接渲染的正文，页面层无需维护平行 UUID 映射。 */
export function getCommunityPlayerStory(storyId: CommunityPlayerStoryId, locale: Locale) {
  const story = communityPlayerStories[storyId];
  return { ...story, body: story.body[locale] };
}
