// 配置文件会在 Astro 启动前由 Node 直接读取 site.ts，因此这里使用相对路径避免配置加载阶段没有 Vite 别名解析器。
import {
  getRailwayLineKey,
  railwayLines,
  type RailwayLineColorShift,
  type RailwayLineKey,
} from "./railway.ts";

/**
 * 官网基础信息的单一数据源。
 * 页面 metadata、页眉品牌文案和首页首屏都从这里读取，避免后续改名时散落硬编码。
 */
export interface SiteInfo {
  /** 公开展示的服务器名称。 */
  name: string;
  /** 官网正式地址；canonical、社交卡片和结构化数据都从这里生成绝对 URL。 */
  url: string;
  /** 默认横向社交分享图片；页面没有专属封面时作为 Open Graph 与 Twitter Card 的预览。 */
  socialImage: string;
  /** 供 JSON-LD Organization 使用的方形品牌标记，不与横向社交预览图混用。 */
  brandImage: string;
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

/** 出口菜单中可公开访问的外部服务类型；图标由 Header 按类型统一派生，避免数据层耦合视图资产。 */
export type ExternalDestinationIcon = "wiki" | "map";

/** 外部服务的稳定身份键；i18n 只为这些键提供文案，避免展示名称影响链接归属。 */
export type ExternalDestinationKey = "wiki" | "creativeMap" | "survivalMap" | "lobbyMap";

/**
 * 外部出口服务的稳定配置。
 * 链接与功能身份集中在这里，本地化显示文案仍由 messages.ts 提供，避免 Header 重复维护第三方地址。
 */
export interface ExternalDestination {
  /** 供 i18n 文案与测试长期引用的稳定键，不使用会变更的展示名称或 URL。 */
  key: ExternalDestinationKey;
  /** 外部服务的 HTTPS 公开地址；Header 统一以新标签页打开，保留当前阅读位置。 */
  href: string;
  /** 用于快速辨识目的地类型的图标语义，而非品牌商标。 */
  icon: ExternalDestinationIcon;
}

/**
 * 出口菜单的分组信息架构。
 * Wiki 是独立的资料库入口；三张地图统一归入“在线地图”，以反映它们只是同一服务下的服务器选择。
 */
export interface ExternalDestinationMenu {
  /** 独立的知识库入口。 */
  wiki: ExternalDestination;
  /** 在线地图下按服务器划分的三个入口，顺序即菜单展示顺序。 */
  maps: readonly ExternalDestination[];
}

/**
 * 首页主视觉与导视装饰共用的配置。
 * 配置只存复合线路身份键，线路名称、站序和颜色始终从铁路数据模型读取，避免页面配置复制线路事实。
 */
export interface WayfindingPrototype {
  /** 首页主视觉使用的正式线路复合身份键；开屏动画另从全网车站库随机取站。 */
  homeLineKey: RailwayLineKey;
  /** 开屏抵达画面中的叙事站名；它是页面文案而不是铁路站序数据，避免误报为一座已录入车站。 */
  homeArrivalStop: HomeArrivalStop;
  /** 小列车由 homeLineKey 的官方色派生时采用的固定 HSL 偏移，保证它始终属于同一条线路。 */
  homeTrainColorShift: RailwayLineColorShift;
  /** 首页导视牌的装饰性轨网信号配置；只营造网络活力，不表示首页归属某条真实线路。 */
  homeNavigationSignal: HomeNavigationSignal;
}

/**
 * 首页开屏的叙事性抵达站。
 * 该站只承担首页开场的空间感，尚不进入可查询的铁路车站库或编造未确认的线路站序。
 */
export interface HomeArrivalStop {
  /** 简体中文页面中作为主站名展示的名称。 */
  simplifiedChineseName: string;
  /** 繁体中文页面中作为主站名展示的名称。 */
  traditionalChineseName: string;
  /** 英文页面中作为主站名展示的名称。 */
  englishName: string;
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
  socialImage: "/fetarute-share-card.png",
  brandImage: "/web-app-manifest-512x512.png",
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
 * 从官网离开后仍能继续了解或探索 Fetarute 的正式服务。
 * 社群和联系入口不放入 Header，后续由 Footer 承接；这里仅保留知识库与世界地图这两类探索工具。
 */
export const externalDestinations: ExternalDestinationMenu = {
  wiki: { key: "wiki", href: "https://wiki.fetarute.org", icon: "wiki" },
  maps: [
    { key: "survivalMap", href: "https://map.survival.fetarute.org", icon: "map" },
    { key: "lobbyMap", href: "https://map.lobby.fetarute.org", icon: "map" },
    { key: "creativeMap", href: "https://map.creative.fetarute.org", icon: "map" },
  ],
};

/**
 * 首页装饰信号的候选线路身份。
 * 灰色主线保留给真实线路语义，首页只轮换高辨识度的支线与城市线，避免 Header 在不同会话中显得失焦。
 */
const homeNavigationSignalLineKeys: readonly RailwayLineKey[] = railwayLines
  .filter((line) => line.code !== "Main")
  .map((line) => getRailwayLineKey(line.operatorCode, line.code));

/**
 * 首页首轮导视展示配置。
 * 开屏以服联快线作为抵达导视；启动序列仍从全网已录入车站随机取站，不把叙事站误写进真实站序。
 */
export const wayfindingPrototype: WayfindingPrototype = {
  homeLineKey: getRailwayLineKey("FTA", "SL"),
  homeArrivalStop: {
    simplifiedChineseName: "启始湾",
    traditionalChineseName: "啟始灣",
    englishName: "Beginning Bay",
  },
  homeTrainColorShift: {
    hueDegrees: -31,
    saturationPoints: -7,
    lightnessPoints: 23,
  },
  homeNavigationSignal: {
    lineKeys: homeNavigationSignalLineKeys,
    doubleLineProbability: 0.5,
  },
};
