import type { Locale } from "@/i18n/config";
import type { HomeLandingSceneId } from "@/data/home-landing";
import type { ExternalDestination } from "@/data/site";

/** 首页首段章节的可本地化正文。 */
interface HomeIntroductionMessage {
  /** 第一章的完整章节标题。 */
  title: string;
  /** 在大标题下保留一段可继续扩展的起源与概览正文。 */
  description: string;
}

/** 开屏小列车 Tooltip 的可本地化信息架构。 */
interface HomeTrainTooltipMessage {
  /** 供键盘与触屏触发器使用的操作说明。 */
  triggerLabel: string;
  /** Tooltip 的短标题。 */
  title: string;
  /** 当前所在地这一栏的标签。 */
  currentLocationLabel: string;
  /** 未来快选入口区域的标签。 */
  nextStopsLabel: string;
  /** 明确提示这是设计预留，不以空白槽位伪装成可用车站。 */
  reservedHint: string;
}

/** 首页开屏抵达画面中不属于铁路数据的界面文案。 */
interface HomeArrivalMessage {
  /** 由小列车触发的路线信息提示窗文案。 */
  trainTooltip: HomeTrainTooltipMessage;
}

/**
 * 首页「出发检票遮罩」的可本地化文案。
 * 读者以验票或主动略过两种明确选择进入第一叙事站，不能把遮罩误读为普通内容区块。
 */
interface HomeDepartureMessage {
  /** 出发遮罩的主标题。 */
  title: string;
  /** 说明验票与点击留白略过这两条进入路径的简短引导。 */
  description: string;
  /** 行程卡的两行正式名称；紧凑分行保证 Fetarute 与 TransitUnion 始终被读作同一张凭证。 */
  passName: readonly [brand: string, product: string];
  /** 黄色运营导视牌上的有效乘车记录提醒。 */
  readerNotice: string;
  /** 黄色运营导视牌上的欢迎语，与提醒保持清晰的主次层级。 */
  readerWelcome: string;
  /** Validator 屏幕顶部的设备系统名，强调这块屏幕是运营设备而不是品牌海报。 */
  screenSystemLabel: string;
  /** Validator 屏幕顶部的当前就绪状态。 */
  screenReadyLabel: string;
  /** Validator 验票完成后替代就绪状态的短标签，让状态色和文字同步切换。 */
  screenValidatedLabel: string;
  /** Validator 待机屏幕的主操作提示，说明拍卡会记录本次乘车。 */
  screenIdleAction: string;
  /** 验票成功后短暂停留在 Validator 屏幕上的结果，避免状态色与待机指令相互矛盾。 */
  screenValidatedAction: string;
  /** 增强后供键盘和读屏用户理解卡片操作的标签。 */
  cardActionLabel: string;
  /** 增强后供键盘和读屏用户理解读卡机操作的标签。 */
  readerActionLabel: string;
  /** 尚未验票时要求读者作出进入选择的即时状态。 */
  readyStatus: string;
  /** 拖动期间的即时状态。 */
  draggingStatus: string;
  /** 验票完成后的即时状态。 */
  validatedStatus: string;
  /** 点击留白可略过检票的可见提示。 */
  skipHint: string;
  /** 不验票时主动进入下一章节的控制文字。 */
  skipLabel: string;
  /** 略过检票后的即时状态，与验票成功都属于本 tab 的已通过结果。 */
  skippedStatus: string;
}

/**
 * 某一语言版本的普通界面与 SEO 文案。
 * 铁路线路、车站的 primaryName 与 secondaryName 属于领域数据，不在此处强行映射到任一语言。
 */
export interface SiteMessages {
  /** 页面没有专属 SEO 描述时使用的站点级描述。 */
  description: string;
  /** 站点 logo 返回首页的无障碍标签。 */
  brandHomeLabel: string;
  /** 固定顶部区域的无障碍标签。 */
  headerLabel: string;
  /** 固定顶部主导航的无障碍标签。 */
  navigationLabel: string;
  /** 三个首页锚点对应的导航标签。 */
  navigation: {
    home: string;
    features: string;
    news: string;
    join: string;
  };
  /** 顶栏语言切换链接组的无障碍标签。 */
  languageNavigationLabel: string;
  /** 顶栏服务导视下拉菜单的可见名称与无障碍标签。 */
  serviceDeskLabel: string;
  /** 小屏三点菜单的可见名称，明确它同时容纳站内导览与出口服务。 */
  moreMenuLabel: string;
  /** 小屏三点菜单的次级说明，避免黄色工具牌被误读为单一站内导航。 */
  moreMenuHint: string;
  /** 黄色出口牌的主要文字，桌面完整态与紧凑态共用这一外部服务语义。 */
  exitMenuLabel: string;
  /** 黄色出口牌的次级说明，明确这些链接会离开官网前往正式服务。 */
  exitMenuHint: string;
  /** 在线地图这个父级服务的名称；各服务器地图在其下以短标签选择，避免重复“地图”。 */
  onlineMapLabel: string;
  /** 外部服务的本地化显示名称；URL 与服务类型仍集中维护在 site.ts。 */
  externalDestinationLabels: Readonly<Record<ExternalDestination["key"], string>>;
  /** 新标签页链接追加给读屏用户的副作用说明。 */
  externalLinkNewTabHint: string;
  /** 服务导视中外观设置这一组的标签。 */
  appearanceNavigationLabel: string;
  /** 外观选项的本地化名称，供按钮文案与状态同步使用。 */
  appearanceOptions: {
    system: string;
    light: string;
    dark: string;
  };
  /** 启动动画的无障碍标签与跳过提示。 */
  launch: {
    label: string;
    skipLabel: string;
    skipHint: string;
  };
  /** 首页首屏与各内容区块使用的文案。 */
  home: {
    /** 每张首屏实景的替代文本，键与受控场景清单保持一一对应。 */
    sceneAltById: Readonly<Record<HomeLandingSceneId, string>>;
    title: string;
    description: string;
    /** 首屏滚动到第一叙事章时出现的一次性检票遮罩文案。 */
    departure: HomeDepartureMessage;
    /** 开屏紧接着的第一段章节正文。 */
    introduction: HomeIntroductionMessage;
    /** 开屏抵达画面中小列车的 Tooltip 文案。 */
    arrival: HomeArrivalMessage;
    newsKicker: string;
    newsTitle: string;
    joinKicker: string;
    joinTitle: string;
    joinDescription: string;
  };
  /** 默认社交分享图片的替代文本。 */
  socialImageAlt: string;
}

/**
 * 三种公开语言的界面文案。
 * `Record<Locale, SiteMessages>` 强制每次新增字段或语言时完整补齐，避免静态页面出现源语言漏网文本。
 */
const messages: Record<Locale, SiteMessages> = {
  "zh-Hans": {
    description: "Fetarute 是一个正在建设中的 Minecraft 服务器官网。",
    brandHomeLabel: "Fetarute 首页",
    headerLabel: "站点顶部导航",
    navigationLabel: "主导航",
    navigation: {
      home: "首页",
      features: "旅程",
      news: "公告",
      join: "加入",
    },
    languageNavigationLabel: "选择语言",
    serviceDeskLabel: "服务台",
    moreMenuLabel: "菜单",
    moreMenuHint: "站内导航与外部服务",
    exitMenuLabel: "出口",
    exitMenuHint: "前往外部服务",
    onlineMapLabel: "在线地图",
    externalDestinationLabels: {
      wiki: "Fetarute Wiki",
      creativeMap: "创造服",
      survivalMap: "生存服",
      lobbyMap: "大厅",
    },
    externalLinkNewTabHint: "在新标签页打开",
    appearanceNavigationLabel: "外观",
    appearanceOptions: {
      system: "跟随系统",
      light: "浅色",
      dark: "深色",
    },
    launch: {
      label: "Fetarute 启动画面",
      skipLabel: "跳过启动动画",
      skipHint: "点击任意处跳过动画",
    },
    home: {
      sceneAltById: {
        "pyutocor-dusk": "Fetarute 的暮色铁路城市景观",
      },
      title: "欢迎来到 Fetarute。",
      description: "在这里，开始属于你的探索故事。",
      departure: {
        title: "下一站，从这里开始。",
        description: "将行程卡靠近读卡机以开始旅程；也可点击留白略过此段。",
        passName: ["Fetarute", "TransitUnion"],
        readerNotice: "请确保您在登车前有有效记录。",
        readerWelcome: "欢迎您来到 Fetarute",
        screenSystemLabel: "VALIDATOR",
        screenReadyLabel: "就绪",
        screenValidatedLabel: "已验证",
        screenIdleAction: "拍卡以记录乘车",
        screenValidatedAction: "记录有效",
        cardActionLabel: "验票行程卡，开始下一站",
        readerActionLabel: "使用出发检票机，开始下一站",
        readyStatus: "行程卡已准备好。完成检票以继续。",
        draggingStatus: "将行程卡靠近出发检票机。",
        validatedStatus: "已验票。下一站：一座被连接起来的世界。",
        skipHint: "点击留白即可略过检票。",
        skipLabel: "直接进入下一站",
        skippedStatus: "已略过检票。下一站：一座被连接起来的世界。",
      },
      introduction: {
        title: "01·Fetarute 的创立与概览",
        description:
          "Fetarute 成立于 2017 年。从最初的 QQ 门户群出发，我们以铁路把地点、共同建设与每一次抵达连接起来。",
      },
      arrival: {
        trainTooltip: {
          triggerLabel: "查看列车位置与下一站快选预留区域",
          title: "列车导览",
          currentLocationLabel: "当前位置",
          nextStopsLabel: "下一站快选",
          reservedHint: "路线节点将在下一轮设计中开放。",
        },
      },
      newsKicker: "NEWS",
      newsTitle: "公告内容已经接入集合",
      joinKicker: "JOIN",
      joinTitle: "下一步补齐真实服务器信息",
      joinDescription:
        "等服务器版本、地址、白名单或身份验证流程确定后，把加入流程写进指南，再决定是否需要独立页面。",
    },
    socialImageAlt: "Fetarute 品牌图标",
  },
  "zh-Hant": {
    description: "Fetarute 是一個正在建設中的 Minecraft 伺服器官網。",
    brandHomeLabel: "Fetarute 首頁",
    headerLabel: "網站頂部導覽",
    navigationLabel: "主要導覽",
    navigation: {
      home: "首頁",
      features: "旅程",
      news: "公告",
      join: "加入",
    },
    languageNavigationLabel: "選擇語言",
    serviceDeskLabel: "服務台",
    moreMenuLabel: "選單",
    moreMenuHint: "站內導覽與外部服務",
    exitMenuLabel: "出口",
    exitMenuHint: "前往外部服務",
    onlineMapLabel: "線上地圖",
    externalDestinationLabels: {
      wiki: "Fetarute Wiki",
      creativeMap: "創造服",
      survivalMap: "生存服",
      lobbyMap: "大廳",
    },
    externalLinkNewTabHint: "在新分頁開啟",
    appearanceNavigationLabel: "外觀",
    appearanceOptions: {
      system: "跟隨系統",
      light: "淺色",
      dark: "深色",
    },
    launch: {
      label: "Fetarute 啟動畫面",
      skipLabel: "略過啟動動畫",
      skipHint: "點擊任意處略過動畫",
    },
    home: {
      sceneAltById: {
        "pyutocor-dusk": "Fetarute 的暮色鐵路城市景觀",
      },
      title: "歡迎來到 Fetarute。",
      description: "在這裡，開始屬於你的探索故事。",
      departure: {
        title: "下一站，從這裡開始。",
        description: "將行程卡靠近讀卡機以開始旅程；也可點擊留白略過此段。",
        passName: ["Fetarute", "TransitUnion"],
        readerNotice: "請確保您在登車前有有效記錄。",
        readerWelcome: "歡迎您來到 Fetarute",
        screenSystemLabel: "VALIDATOR",
        screenReadyLabel: "就緒",
        screenValidatedLabel: "已驗證",
        screenIdleAction: "拍卡以記錄乘車",
        screenValidatedAction: "記錄有效",
        cardActionLabel: "驗票行程卡，開始下一站",
        readerActionLabel: "使用出發檢票機，開始下一站",
        readyStatus: "行程卡已準備好。完成檢票以繼續。",
        draggingStatus: "將行程卡靠近出發檢票機。",
        validatedStatus: "已驗票。下一站：一座被連接起來的世界。",
        skipHint: "點擊留白即可略過檢票。",
        skipLabel: "直接進入下一站",
        skippedStatus: "已略過檢票。下一站：一座被連接起來的世界。",
      },
      introduction: {
        title: "01·Fetarute 的創立與概覽",
        description:
          "Fetarute 成立於 2017 年。從最初的 QQ 門戶群出發，我們以鐵路把地點、共同建設與每一次抵達連接起來。",
      },
      arrival: {
        trainTooltip: {
          triggerLabel: "查看列車位置與下一站快選預留區域",
          title: "列車導覽",
          currentLocationLabel: "目前位置",
          nextStopsLabel: "下一站快選",
          reservedHint: "路線節點將在下一輪設計中開放。",
        },
      },
      newsKicker: "NEWS",
      newsTitle: "公告內容已接入集合",
      joinKicker: "JOIN",
      joinTitle: "下一步補齊真實伺服器資訊",
      joinDescription:
        "待伺服器版本、位址、白名單或驗證流程確定後，把加入流程寫入指南，再決定是否需要獨立頁面。",
    },
    socialImageAlt: "Fetarute 品牌圖示",
  },
  en: {
    description:
      "Fetarute is the official website for a Minecraft server currently under construction.",
    brandHomeLabel: "Fetarute home",
    headerLabel: "Site header",
    navigationLabel: "Primary navigation",
    navigation: {
      home: "Home",
      features: "Journey",
      news: "News",
      join: "Join",
    },
    languageNavigationLabel: "Choose language",
    serviceDeskLabel: "Service desk",
    moreMenuLabel: "Menu",
    moreMenuHint: "Site navigation & external services",
    exitMenuLabel: "Exit",
    exitMenuHint: "External services",
    onlineMapLabel: "Online maps",
    externalDestinationLabels: {
      wiki: "Fetarute Wiki",
      creativeMap: "Creative",
      survivalMap: "Survival",
      lobbyMap: "Lobby",
    },
    externalLinkNewTabHint: "opens in a new tab",
    appearanceNavigationLabel: "Appearance",
    appearanceOptions: {
      system: "System",
      light: "Light",
      dark: "Dark",
    },
    launch: {
      label: "Fetarute launch sequence",
      skipLabel: "Skip launch sequence",
      skipHint: "Click anywhere to skip",
    },
    home: {
      sceneAltById: {
        "pyutocor-dusk": "Fetarute railway city at dusk",
      },
      title: "Welcome to Fetarute.",
      description: "Your story of exploration starts here.",
      departure: {
        title: "The next stop begins here.",
        description:
          "Bring the journey pass to the reader to begin; click the empty space to skip this transition.",
        passName: ["Fetarute", "TransitUnion"],
        readerNotice: "Please ensure you have a valid record before boarding.",
        readerWelcome: "Welcome to Fetarute",
        screenSystemLabel: "VALIDATOR",
        screenReadyLabel: "READY",
        screenValidatedLabel: "VALIDATED",
        screenIdleAction: "Tap your card to record your ride",
        screenValidatedAction: "RECORD VALID",
        cardActionLabel: "Validate the journey pass and begin the next stop",
        readerActionLabel: "Use the departure reader and begin the next stop",
        readyStatus: "The journey pass is ready. Validate it to continue.",
        draggingStatus: "Bring the journey pass toward the departure reader.",
        validatedStatus: "Validated. Next stop: a world connected together.",
        skipHint: "Click the empty space to skip validation.",
        skipLabel: "Enter the next stop",
        skippedStatus: "Validation skipped. Next stop: a world connected together.",
      },
      introduction: {
        title: "01 · Fetarute's origin & overview",
        description:
          "Founded in 2017, Fetarute began with a QQ gateway group. Railways connect its places, collective building, and every arrival along the way.",
      },
      arrival: {
        trainTooltip: {
          triggerLabel: "View the train position and reserved next-stop shortcuts",
          title: "Train wayfinding",
          currentLocationLabel: "Current location",
          nextStopsLabel: "Next-stop shortcuts",
          reservedHint: "Route stops will be added in the next design pass.",
        },
      },
      newsKicker: "NEWS",
      newsTitle: "News is already connected to a collection",
      joinKicker: "JOIN",
      joinTitle: "Complete the real server details next",
      joinDescription:
        "When the version, address, whitelist, or verification flow is confirmed, document joining in a guide before deciding whether it needs its own page.",
    },
    socialImageAlt: "Fetarute brand mark",
  },
};

/**
 * 读取指定语言的完整界面文案。
 * 页面、组件和 metadata 都通过同一入口消费，确保静态构建的文字与语言标签保持一致。
 */
export function getMessages(locale: Locale): SiteMessages {
  return messages[locale];
}
