import type { Locale } from "../i18n/config.ts";
import { externalDestinations, siteInfo, statusDashboardUrl } from "./site.ts";

/** WebMCP 对外查询的稳定资源站点身份；不使用 URL 作为键，避免链接迁移破坏代理调用。 */
export type WebMcpResourceKey =
  "wiki" | "status-dashboard" | "survival-map" | "lobby-map" | "creative-map";

/** 一项可由浏览器代理取得的公开资源。 */
export interface WebMcpResource {
  /** 供 JSON Schema 和自动化测试使用的稳定资源键。 */
  key: WebMcpResourceKey;
  /** 代理和读者都可理解的资源名称，不把内部服务代号暴露为操作指令。 */
  title: string;
  /** 资源的正式 HTTPS 地址；与网页中实际链接共用同一来源。 */
  url: string;
  /** 帮助代理判断资源是否符合用户目的的简短用途说明。 */
  description: string;
}

/** WebMCP 可定位的站内主页面身份；公告与指南的单篇 URL 由文章目录提供，这里只保留三个长期存在的导览页。 */
export type WebMcpPageKey = "home" | "community" | "info";

/** 一项可由代理解析为本地化绝对 URL 的公开页面。 */
export interface WebMcpPage {
  /** 供 JSON Schema 和自动化测试使用的稳定页面键。 */
  key: WebMcpPageKey;
  /** 相对 locale 根目录的页面路径；首页以空字符串表示，避免重复拼接斜杠。 */
  path: "" | "community/" | "info/";
  /** 代理和读者都可理解的页面名称。 */
  title: string;
  /** 帮助代理选择合适页面的简短用途说明。 */
  description: string;
}

/**
 * WebMCP 能返回的正式资源。
 * 链接全部复用 site.ts 中现有对外入口，因此代理、Header 与页面正文不会分别维护不同版本的地址。
 */
export const webMcpResources: readonly WebMcpResource[] = [
  {
    key: "wiki",
    title: "Fetarute Wiki",
    url: externalDestinations.wiki.href,
    description: "Official knowledge base for detailed Fetarute information.",
  },
  {
    key: "status-dashboard",
    title: "Fetarute Status Dashboard",
    url: statusDashboardUrl,
    description: "Official public service-status dashboard.",
  },
  {
    key: "survival-map",
    title: "Fetarute Survival Map",
    url: externalDestinations.maps.find((destination) => destination.key === "survivalMap")!.href,
    description: "Interactive map for the Survival world.",
  },
  {
    key: "lobby-map",
    title: "Fetarute Lobby Map",
    url: externalDestinations.maps.find((destination) => destination.key === "lobbyMap")!.href,
    description: "Interactive map for the Lobby world.",
  },
  {
    key: "creative-map",
    title: "Fetarute Creative Map",
    url: externalDestinations.maps.find((destination) => destination.key === "creativeMap")!.href,
    description: "Interactive map for the Creative world.",
  },
];

/**
 * WebMCP 能解析的站内页面。
 * 页面仍由 Astro 的静态多语言路由生成；这里只描述可供代理查询的公开入口，不创建客户端路由状态机。
 */
export const webMcpPages: readonly WebMcpPage[] = [
  {
    key: "home",
    path: "",
    title: "Fetarute Home",
    description: "Community overview and the three connected Minecraft worlds.",
  },
  {
    key: "community",
    path: "community/",
    title: "Fetarute Community",
    description: "People, servers, and community connections.",
  },
  {
    key: "info",
    path: "info/",
    title: "Fetarute Information",
    description: "Service status, maps, news, official resources, and a link to the joining guide.",
  },
];

/**
 * 供 WebMCP 概览工具返回的公开事实。
 * 刻意不包含 siteInfo.serverAddress：该值仍是占位，不能借由代理接口被误读为可加入的服务器地址。
 */
export const webMcpPublicOverview = {
  name: siteInfo.name,
  website: siteInfo.url,
  summary:
    "Fetarute is a Minecraft community built around railways, collaborative construction, and exploration.",
  worlds: ["Lobby", "Survival", "Creative"],
  serverAccess:
    "Fetarute is a private server with an application and review process. Submit the application form in the QQ portal group and wait for review; the group provides the next steps. Use find-fetarute-page with page=info and your preferred locale to reach the joining guide. This tool does not return a group number or game-server address, or guarantee availability or version compatibility.",
} as const;

/** WebMCP 文章目录覆盖的内容集合；与 `src/content.config.ts` 的集合名保持一致，便于代理按内容类型收窄检索。 */
export type WebMcpArticleCollection = "guides" | "news";

/**
 * 一篇已发布文章在 WebMCP 目录中的公开描述。
 * 只包含 frontmatter 已校验的标题、摘要与实际静态路由，不携带正文；正文由读者在页面上阅读，避免代理复述未经审阅的长文。
 */
export interface WebMcpArticle {
  /** 文章所属集合，使代理可以区分长期指南与时效公告。 */
  collection: WebMcpArticleCollection;
  /** 跨语言共享的稳定文章标识，同时也是静态路由的 slug。 */
  translationKey: string;
  /** 本条目实际使用的语言；每种语言是独立条目，不做跨语言回退。 */
  locale: Locale;
  /** frontmatter 中的文章标题。 */
  title: string;
  /** frontmatter 中的文章摘要，供代理判断是否符合读者意图。 */
  description: string;
  /** 该语言版本的正式绝对 URL，与 Astro 生成的静态页面一致。 */
  url: string;
  /** 同一 translationKey 实际存在的全部语言，使代理能如实说明翻译覆盖情况。 */
  availableLocales: readonly Locale[];
  /** 公告的发布时间（ISO 字符串）；指南没有该字段。 */
  publishedAt?: string;
  /** 公告的最近更新时间（ISO 字符串）；未标注更新时缺省。 */
  updatedAt?: string;
  /** 公告是否被置顶；指南没有该字段。 */
  pinned?: boolean;
}
