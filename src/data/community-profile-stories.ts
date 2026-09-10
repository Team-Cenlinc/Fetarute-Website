import type { ImageMetadata } from "astro";
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
