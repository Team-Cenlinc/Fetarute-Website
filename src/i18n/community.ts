import type { Locale } from "./config.ts";
import type { CommunityPartnerId, CommunityPlayerRole } from "@/data/community.ts";

/** 已确认服务器的本地化资料，避免把名称、关系、图片替代文本分散在页面组件内。 */
export interface CommunityPartnerMessages {
  description: string;
  note: string;
  status?: string;
  imageAlt: string;
}

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
  /** 灰色空格作为邀请而非加载状态，通过墙体链接向辅助技术说明含义。 */
  mosaicInvitation: string;
  mapHint: string;
  player: string;
  /** 玩家职务由资料数据提供键，显示文案在此按页面语言统一维护。 */
  playerRoles: Readonly<Record<CommunityPlayerRole, string>>;
  server: string;
  group: string;
  serverPlaceholder: string;
  communityPlaceholder: string;
  groupPlaceholder: string;
  playerIntro: string;
  partnerIntro: string;
  playerNote: string;
  partnerNote: string;
  /** 没有个人引语时使用自然说明，仍让资料卡保留完整的阅读节奏。 */
  mottoPending: string;
  /** 个人故事图片在同页模态框打开，文案与资料卡的关闭操作分开。 */
  openMedia: string;
  closeMedia: string;
  mediaPreview: string;
  pending: string;
  partnerProfiles: Readonly<Record<CommunityPartnerId, CommunityPartnerMessages>>;
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
    mosaicInvitation: "灰色空格，为未来的你留一个位置。",
    mapHint: "每一格，都是一个可以认识的邻居。悬停、聚焦或点按，看看这里的人与社群。",
    player: "玩家",
    playerRoles: {
      owner: "服主",
      administrator: "管理员",
      mayor: "镇长",
    },
    server: "服务器 / 社区",
    group: "外部团体",
    serverPlaceholder: "待相遇的世界",
    communityPlaceholder: "待相遇的社区",
    groupPlaceholder: "待相遇的同行者",
    playerIntro: "属于这位玩家的故事，仍在路上。",
    partnerIntro: "一段与另一座世界相遇的故事，仍在路上。",
    playerNote: "等待玩家投稿",
    partnerNote: "等待相遇 · 尚不代表合作关系",
    mottoPending: "这位邻居还没有留下想说的话。",
    openMedia: "放大图片",
    closeMedia: "关闭图片预览",
    mediaPreview: "图片预览",
    pending: "社区记录待收录",
    partnerProfiles: {
      urasaka: {
        description:
          "浦坂（Urasaka）是 Fetarute 在 2025 年结识的同行。他们以精细的 TrainCarts 追加技术，让列车与城市的运转多出一层耐人寻味的秩序。",
        note: "TrainCarts 追加技术",
        status: "2025 年结成友好服务器",
        imageAlt: "浦坂的城市建筑场景",
      },
      hydcraft: {
        description:
          "从修楼、铺轨到造城，HydCraft 把铁路、街区与玩家的日常编进同一张地图。在创造与模组交织的世界里，他们为共同建设留出辽阔的空间；Fetarute 自 2018 年起与他们并肩。",
        note: "2018 年结成友好服务器",
        status: "2018 年结成友好服务器",
        imageAlt: "HydCraft 标志",
      },
      nebulaecraft: {
        description:
          "星云工艺以城市与轨道交通为世界的骨架：线路穿过街区，站点串起城市，也把多周目的行驶记忆留在地图里。",
        note: "城市与轨道交通 · 历史 Wiki",
        status: "2022 年结成友好服务器",
        imageAlt: "NebulaeCraft 标志",
      },
    },
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
    mosaicInvitation: "灰色空格，為未來的你留一個位置。",
    mapHint: "每一格，都是一個可以認識的鄰居。懸停、聚焦或點按，看看這裡的人與社群。",
    player: "玩家",
    playerRoles: {
      owner: "服主",
      administrator: "管理員",
      mayor: "鎮長",
    },
    server: "伺服器 / 社區",
    group: "外部團體",
    serverPlaceholder: "待相遇的世界",
    communityPlaceholder: "待相遇的社區",
    groupPlaceholder: "待相遇的同行者",
    playerIntro: "屬於這位玩家的故事，仍在路上。",
    partnerIntro: "一段與另一座世界相遇的故事，仍在路上。",
    playerNote: "等待玩家投稿",
    partnerNote: "等待相遇 · 尚不代表合作關係",
    mottoPending: "這位鄰居還沒有留下想說的話。",
    openMedia: "放大圖片",
    closeMedia: "關閉圖片預覽",
    mediaPreview: "圖片預覽",
    pending: "社區記錄待收錄",
    partnerProfiles: {
      urasaka: {
        description:
          "浦坂（Urasaka）是 Fetarute 在 2025 年結識的同行。他們以細緻的 TrainCarts 追加技術，讓列車與城市的運轉多出一層耐人尋味的秩序。",
        note: "TrainCarts 追加技術",
        status: "2025 年結成友好伺服器",
        imageAlt: "浦坂的城市建築場景",
      },
      hydcraft: {
        description:
          "從修樓、鋪軌到造城，HydCraft 把鐵路、街區與玩家的日常編進同一張地圖。在創造與模組交織的世界裡，他們為共同建設留出遼闊的空間；Fetarute 自 2018 年起與他們並肩。",
        note: "2018 年結成友好伺服器",
        status: "2018 年結成友好伺服器",
        imageAlt: "HydCraft 標誌",
      },
      nebulaecraft: {
        description:
          "星雲工藝以城市與軌道交通為世界的骨架：線路穿過街區，站點串起城市，也把多周目的行駛記憶留在地圖裡。",
        note: "城市與軌道交通 · 歷史 Wiki",
        status: "2022 年結成友好伺服器",
        imageAlt: "NebulaeCraft 標誌",
      },
    },
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
    mosaicInvitation: "The gray squares leave room for you to join us.",
    mapHint:
      "Every plot is a neighbor to get to know. Hover over a plot, focus it with your keyboard, or tap to meet the people and communities here.",
    player: "Player",
    playerRoles: {
      owner: "Server owner",
      administrator: "Administrator",
      mayor: "Mayor",
    },
    server: "Server / Community",
    group: "External group",
    serverPlaceholder: "A world we've yet to meet",
    communityPlaceholder: "A community we've yet to meet",
    groupPlaceholder: "Fellow travelers we've yet to meet",
    playerIntro: "This player's story is still to come.",
    partnerIntro: "Our story of meeting another world is still to come.",
    playerNote: "Awaiting a submission from the player",
    partnerNote: "Yet to meet · No partnership implied",
    mottoPending: "This neighbor has not shared a personal note yet.",
    openMedia: "Enlarge image",
    closeMedia: "Close image preview",
    mediaPreview: "Image preview",
    pending: "Community profile yet to be added",
    partnerProfiles: {
      urasaka: {
        description:
          "Urasaka is a fellow community we got to know in 2025. Through their finely crafted TrainCarts extensions, they bring an intriguing sense of order to the way trains and cities run.",
        note: "TrainCarts extensions",
        status: "Friends since 2025",
        imageAlt: "A city scene from Urasaka",
      },
      hydcraft: {
        description:
          "From putting up buildings and laying track to creating entire cities, the people of HydCraft weave railways, neighborhoods and everyday player life into a shared map. In a world where creative building meets modded play, they make plenty of room to build together. Fetarute has stood alongside them since 2018.",
        note: "Friends since 2018",
        status: "Friends since 2018",
        imageAlt: "HydCraft logo",
      },
      nebulaecraft: {
        description:
          "At NebulaeCraft, cities and rail transit form the backbone of the world. Lines run through neighborhoods, stations tie the city together, and the map preserves memories of journeys across successive worlds.",
        note: "City building & rail transit · Historical Wiki",
        status: "Friends since 2022",
        imageAlt: "NebulaeCraft logo",
      },
    },
    close: "Close introduction",
    visit: "Learn more",
    guide: "Train guide: choose a section",
    current: "This stop",
    chapters: "Section map",
    home: "Back to homepage",
    contact: "Come say hello in the neighborhood",
    copy: "Copy QQ group number",
    copied: "Group number copied",
    copyFailed: "Copy failed. Please select the group number manually.",
  },
};
