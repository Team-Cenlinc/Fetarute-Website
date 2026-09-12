import type { Locale } from "@/i18n/config";

/** Info navigation and reading copy; operational facts come from content and site data. */
interface InfoMessages {
  title: string;
  description: string;
  navigation: string;
  sections: Record<"status" | "news" | "game" | "other", string>;
  statusNote: string;
  statusCopy: {
    entry: string;
    loading: string;
    online: string;
    offline: string;
    healthy: string;
    unhealthy: string;
    checked: string;
    failed: string;
    emptySample: string;
    noPlayers: string;
    sampleNote: string;
    serverNames: Record<"creative" | "lobby" | "survival", string>;
  };
  statusDashboard: string;
  unavailable: string;
  online: string;
  players: string;
  playersUnavailable: string;
  serverNavigation: string;
  newsNote: string;
  noNews: string;
  newsSlider: string;
  previousNews: string;
  nextNews: string;
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
  authors: string;
  published: string;
  updated: string;
}

export const infoMessages: Record<Locale, InfoMessages> = {
  "zh-Hans": {
    statusCopy: {
      entry: "Fetarute 联机状态",
      loading: "正在查看联机状态…",
      online: "在线",
      offline: "离线",
      healthy: "运行正常",
      unhealthy: "状态异常",
      checked: "更新于",
      failed: "暂时无法查看状态。你可以稍后再来，或前往服务状态站。",
      noPlayers: "当前没有玩家在线。",
      emptySample: "暂时无法显示玩家名单。",
      sampleNote: "名单可能不完整，在线人数以上方为准。",
      serverNames: { creative: "创造", lobby: "大厅", survival: "生存" },
    },
    title: "玩家资讯",
    description: "查看 Fetarute 联机状态与最新公告，打开世界地图，查找游戏指南和加入方式。",
    navigation: "浏览玩家资讯",
    sections: { status: "联机状态", news: "最新公告", game: "地图与指南", other: "加入与探索" },
    statusNote: "出发前，看看这里的联机情况。每 5 分钟自动更新。",
    statusDashboard: "查看服务状态",
    unavailable: "暂时无法查看",
    online: "在线玩家",
    players: "看看谁在线",
    playersUnavailable: "暂时无法显示玩家名单。",
    serverNavigation: "查看各服状态",
    newsNote: "这里记录最近的更新与公告。",
    noNews: "还没有发布公告。",
    newsSlider: "浏览最新公告",
    previousNews: "查看上一条公告",
    nextNews: "查看下一条公告",
    pinned: "置顶",
    read: "阅读公告",
    maps: "世界地图",
    mapNote: "沿着线路，看看大家建起的城市与风景。",
    openMap: "打开地图",
    wiki: "游戏指南",
    wikiNote: "想了解玩法，或查阅建设记录？到 Wiki 找找答案。",
    openWiki: "浏览 Wiki",
    otherNote: "第一次来？从这里认识 Fetarute，找到加入的方式。",
    join: "加入 Fetarute",
    joinNote: "查看如何加入，以及在哪里联系我们。",
    community: "认识这里",
    communityNote: "走进创造、大厅与生存，了解我们一起建设的世界。",
    backHome: "返回首页",
    backInfo: "返回玩家资讯",
    top: "回到页首",
    footerTitle: "下一站，去哪里？",
    footerDescription: "回到首页，继续探索 Fetarute 的世界。",
    authors: "作者：",
    published: "发布于",
    updated: "更新于",
  },
  "zh-Hant": {
    statusCopy: {
      entry: "Fetarute 連線狀態",
      loading: "正在查看連線狀態…",
      online: "線上",
      offline: "離線",
      healthy: "運作正常",
      unhealthy: "狀態異常",
      checked: "更新於",
      failed: "暫時無法查看狀態。你可以稍後再來，或前往服務狀態站。",
      noPlayers: "目前沒有玩家在線上。",
      emptySample: "暫時無法顯示玩家名單。",
      sampleNote: "名單可能不完整，線上人數以上方為準。",
      serverNames: { creative: "創造", lobby: "大廳", survival: "生存" },
    },
    title: "玩家資訊",
    description: "查看 Fetarute 連線狀態與最新公告，開啟世界地圖，查找遊戲指南和加入方式。",
    navigation: "瀏覽玩家資訊",
    sections: { status: "連線狀態", news: "最新公告", game: "地圖與指南", other: "加入與探索" },
    statusNote: "出發前，看看這裡的連線情況。每 5 分鐘自動更新。",
    statusDashboard: "查看服務狀態",
    unavailable: "暫時無法查看",
    online: "線上玩家",
    players: "看看誰在線上",
    playersUnavailable: "暫時無法顯示玩家名單。",
    serverNavigation: "查看各服狀態",
    newsNote: "這裡記錄最近的更新與公告。",
    noNews: "還沒有發布公告。",
    newsSlider: "瀏覽最新公告",
    previousNews: "查看上一則公告",
    nextNews: "查看下一則公告",
    pinned: "置頂",
    read: "閱讀公告",
    maps: "世界地圖",
    mapNote: "沿著路線，看看大家建起的城市與風景。",
    openMap: "開啟地圖",
    wiki: "遊戲指南",
    wikiNote: "想了解玩法，或查閱建設紀錄？到 Wiki 找找答案。",
    openWiki: "瀏覽 Wiki",
    otherNote: "第一次來？從這裡認識 Fetarute，找到加入的方式。",
    join: "加入 Fetarute",
    joinNote: "查看如何加入，以及在哪裡聯絡我們。",
    community: "認識這裡",
    communityNote: "走進創造、大廳與生存，了解我們一起建設的世界。",
    backHome: "返回首頁",
    backInfo: "返回玩家資訊",
    top: "回到頁首",
    footerTitle: "下一站，去哪裡？",
    footerDescription: "回到首頁，繼續探索 Fetarute 的世界。",
    authors: "作者：",
    published: "發布於",
    updated: "更新於",
  },
  en: {
    statusCopy: {
      entry: "Fetarute network status",
      loading: "Checking network status…",
      online: "Online",
      offline: "Offline",
      healthy: "Running normally",
      unhealthy: "Experiencing issues",
      checked: "Updated",
      failed:
        "We can’t check the status right now. Try again later or visit the service status page.",
      noPlayers: "No players are online right now.",
      emptySample: "Player names aren’t available right now.",
      sampleNote: "Some names may be missing. See the count above for the total online.",
      serverNames: { creative: "Creative", lobby: "Lobby", survival: "Survival" },
    },
    title: "Player info",
    description:
      "Check Fetarute network status and announcements, explore the world maps, and find game guides and ways to join.",
    navigation: "Browse player info",
    sections: {
      status: "Network status",
      news: "Announcements",
      game: "Maps & guides",
      other: "Join & explore",
    },
    statusNote: "Check in before you set off. Status updates every 5 minutes.",
    unavailable: "Status unavailable",
    online: "Players online",
    players: "See who’s online",
    playersUnavailable: "Player names aren’t available right now.",
    statusDashboard: "View service status",
    serverNavigation: "Check each server",
    newsNote: "The latest updates and announcements from Fetarute.",
    noNews: "No announcements yet.",
    newsSlider: "Browse latest announcements",
    previousNews: "View previous announcement",
    nextNews: "View next announcement",
    pinned: "Pinned",
    read: "Read announcement",
    maps: "World maps",
    mapNote: "Follow the lines through the cities and landscapes we’ve built together.",
    openMap: "Open map",
    wiki: "Game guides",
    wikiNote: "Looking for game guides or building records? Start with the Wiki.",
    openWiki: "Browse the Wiki",
    otherNote: "New here? Get to know Fetarute and find your way in.",
    join: "Join Fetarute",
    joinNote: "Find out how to join and where to get in touch.",
    community: "Get to know us",
    communityNote: "Explore Creative, Lobby and Survival, and the worlds we build together.",
    backHome: "Back to homepage",
    backInfo: "Back to player info",
    top: "Back to top",
    footerTitle: "Where to next?",
    footerDescription: "Return home and keep exploring the worlds of Fetarute.",
    authors: "By",
    published: "Published",
    updated: "Updated",
  },
};
