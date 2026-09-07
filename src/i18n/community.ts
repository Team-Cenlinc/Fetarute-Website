import type { Locale } from "./config.ts";

/** 社区地图的短文案独立于首页故事，允许没有作品的玩家拥有完整、同等的个人入口。 */
export interface CommunityMessages {
  title: string;
  description: string;
  districtTitle: string;
  districtStop: string;
  contactStop: string;
  goToSection: string;
  connectionsTitle: string;
  mapLabel: string;
  mapHint: string;
  player: string;
  server: string;
  group: string;
  serverPlaceholder: string;
  communityPlaceholder: string;
  groupPlaceholder: string;
  playerIntro: string;
  partnerIntro: string;
  playerNote: string;
  partnerNote: string;
  pending: string;
  close: string;
  visit: string;
  guide: string;
  current: string;
  chapters: string;
  home: string;
  contact: string;
  copy: string;
  copied: string;
  copyFailed: string;
}

/** 三个静态语言版本共用同一地图与成员身份；占位文案明确说明不是正式合作名单。 */
export const communityMessages: Readonly<Record<Locale, CommunityMessages>> = {
  "zh-Hans": {
    title: "社区中心",
    description: "在同一片街区，认识 Fetarute 的玩家、世界与社群。",
    districtTitle: "玩家与世界",
    districtStop: "玩家与世界",
    contactStop: "打个招呼",
    goToSection: "前往",
    connectionsTitle: "世界与社群",
    mapLabel: "社区街区地图",
    mapHint: "每一格，都是一个可以认识的邻居。悬停、聚焦或点按，看看这里的人与社群。",
    player: "玩家",
    server: "服务器 / 社区",
    group: "外部团体",
    serverPlaceholder: "一处新的世界",
    communityPlaceholder: "一位社区邻居",
    groupPlaceholder: "一群同行的人",
    playerIntro: "这里留给玩家自己的介绍。喜欢什么、常在哪里，或只是想打个招呼，都可以写下来。",
    partnerIntro: "这里为未来的社群连接保留位置。名称、介绍、关系与访问地址确认后，再正式公开。",
    playerNote: "个人介绍待补充 · 不需要代表作品",
    partnerNote: "设计占位 · 尚不代表合作关系",
    pending: "资料待补充",
    close: "关闭介绍",
    visit: "前往了解",
    guide: "列车导览：选择章节",
    current: "本站",
    chapters: "章节路线",
    home: "返回首页",
    contact: "来街区打个招呼",
    copy: "复制 QQ 群号",
    copied: "群号已复制",
    copyFailed: "未能复制，请手动选择群号",
  },
  "zh-Hant": {
    title: "社區中心",
    description: "在同一片街區，認識 Fetarute 的玩家、世界與社群。",
    districtTitle: "玩家與世界",
    districtStop: "玩家與世界",
    contactStop: "打個招呼",
    goToSection: "前往",
    connectionsTitle: "世界與社群",
    mapLabel: "社區街區地圖",
    mapHint: "每一格，都是一個可以認識的鄰居。懸停、聚焦或點按，看看這裡的人與社群。",
    player: "玩家",
    server: "伺服器 / 社區",
    group: "外部團體",
    serverPlaceholder: "一處新的世界",
    communityPlaceholder: "一位社區鄰居",
    groupPlaceholder: "一群同行的人",
    playerIntro: "這裡留給玩家自己的介紹。喜歡什麼、常在哪裡，或只是想打個招呼，都可以寫下來。",
    partnerIntro: "這裡為未來的社群連結保留位置。名稱、介紹、關係與訪問地址確認後，再正式公開。",
    playerNote: "個人介紹待補充 · 不需要代表作品",
    partnerNote: "設計佔位 · 尚不代表合作關係",
    pending: "資料待補充",
    close: "關閉介紹",
    visit: "前往了解",
    guide: "列車導覽：選擇章節",
    current: "本站",
    chapters: "章節路線",
    home: "返回首頁",
    contact: "來街區打個招呼",
    copy: "複製 QQ 群號",
    copied: "群號已複製",
    copyFailed: "未能複製，請手動選擇群號",
  },
  en: {
    title: "Community Center",
    description: "Meet Fetarute's players, worlds and communities in one shared neighborhood.",
    districtTitle: "Players & worlds",
    districtStop: "Players & worlds",
    contactStop: "Say hello",
    goToSection: "Go to",
    connectionsTitle: "Worlds & communities",
    mapLabel: "Community neighborhood map",
    mapHint:
      "A neighbor in every plot. Hover, focus or tap to meet the people and communities here.",
    player: "Player",
    server: "Server / Community",
    group: "External group",
    serverPlaceholder: "A new world",
    communityPlaceholder: "A community neighbor",
    groupPlaceholder: "People along the way",
    playerIntro:
      "A place for this player's own introduction. Interests, familiar places, or simply a hello are all welcome.",
    partnerIntro:
      "A place reserved for a future community connection. Its name, introduction, relationship and address will be published once confirmed.",
    playerNote: "Introduction to come · No featured work required",
    partnerNote: "Design placeholder · Not a confirmed partnership",
    pending: "Details to come",
    close: "Close introduction",
    visit: "Visit",
    guide: "Train guide: choose a section",
    current: "This stop",
    chapters: "Section route",
    home: "Back to home",
    contact: "Say hello to the neighborhood",
    copy: "Copy QQ group number",
    copied: "Group number copied",
    copyFailed: "Copy failed. Please select the group number manually.",
  },
};
