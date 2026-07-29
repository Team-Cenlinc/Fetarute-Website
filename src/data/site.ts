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
 * 导视原型使用的一条站名记录。
 * 当前名称只用于建立启动节奏和中英文字重关系，世界观与正式线路确认后在这里整体替换。
 */
export interface WayfindingStop {
  /** 站牌主文字，优先用中文维持首屏的本地阅读节奏。 */
  name: string;
  /** 站牌副文字，为导视提供紧凑的拉丁文字层级。 */
  latinName: string;
}

/**
 * 启动动画和页眉共用的导视原型数据。
 * 集中维护可让后续导入真实线路、站名与配色时不必改动页面或组件结构。
 */
export interface WayfindingPrototype {
  /** 页眉左侧的线路代号，作为视觉定位点而非服务器实时状态。 */
  routeCode: string;
  /** 页眉中展示的线路名称。 */
  routeName: string;
  /** 启动阶段依次闪现的站名。 */
  launchStops: readonly WayfindingStop[];
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

/**
 * 首轮导视视觉的可替换内容。
 * 这些是版式原型，不代表已确定的服务器地名或实际铁路线路。
 */
export const wayfindingPrototype: WayfindingPrototype = {
  routeCode: "FT",
  routeName: "FETARUTE LINE",
  launchStops: [
    { name: "起点", latinName: "ORIGIN" },
    { name: "北港", latinName: "NORTH PIER" },
    { name: "云杉", latinName: "SPRUCE" },
    { name: "石桥", latinName: "STONE BRIDGE" },
    { name: "回声谷", latinName: "ECHO VALLEY" },
    { name: "信号所", latinName: "SIGNAL BOX" },
    { name: "河岸", latinName: "RIVERBANK" },
    { name: "远山", latinName: "DISTANT RIDGE" },
    { name: "灯塔", latinName: "LANTERN" },
    { name: "终端", latinName: "TERMINAL" },
    { name: "钟楼", latinName: "CLOCKTOWER" },
    { name: "Fetarute", latinName: "NEXT STOP" },
  ],
};
