// 配置文件会在 Astro 启动前由 Node 直接读取 site.ts，因此这里使用相对路径避免配置加载阶段没有 Vite 别名解析器。
import { getRailwayLineKey, railwayLines, type RailwayLineKey } from "./railway";

/**
 * 官网基础信息的单一数据源。
 * 页面 metadata、页眉品牌文案和首页首屏都从这里读取，避免后续改名时散落硬编码。
 */
export interface SiteInfo {
  /** 公开展示的服务器名称。 */
  name: string;
  /** 官网正式地址；canonical、社交卡片和结构化数据都从这里生成绝对 URL。 */
  url: string;
  /** 默认社交分享图片；页面没有专属封面时使用品牌图标。 */
  socialImage: string;
  /** Minecraft 服务器地址；未正式公开前保持占位。 */
  serverAddress: string;
}

/**
 * 主导航的稳定结构。
 * 文案键交给当前 locale 的消息表翻译，锚点仍集中在站点数据层，避免页面组件各自约定首页章节地址。
 */
export interface PrimaryNavItem {
  /** 对应 i18n navigation 消息中的键名。 */
  labelKey: "home" | "features" | "news" | "join";
  /** 首页中可长期引用的章节锚点。 */
  fragment: "home" | "features" | "news" | "join";
}

/**
 * 首页首屏与启动动画共用的导视配置。
 * 配置只存复合线路身份键，线路名称、站序和颜色始终从铁路数据模型读取，避免页面配置复制线路事实。
 */
export interface WayfindingPrototype {
  /** 启动序列依线路内站序播放的正式线路复合身份键。 */
  launchLineKey: RailwayLineKey;
  /** 首页导视牌的装饰性轨网信号配置；只营造网络活力，不表示首页归属某条真实线路。 */
  homeNavigationSignal: HomeNavigationSignal;
}

/**
 * 首页导视牌的装饰性轨网信号配置。
 * 候选项只保存线路身份，颜色仍由 railway.ts 派生；单线与双线等概率出现，但都不改变固定 Header 的几何。
 */
export interface HomeNavigationSignal {
  /** 可供同一浏览会话随机选择的非主线线路身份。 */
  lineKeys: readonly RailwayLineKey[];
  /** 选中双线轨道形态的概率，取值范围为 0 至 1。 */
  doubleLineProbability: number;
}

/**
 * Fetarute 官网当前的公开站点配置。
 * 真实服务器地址、品牌名或分享图片确认后优先改这里；本地化文案与 SEO 描述则集中在 i18n messages。
 */
export const siteInfo: SiteInfo = {
  name: "Fetarute",
  url: "https://www.fetarute.org",
  socialImage: "/web-app-manifest-512x512.png",
  serverAddress: "play.fetarute.example",
};

/**
 * 首页主导航的展示顺序和章节锚点。
 * 每种语言复用同一信息架构，只有 labelKey 所指向的读者文案随 locale 改变。
 */
export const primaryNavItems: readonly PrimaryNavItem[] = [
  { labelKey: "home", fragment: "home" },
  { labelKey: "features", fragment: "features" },
  { labelKey: "news", fragment: "news" },
  { labelKey: "join", fragment: "join" },
];

/**
 * 首页装饰信号的候选线路身份。
 * 灰色主线保留给真实线路语义，首页只轮换高辨识度的支线与城市线，避免 Header 在不同会话中显得失焦。
 */
const homeNavigationSignalLineKeys: readonly RailwayLineKey[] = railwayLines
  .filter((line) => line.code !== "Main")
  .map((line) => getRailwayLineKey(line.operatorCode, line.code));

/**
 * 首页首轮导视展示配置。
 * 蒲塘桥场景位于大都会线，因而启动序列以 MT 已确认的线路站序播放，避免继续使用虚构站名。
 */
export const wayfindingPrototype: WayfindingPrototype = {
  launchLineKey: getRailwayLineKey("SURC", "MT"),
  homeNavigationSignal: {
    lineKeys: homeNavigationSignalLineKeys,
    doubleLineProbability: 0.5,
  },
};
