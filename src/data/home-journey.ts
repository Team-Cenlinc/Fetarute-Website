import type { Locale } from "../i18n/config.ts";
import { getRailwayLineKey, type RailwayLineKey } from "./railway.ts";
import { wayfindingPrototype } from "./site.ts";

/** 首页可被列车快选定位的章节锚点；锚点直接使用站名的稳定英文 slug。 */
export type HomeJourneySectionId = "beginning-bay" | "tri-server-joint" | "shared-shore" | "onward";

/** 首页导视使用的三语章节站名。 */
export interface HomeJourneySectionName {
  /** 简体中文路由中显示的章节站名。 */
  simplifiedChineseName: string;
  /** 繁体中文路由中显示的章节站名。 */
  traditionalChineseName: string;
  /** 英文路由中显示的章节站名。 */
  englishName: string;
}

/**
 * 两段首页章节路线之间的预留分界信息。
 * 目前页面没有需要绘制的分界或换乘，因此所有现有章节均不填写；类型先固定线路、换乘状态与可选名称，后续新增实际段落时无需改写路线数据契约。
 */
export interface HomeJourneySectionBreak {
  /** 分界后继续使用的线路；换乘时指向新线路，普通分段时可与当前线路相同。 */
  lineKey: RailwayLineKey;
  /** 是否需要在未来路线图中明确绘制换乘；不以线路色差自行推断。 */
  isTransfer: boolean;
  /** 需要展示分界名称时使用的三语名称；未提供时未来界面不应凭空补写站名。 */
  name?: HomeJourneySectionName;
}

/** 首页叙事换乘站在另一条线路上的服务记录。 */
export interface HomeJourneyTransferService {
  /** 换乘前进入本站的线路；正式线路名称与颜色仍从 railway.ts 读取。 */
  lineKey: RailwayLineKey;
  /** 本叙事站在进入线路上的站序，例如服联快线的 07。 */
  sequence: string;
}

/**
 * 首页列车快选中的一段章节路线。
 * 这是一份叙事导视数据，不等同于 railway.ts 中的实体铁路车站；因此不会污染真实运营站序。
 */
export interface HomeJourneySection {
  /** 供 URL、DOM section、客户端选中状态与数据属性共用的稳定站名锚点。 */
  id: HomeJourneySectionId;
  /** 章节所属线路；快选路线图从此字段读取当前真实线路的官方颜色。 */
  lineKey: RailwayLineKey;
  /** 章节站在各公开语言中使用的名称。 */
  name: HomeJourneySectionName;
  /** 站牌使用的真实行程序号；它包含未独立进入快选列表的叙事中间站。 */
  sequence: string;
  /** 换乘站的进入线路服务；当前 lineKey 与 sequence 则表示离站后继续阅读的线路。 */
  transferFrom?: HomeJourneyTransferService;
  /** 本章节之后的路线分界；未填写即保持当前单线连续展示且不渲染任何分界元素。 */
  breakAfter?: HomeJourneySectionBreak;
}

/** “同岸”只属于首页叙事导视，不进入实体铁路车站表。 */
const sharedShoreName: HomeJourneySectionName = {
  simplifiedChineseName: "同岸",
  traditionalChineseName: "同岸",
  englishName: "Shared Shore",
};

/** “续行”作为首页收尾换乘站，只表达继续探索，不进入实体铁路车站表。 */
const onwardName: HomeJourneySectionName = {
  simplifiedChineseName: "续行",
  traditionalChineseName: "續行",
  englishName: "Onward",
};

/**
 * 首页当前已绘制的列车章节路线。
 * 这里只登记已经存在的页面 section；“同岸”把服务器叙事换乘到玩家叙事，“续行”再把阅读方向交给探索线。
 */
export const homeJourneySections: readonly HomeJourneySection[] = [
  {
    id: "beginning-bay",
    lineKey: wayfindingPrototype.homeLineKey,
    name: wayfindingPrototype.homeArrivalStop,
    sequence: "01",
  },
  {
    id: "tri-server-joint",
    lineKey: wayfindingPrototype.homeLineKey,
    name: {
      simplifiedChineseName: "三服汇",
      traditionalChineseName: "三服匯",
      englishName: "Tri-Server Joint",
    },
    sequence: "03",
  },
  {
    id: "shared-shore",
    lineKey: getRailwayLineKey("SURN", "BS"),
    name: sharedShoreName,
    sequence: "05",
    transferFrom: {
      lineKey: wayfindingPrototype.homeLineKey,
      sequence: "07",
    },
  },
  {
    id: "onward",
    lineKey: getRailwayLineKey("SURC", "DS"),
    name: onwardName,
    sequence: "01",
    transferFrom: {
      lineKey: getRailwayLineKey("SURN", "BS"),
      sequence: "11",
    },
  },
];

/** 把受控首页章节转换为 fragment，供点击跳转与被动滚动共享同一套稳定 URL。 */
export function getHomeJourneySectionHash(
  sectionId: HomeJourneySectionId,
): `#${HomeJourneySectionId}` {
  return `#${sectionId}`;
}

/** 根据当前公开语言读取章节站名，避免组件自行散落三语字段选择规则。 */
export function getHomeJourneySectionName(section: HomeJourneySection, locale: Locale): string {
  if (locale === "zh-Hans") {
    return section.name.simplifiedChineseName;
  }

  if (locale === "zh-Hant") {
    return section.name.traditionalChineseName;
  }

  return section.name.englishName;
}

/** 按当前语言返回站牌的主副站名，保证满屏站牌与快选列表使用同一份三语数据。 */
export function getHomeJourneySectionNames(
  section: HomeJourneySection,
  locale: Locale,
): readonly [primaryName: string, secondaryName: string] {
  if (locale === "en") {
    return [section.name.englishName, section.name.simplifiedChineseName];
  }

  if (locale === "zh-Hant") {
    return [section.name.traditionalChineseName, section.name.englishName];
  }

  return [section.name.simplifiedChineseName, section.name.englishName];
}
