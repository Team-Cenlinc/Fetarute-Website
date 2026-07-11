/**
 * 官网基础信息的单一数据源。
 * 页面 metadata、页眉品牌文案和首页首屏都从这里读取，避免后续改名时散落硬编码。
 */
export interface SiteInfo {
  /** 公开展示的服务器名称。 */
  name: string;
  /** 默认 SEO 描述；页面没有专门描述时使用它。 */
  description: string;
  /** 官网正式地址；canonical、社交卡片和结构化数据都从这里生成绝对 URL。 */
  url: string;
  /** 默认社交分享图片；页面没有专属封面时使用品牌图标。 */
  socialImage: string;
  /** Minecraft 服务器地址；未正式公开前保持占位。 */
  serverAddress: string;
}

/**
 * 顶部导航项。
 * `href` 可以先指向首页 section，等独立页面稳定后再切换为页面路由。
 */
export interface PrimaryNavItem {
  label: string;
  href: string;
}

/**
 * Fetarute 官网当前的公开站点配置。
 * 真实服务器地址、品牌名或默认 SEO 文案确认后优先改这里，布局和页面只消费该对象。
 */
export const siteInfo: SiteInfo = {
  name: "Fetarute",
  description: "Fetarute 是一个正在建设中的 Minecraft 服务器官网。",
  url: "https://www.fetarute.org",
  socialImage: "/web-app-manifest-512x512.png",
  serverAddress: "play.fetarute.example",
};

/**
 * 首页首版导航配置。
 * 早期全部指向首页 section，等公告、指南等独立页面稳定后再把对应入口升级为路由。
 */
export const primaryNavItems: PrimaryNavItem[] = [
  { label: "首页", href: "#home" },
  { label: "玩法", href: "#features" },
  { label: "公告", href: "#news" },
  { label: "加入", href: "#join" },
];
