import type { Locale } from "@/i18n/config";

/**
 * 断线导视的总段数：第一段保留完整线路，其余是断开后的虚线段。
 * 段数只服务于首屏节奏，与已录入线路条数无关，因此固定在数据层而不跟随 railwayLines 漂移；
 * `not-found.css` 的 `.not-found__route` 网格列数与此常量一一对应，改动时两处同步。
 */
export const notFoundRouteSegmentCount = 10;

/** 404 页面在不同语言下使用的完整可见文案。 */
export interface NotFoundMessages {
  /** 浏览器标签页与无障碍文档标题中使用的页面名称。 */
  readonly title: string;
  /** noindex 页面仍保留准确描述，方便读者与辅助技术理解当前状态。 */
  readonly description: string;
  /** 大号状态码下的主提示，明确这是尚未建设的站点而非服务故障。 */
  readonly heading: string;
  /** 返回本站语言首页的主要操作。 */
  readonly homeLabel: string;
  /** 出口导视牌的副行：始终给出另一套文字里的同一个目的地，与真实车站的双语牌面一致。 */
  readonly homeSubtitle: string;
  /** 副行所用的文字语言；与页面语言不同，需要它来切换字体并让读屏用正确的语音朗读。 */
  readonly homeSubtitleLocale: Locale;
  /** 前往本语言资讯页的次要操作。 */
  readonly infoLabel: string;
  /** 沉浸首屏之后页尾的收束标题，交代线路网络仍在延伸。 */
  readonly footerTitle: string;
  /** 页尾正文，把读者交回首页或资讯两个真实存在的目的地。 */
  readonly footerDescription: string;
}

/**
 * 静态 404 页面使用独立文案表，避免错误状态混入首页或内容集合的正常叙事。
 * 三份文字都对应同一组行动目标，确保不同语言不会误导读者去往不存在的路由。
 */
export const notFoundMessages: Readonly<Record<Locale, NotFoundMessages>> = {
  "zh-Hans": {
    title: "路线未找到",
    description: "这条 Fetarute 路线尚未铺设。返回首页，从已知的站点继续出发。",
    heading: "暂未建设的车站",
    homeLabel: "返回首页",
    homeSubtitle: "Back to Home",
    homeSubtitleLocale: "en",
    infoLabel: "看看资讯",
    footerTitle: "线路中断，路网仍在延伸。",
    footerDescription: "回到首页重新选择方向，或者去资讯看看最近开通了什么。",
  },
  "zh-Hant": {
    title: "路線未找到",
    description: "這條 Fetarute 路線尚未鋪設。返回首頁，從已知的站點繼續出發。",
    heading: "暫未建設的車站",
    homeLabel: "返回首頁",
    homeSubtitle: "Back to Home",
    homeSubtitleLocale: "en",
    infoLabel: "看看資訊",
    footerTitle: "線路中斷，路網仍在延伸。",
    footerDescription: "回到首頁重新選擇方向，或者去資訊看看最近開通了什麼。",
  },
  en: {
    title: "Route not found",
    description:
      "This Fetarute route has not been laid yet. Return home and continue from a known station.",
    heading: "Station not built yet",
    homeLabel: "Back to Home",
    homeSubtitle: "返回首页",
    homeSubtitleLocale: "zh-Hans",
    infoLabel: "Read the news",
    footerTitle: "The line stops here. The network grows on.",
    footerDescription:
      "Head home to pick another direction, or read the news to see what has just opened.",
  },
};
