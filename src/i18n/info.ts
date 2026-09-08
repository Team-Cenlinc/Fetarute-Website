import type { Locale } from "@/i18n/config";

/** Info navigation and reading copy; operational facts come from content and site data. */
interface InfoMessages {
  title: string;
  description: string;
  navigation: string;
  sections: Record<"status" | "news" | "game" | "other", string>;
  statusNote: string;
  statusDashboard: string;
  unavailable: string;
  online: string;
  players: string;
  playersUnavailable: string;
  serverNavigation: string;
  newsNote: string;
  noNews: string;
  pinned: string;
  read: string;
  maps: string;
  mapNote: string;
  openMap: string;
  wiki: string;
  wikiNote: string;
  openWiki: string;
  otherNote: string;
  join: string;
  joinNote: string;
  community: string;
  communityNote: string;
  backHome: string;
  backInfo: string;
  top: string;
  footerTitle: string;
  footerDescription: string;
  published: string;
  updated: string;
}

export const infoMessages: Record<Locale, InfoMessages> = {
  "zh-Hans": {
    title: "营运资讯",
    description: "查询 Fetarute 服务器状态、最近公告、在线地图与游戏资料。",
    navigation: "信息页章节导视",
    sections: { status: "服务器运行状态", news: "最近情报", game: "游戏资讯", other: "其他信息" },
    statusNote: "本页的游戏在线状态与玩家人数暂不可用。综合服务状态可前往状态站查看。",
    statusDashboard: "查看综合状态站",
    unavailable: "暂不可用",
    online: "在线玩家",
    players: "玩家详情",
    playersUnavailable: "暂时无法获取在线玩家名单。",
    serverNavigation: "按服务器定位",
    newsNote: "来自 Fetarute 的更新与公告。",
    noNews: "暂时没有公告。",
    pinned: "置顶",
    read: "阅读公告",
    maps: "在线地图",
    mapNote: "从地图出发，看看各个世界正在发生什么。",
    openMap: "打开地图",
    wiki: "资料与指南",
    wikiNote: "前往 Fetarute Wiki，查阅游戏资料与建设记录。",
    openWiki: "前往 Wiki",
    otherNote: "初次到访，或想再认识一下这里。",
    join: "准备加入？",
    joinNote: "前往首页出发厅，查看加入帮助与联络入口。",
    community: "认识 Fetarute",
    communityNote: "了解三个服务器，以及我们一起建设的世界。",
    backHome: "返回首页",
    backInfo: "返回营运资讯",
    top: "返回页首",
    footerTitle: "下一站，去哪里？",
    footerDescription: "返回信息导视，或从首页继续探索 Fetarute。",
    published: "发布于",
    updated: "更新于",
  },
  "zh-Hant": {
    title: "營運資訊",
    description: "查詢 Fetarute 伺服器狀態、最近公告、線上地圖與遊戲資料。",
    navigation: "資訊頁章節導視",
    sections: { status: "伺服器運行狀態", news: "最近情報", game: "遊戲資訊", other: "其他資訊" },
    statusNote: "本頁的遊戲線上狀態與玩家人數暫不可用。綜合服務狀態可前往狀態站查看。",
    statusDashboard: "查看綜合狀態站",
    unavailable: "暫不可用",
    online: "線上玩家",
    players: "玩家詳情",
    playersUnavailable: "暫時無法取得線上玩家名單。",
    serverNavigation: "按伺服器定位",
    newsNote: "來自 Fetarute 的更新與公告。",
    noNews: "暫時沒有公告。",
    pinned: "置頂",
    read: "閱讀公告",
    maps: "線上地圖",
    mapNote: "從地圖出發，看看各個世界正在發生什麼。",
    openMap: "開啟地圖",
    wiki: "資料與指南",
    wikiNote: "前往 Fetarute Wiki，查閱遊戲資料與建設紀錄。",
    openWiki: "前往 Wiki",
    otherNote: "初次到訪，或想再認識一下這裡。",
    join: "準備加入？",
    joinNote: "前往首頁出發廳，查看加入協助與聯絡入口。",
    community: "認識 Fetarute",
    communityNote: "了解三個伺服器，以及我們一起建設的世界。",
    backHome: "返回首頁",
    backInfo: "返回營運資訊",
    top: "返回頁首",
    footerTitle: "下一站，去哪裡？",
    footerDescription: "返回資訊導視，或從首頁繼續探索 Fetarute。",
    published: "發佈於",
    updated: "更新於",
  },
  en: {
    title: "Operation Information",
    description:
      "Find Fetarute server status, recent announcements, world maps and game resources.",
    navigation: "Information page sections",
    sections: {
      status: "Server status",
      news: "Latest news",
      game: "Game information",
      other: "Other information",
    },
    statusNote:
      "Status data is currently unavailable. Connect in game to check server availability.",
    unavailable: "Unavailable",
    online: "Players online",
    players: "Player details",
    playersUnavailable: "The online player list is currently unavailable.",
    statusDashboard: "Visit the status dashboard",
    serverNavigation: "Jump to a server",
    newsNote: "Updates and announcements from Fetarute.",
    noNews: "No announcements yet.",
    pinned: "Pinned",
    read: "Read announcement",
    maps: "World maps",
    mapNote: "Start with a map. See what is taking shape in each world.",
    openMap: "Open map",
    wiki: "Resources & guides",
    wikiNote: "Visit the Fetarute Wiki for game resources and building records.",
    openWiki: "Visit the Wiki",
    otherNote: "For your first visit, or a closer look around.",
    join: "Ready to join?",
    joinNote: "Head to the home page departure hall for joining help and contact details.",
    community: "Meet Fetarute",
    communityNote: "Get to know our three servers and the worlds we build together.",
    backHome: "Back to home",
    backInfo: "Back to information",
    top: "Back to top",
    footerTitle: "Where to next?",
    footerDescription: "Return to the information directory, or explore Fetarute from home.",
    published: "Published",
    updated: "Updated",
  },
};
