import type { Locale } from "@/i18n/config";
import type { HomeLandingSceneId } from "@/data/home-landing";

/** 首页玩法说明中的单个信息模块文案。 */
interface HomeFeatureMessage {
  /** 信息模块标题。 */
  title: string;
  /** 说明当前技术或内容边界的简短正文。 */
  description: string;
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
  /** 黄色出口牌的主要文字，入口菜单与可见站牌共用同一名称。 */
  destinationMenuLabel: string;
  /** 黄色出口牌的次级说明，提示读者这里收纳更多站内去向。 */
  destinationMenuHint: string;
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
    featuresKicker: string;
    featuresTitle: string;
    features: readonly [HomeFeatureMessage, HomeFeatureMessage, HomeFeatureMessage];
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
      features: "玩法",
      news: "公告",
      join: "加入",
    },
    languageNavigationLabel: "选择语言",
    serviceDeskLabel: "服务台",
    destinationMenuLabel: "出口",
    destinationMenuHint: "前往菜单、各网站",
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
      featuresKicker: "FEATURES",
      featuresTitle: "先保留内容架构，不急着堆交互",
      features: [
        {
          title: "内容优先",
          description:
            "规则、指南和公告通过 Astro Content Collections 管理，便于后续扩展独立页面。",
        },
        {
          title: "静态发布",
          description: "默认 SSG，适合官网首屏和长内容页面，也方便部署到静态托管环境。",
        },
        {
          title: "按需交互",
          description: "在线人数、地图或复制服务器地址这类功能后续可以作为 island 独立加入。",
        },
      ],
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
      features: "玩法",
      news: "公告",
      join: "加入",
    },
    languageNavigationLabel: "選擇語言",
    serviceDeskLabel: "服務台",
    destinationMenuLabel: "出口",
    destinationMenuHint: "前往選單、各網站",
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
      featuresKicker: "FEATURES",
      featuresTitle: "先保留內容架構，不急著堆疊互動",
      features: [
        {
          title: "內容優先",
          description:
            "規則、指南和公告透過 Astro Content Collections 管理，方便後續擴充獨立頁面。",
        },
        {
          title: "靜態發佈",
          description: "預設 SSG，適合官網首屏與長篇內容，也方便部署到靜態託管環境。",
        },
        {
          title: "按需互動",
          description: "線上人數、地圖或複製伺服器位址等功能，之後可作為 island 獨立加入。",
        },
      ],
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
      features: "Features",
      news: "News",
      join: "Join",
    },
    languageNavigationLabel: "Choose language",
    serviceDeskLabel: "Service desk",
    destinationMenuLabel: "Exit",
    destinationMenuHint: "Menu & links",
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
      featuresKicker: "FEATURES",
      featuresTitle: "Keep the content architecture clear before adding interaction",
      features: [
        {
          title: "Content first",
          description:
            "Rules, guides, and news are managed with Astro Content Collections for future standalone pages.",
        },
        {
          title: "Static by default",
          description:
            "SSG suits an official landing page and long-form content while keeping static hosting straightforward.",
        },
        {
          title: "Interaction on demand",
          description:
            "Live player counts, maps, and copy-address actions can arrive later as focused islands.",
        },
      ],
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
