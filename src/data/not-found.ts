import type { InfoCategory } from "@/data/info-palette";
import type { Locale } from "@/i18n/config";

/**
 * 换乘目录的去向与牌面顺序：宽屏从左到右，窄屏从左上到右下。
 * 首页排第一并使用出口黄，是整页唯一的主操作；Wiki 会离开官网，因此放在最后一格。
 */
export const notFoundTransferKeys = ["home", "community", "info", "wiki"] as const;

/** 换乘目录去向的稳定身份；链接、图标与文案由页面按身份从既有站点数据和消息表派生。 */
export type NotFoundTransferKey = (typeof notFoundTransferKeys)[number];

/**
 * 按失败地址推测读者原本想去的资讯页章节。
 * 只覆盖站内真实存在的内容路由前缀，推测落空时页面不显示任何建议，而不是给出一个似是而非的去向。
 */
export interface NotFoundSuggestion {
  /** 失败路径去掉语言段之后的第一段，例如 `/zh-Hans/guides/old-spawn/` 中的 `guides`。 */
  readonly segment: string;
  /** 推荐前往的资讯页章节；它同时是资讯页锚点，并决定导视色块与图标。 */
  readonly category: Extract<InfoCategory, "news" | "game">;
}

/** 指南与公告两个内容路由各自对应资讯页里的同名章节。 */
export const notFoundSuggestions: readonly NotFoundSuggestion[] = [
  { segment: "guides", category: "game" },
  { segment: "news", category: "news" },
];

/**
 * 根 404 跳转到语言错误页之前暂存失败地址所用的 sessionStorage 键。
 * 静态托管只在根 404 能看到原始路径；跳转后语言错误页从这里取回它，URL 仍保持干净的 `/<locale>/404/`。
 */
export const notFoundRequestStorageKey = "fetarute.not-found-request";

/** 404 页面在不同语言下使用的完整可见文案。 */
export interface NotFoundMessages {
  /** 浏览器标签页与无障碍文档标题中使用的页面名称。 */
  readonly title: string;
  /** noindex 页面仍保留准确描述，方便读者与辅助技术理解当前状态。 */
  readonly description: string;
  /** 大号状态码下的主提示，明确这是尚未建设的站点而非服务故障。 */
  readonly heading: string;
  /** 失败地址上方的引导语；地址本身由脚本从根 404 暂存的路径写入。 */
  readonly requestedLabel: string;
  /** 换乘目录的标题；另一套文字的同名标题作为副行，与站内三格的双语牌面一致。 */
  readonly transfersLabel: string;
  /** 按地址推测出资讯页章节时，建议链接前的引导语。 */
  readonly suggestionLabel: string;
  /** 返回首页的目的地名称：换乘目录的主操作与页尾的返回操作共用这一份文案。 */
  readonly homeLabel: string;
  /**
   * 牌面副行使用的另一套文字：中文页给出英文，英文页给出简体中文，与真实车站的双语牌面一致。
   * 副行文案直接取该语言自己的牌面名称，因此两种文字始终指向同一个目的地。
   */
  readonly subtitleLocale: Locale;
  /** 页尾里前往本语言资讯页的次要操作。 */
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
    requestedLabel: "你要前往的地址",
    transfersLabel: "换乘指引",
    suggestionLabel: "你可能在找",
    homeLabel: "返回首页",
    subtitleLocale: "en",
    infoLabel: "看看资讯",
    footerTitle: "线路中断，路网仍在延伸。",
    footerDescription: "回到首页重新选择方向，或者去资讯看看最近开通了什么。",
  },
  "zh-Hant": {
    title: "路線未找到",
    description: "這條 Fetarute 路線尚未鋪設。返回首頁，從已知的站點繼續出發。",
    heading: "暫未建設的車站",
    requestedLabel: "你要前往的網址",
    transfersLabel: "轉乘指引",
    suggestionLabel: "你可能在找",
    homeLabel: "返回首頁",
    subtitleLocale: "en",
    infoLabel: "看看資訊",
    footerTitle: "線路中斷，路網仍在延伸。",
    footerDescription: "回到首頁重新選擇方向，或者去資訊看看最近開通了什麼。",
  },
  en: {
    title: "Route not found",
    description:
      "This Fetarute route has not been laid yet. Return home and continue from a known station.",
    heading: "Station not built yet",
    requestedLabel: "You were heading to",
    transfersLabel: "Transfers",
    suggestionLabel: "You may be looking for",
    homeLabel: "Back to Home",
    subtitleLocale: "zh-Hans",
    infoLabel: "Read the news",
    footerTitle: "The line stops here. The network grows on.",
    footerDescription:
      "Head home to pick another direction, or read the news to see what has just opened.",
  },
};
