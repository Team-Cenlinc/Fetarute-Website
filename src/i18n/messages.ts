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

/** 开屏小列车章节快选窗的可本地化信息架构。 */
interface HomeTrainTooltipMessage {
  /** 供键盘与触屏触发器使用的操作说明。 */
  triggerLabel: string;
  /** Tooltip 的短标题。 */
  title: string;
  /** 当前章节站名上方的短标签。 */
  currentSectionLabel: string;
  /** 下半部可点击章节路线图的名称。 */
  quickPickLabel: string;
  /** 每个章节链接在辅助技术中使用的动作前缀。 */
  goToSectionLabel: string;
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
  /** 当前两个首页章节锚点对应的导航标签。 */
  navigation: {
    home: string;
    features: string;
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
        "survival-bayside": "Fetarute 生存服的海湾聚落",
        "survival-fueya": "Fetarute 生存服中行驶于城市轨道上的列车",
        "survival-kitariku-haixing-road-bridge": "Fetarute 生存服海星路大桥的日落景观",
        "survival-kl-x-bridge": "Fetarute 生存服中跨越城区与水岸的蓝色桥梁",
        "survival-port-pyutocor": "Fetarute 生存服的浦屿港与远处天际线",
        "survival-pyutocor-day": "Fetarute 生存服的浦屿城白日天际线",
        "survival-pyutocor-from-mountain": "从山麓远望 Fetarute 生存服的浦屿城市群",
        "survival-pyutocor-railway-avenue": "Fetarute 生存服浦屿城黄昏时的铁路大道",
        "survival-syuchun": "Fetarute 生存服的绣春水岸天际线",
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
        title: "01·从一条铁路开始",
        description:
          "2017 年，Fetarute 从一座 Forge 模组铁路服务器起步。后来，我们转向原版与插件，想看看原版特性能组成怎样的新世界；三个子服务器也由此在同一套世界观中相连。",
      },
      arrival: {
        trainTooltip: {
          triggerLabel: "打开列车章节快选",
          title: "列车导览",
          currentSectionLabel: "本站",
          quickPickLabel: "章节路线",
          goToSectionLabel: "前往章节",
        },
      },
    },
    socialImageAlt: "Fetarute 服联快线导视分享卡片",
  },
  "zh-Hant": {
    description: "Fetarute 是一個正在建設中的 Minecraft 伺服器官網。",
    brandHomeLabel: "Fetarute 首頁",
    headerLabel: "網站頂部導覽",
    navigationLabel: "主要導覽",
    navigation: {
      home: "首頁",
      features: "旅程",
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
        "survival-bayside": "Fetarute 生存服的海灣聚落",
        "survival-fueya": "Fetarute 生存服中行駛於城市軌道上的列車",
        "survival-kitariku-haixing-road-bridge": "Fetarute 生存服海星路大橋的日落景觀",
        "survival-kl-x-bridge": "Fetarute 生存服中跨越城區與水岸的藍色橋樑",
        "survival-port-pyutocor": "Fetarute 生存服的浦嶼港與遠處天際線",
        "survival-pyutocor-day": "Fetarute 生存服的浦嶼城白日天際線",
        "survival-pyutocor-from-mountain": "從山麓遠望 Fetarute 生存服的浦嶼城市群",
        "survival-pyutocor-railway-avenue": "Fetarute 生存服浦嶼城黃昏時的鐵路大道",
        "survival-syuchun": "Fetarute 生存服的繡春水岸天際線",
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
        title: "01·從一條鐵路開始",
        description:
          "2017 年，Fetarute 從一座 Forge 模組鐵路伺服器起步。後來，我們轉向原版與插件，想看看原版特性能組成怎樣的新世界；三個子伺服器也由此在同一套世界觀中相連。",
      },
      arrival: {
        trainTooltip: {
          triggerLabel: "開啟列車章節快選",
          title: "列車導覽",
          currentSectionLabel: "本站",
          quickPickLabel: "章節路線",
          goToSectionLabel: "前往章節",
        },
      },
    },
    socialImageAlt: "Fetarute 服聯快線導視分享卡片",
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
        "survival-bayside": "A bayside settlement on Fetarute Survival",
        "survival-fueya": "A train travelling through a city on Fetarute Survival",
        "survival-kitariku-haixing-road-bridge":
          "Sunset at Haixing Road Bridge on Fetarute Survival",
        "survival-kl-x-bridge": "A blue bridge across the city and waterfront on Fetarute Survival",
        "survival-port-pyutocor": "Pyutocor Port and its distant skyline on Fetarute Survival",
        "survival-pyutocor-day": "Pyutocor's daytime skyline on Fetarute Survival",
        "survival-pyutocor-from-mountain": "Pyutocor seen from the foothills on Fetarute Survival",
        "survival-pyutocor-railway-avenue":
          "Railway Avenue in Pyutocor at dusk on Fetarute Survival",
        "survival-syuchun": "Syuchun's waterfront skyline on Fetarute Survival",
      },
      title: "Welcome to Fetarute.",
      description: "Your story of exploration starts here.",
      departure: {
        title: "The trip begins here.",
        description: "Tap your pass, or click empty space to continue.",
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
        title: "01 · It Started with a Railway",
        description:
          "Founded in 2017, Fetarute began as a Forge-modded railway server. We later moved to Vanilla and plugins to see what new world Vanilla itself could make possible. That world grew into three connected servers.",
      },
      arrival: {
        trainTooltip: {
          triggerLabel: "Open the train section picker",
          title: "Train wayfinding",
          currentSectionLabel: "This stop",
          quickPickLabel: "Section route",
          goToSectionLabel: "Go to section",
        },
      },
    },
    socialImageAlt: "Fetarute Serverlink wayfinding share card",
  },
};

/**
 * 读取指定语言的完整界面文案。
 * 页面、组件和 metadata 都通过同一入口消费，确保静态构建的文字与语言标签保持一致。
 */
export function getMessages(locale: Locale): SiteMessages {
  return messages[locale];
}
