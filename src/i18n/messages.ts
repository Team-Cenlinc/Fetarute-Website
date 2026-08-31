import type { Locale } from "@/i18n/config";
import type {
  HomeCommunityFeatureStoryId,
  HomeCommunityPresenceStoryId,
} from "@/data/home-community";
import type { HomeGallerySceneId } from "@/data/home-gallery";
import type { HomeLandingSceneId } from "@/data/home-landing";
import type { HomeTriServerId } from "@/data/home-tri-server-media";
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
  /** 桌面精细指针设备显示的列车悬停提示。 */
  hoverHint: string;
  /** 触屏与粗指针设备显示的列车轻触提示。 */
  tapHint: string;
  /** Tooltip 的短标题。 */
  title: string;
  /** 当前章节站名上方的短标签。 */
  currentSectionLabel: string;
  /** 下半部可点击章节路线图的名称。 */
  quickPickLabel: string;
  /** 每个章节链接在辅助技术中使用的动作前缀。 */
  goToSectionLabel: string;
  /** 固定打开后用于明确关闭快选面板的按钮名称。 */
  closeLabel: string;
}

/** 首页开屏抵达画面中不属于铁路数据的界面文案。 */
interface HomeArrivalMessage {
  /** 由小列车触发的路线信息提示窗文案。 */
  trainTooltip: HomeTrainTooltipMessage;
}

/** Gallery 单张图片的可见标题与无障碍说明。 */
interface HomeGallerySceneMessage {
  /** 图片标题上方的时期或服务器归属。 */
  kicker: string;
  /** 叠放在图片左上角的场景名称。 */
  title: string;
  /** 不重复标题、同时说明画面主体的替代文本。 */
  alt: string;
}

/** “从一条铁路开始”之后的响应式图片回顾文案。 */
interface HomeGalleryMessage {
  /** 无可见总标题时供辅助技术辨识 Gallery 区域的名称。 */
  label: string;
  /** 每张受控图片按稳定 scene id 关联的三语文案。 */
  sceneById: Readonly<Record<HomeGallerySceneId, HomeGallerySceneMessage>>;
}

/** 三服汇中一个子服务器的名称、角色定位与暂定简介。 */
interface HomeTriServerWorldMessage {
  /** 当前语言中的服务器名称。 */
  name: string;
  /** 车窗旁用于快速理解服务器角色的一句话。 */
  tagline: string;
  /** 只介绍其在 Fetarute 整体中位置的短正文，不展开玩法说明。 */
  description: string;
  /** 选定正式图片前后均可复用的场景替代文本前缀。 */
  imageAltPrefix: string;
}

/** 三服汇车窗、Carousel 与按需 BlueMap 入口共用的本地化文案。 */
interface HomeTriServerMessage {
  /** 辅助技术用于辨识整段三服介绍的名称。 */
  label: string;
  /** 第一站正文上方解释三服关系的短引子。 */
  lead: string;
  /** 图片目录仍为空时显示在车窗中的占位标题。 */
  placeholderTitle: string;
  /** 告知维护者和读者图片将后续补入的占位说明。 */
  placeholderHint: string;
  /** Carousel 上一张图片按钮的标签。 */
  previousSlideLabel: string;
  /** Carousel 下一张图片按钮的标签。 */
  nextSlideLabel: string;
  /** 当前图片序号模板；组件替换 {current} 与 {total}。 */
  slideStatusTemplate: string;
  /** 用户请求尚未缓存的下一张图片时显示的等待说明。 */
  imageLoadingLabel: string;
  /** 目标图片无法完成解码时显示的可恢复错误说明。 */
  imageLoadErrorLabel: string;
  /** 桌面车窗等待下一服务器首张图片时显示的过渡说明。 */
  serverLoadingLabel: string;
  /** BlueMap 启动卡的主标题。 */
  mapCardTitle: string;
  /** 解释地图只在用户主动选择后载入的短文。 */
  mapCardDescription: string;
  /** 小屏不嵌入 BlueMap 时使用的外部打开标题。 */
  mapExternalCardTitle: string;
  /** 小屏解释地图将在新标签页打开的短文。 */
  mapExternalCardDescription: string;
  /** 在当前车窗中启动交互地图的按钮文字。 */
  mapLaunchLabel: string;
  /** 退出交互地图并返回 Carousel 的按钮文字。 */
  mapCloseLabel: string;
  /** iframe 首次连接 BlueMap 时显示的加载标题。 */
  mapLoadingTitle: string;
  /** 加载界面解释等待原因并提示仍可退出的短文。 */
  mapLoadingDescription: string;
  /** iframe 无法使用或小屏需要独立浏览时的外部链接文字。 */
  mapExternalLabel: string;
  /** BlueMap iframe 标题中追加的功能说明。 */
  mapFrameLabel: string;
  /** 三个服务器按稳定身份关联的本地化内容。 */
  serverById: Readonly<Record<HomeTriServerId, HomeTriServerWorldMessage>>;
}

/** 同岸单条故事的标题、短叙事、媒体说明与署名。 */
interface HomeCommunityStoryMessage {
  /** 标题上方说明这条内容在同岸中的叙事作用。 */
  label: string;
  /** 首页中保持一至两行的故事标题。 */
  title: string;
  /** 只建立故事弧线的短正文；完整经过留给社区页。 */
  description: string;
  /** 主故事滚动到阅读态或短故事主段之后出现的补充正文。 */
  detail: string;
  /** 图片补入前后都必须准确描述媒体内容的替代文本。 */
  imageAlt: string;
  /** 真实参与者确认后替换的公开署名。 */
  credit: string;
}

/** 首页同岸社群章节的三语内容框架。 */
interface HomeCommunityMessage {
  /** 无可见总标题时供辅助技术辨识同岸社群章节的名称。 */
  label: string;
  /** 换乘后与线路支线相连的章节短标题。 */
  introHeading: string;
  /** 章节短标题之后承担社群价值主张的主句。 */
  statement: string;
  /** 从社群价值主张自然引向规划建设主故事的桥接文案。 */
  introduction: string;
  /** 故事署名前的统一可见标签。 */
  creditLabel: string;
  /** 图片与短故事折叠层在收起时使用的准确操作提示。 */
  storyOpenLabel: string;
  /** 图片与短故事折叠层在展开时使用的准确操作提示。 */
  storyCloseLabel: string;
  /** 头像与玩家名组合的读屏前缀，视觉上只保留轻量名字提示。 */
  playerLabel: string;
  /** SURcentral 主故事与 2026 跨年片段的固定文案。 */
  featureStoryById: Readonly<Record<HomeCommunityFeatureStoryId, HomeCommunityStoryMessage>>;
  /** 每次页面载入随机选择、且刷新时避开立即重复的一组日常贡献文案。 */
  presenceStoryById: Readonly<Record<HomeCommunityPresenceStoryId, HomeCommunityStoryMessage>>;
  /** 集体署名区域的收束标题。 */
  closingTitle: string;
  /** 把各类日常参与重新收束到共同生活价值的短文。 */
  closingDescription: string;
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
    /** 正文之后由原生滚动控制的响应式图片回顾。 */
    gallery: HomeGalleryMessage;
    /** 三服汇章节的三站介绍、车窗 Carousel 与 BlueMap 文案。 */
    triServer: HomeTriServerMessage;
    /** 同岸以一个主故事、一个纪念片段和一个页面随机片段介绍玩家社群。 */
    community: HomeCommunityMessage;
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
          "2017 年，Fetarute 从一座 Forge 模组铁路服务器起步。后来，承载世界的方式从模组转向原版与插件，铁路却一直留在旅程里。眼前的三处风景，来自如今彼此相连的三个子服务器；沿着服联快线继续前行，我们会在下一站认识它们。",
      },
      arrival: {
        trainTooltip: {
          triggerLabel: "打开列车章节快选",
          hoverHint: "悬停预览；点击固定旅程导航",
          tapHint: "轻触列车，打开旅程导航",
          title: "列车导览",
          currentSectionLabel: "本站",
          quickPickLabel: "章节路线",
          goToSectionLabel: "前往章节",
          closeLabel: "关闭列车导览",
        },
      },
      gallery: {
        label: "铁路回顾图片廊",
        sceneById: {
          "kaihin-shukukai-station": {
            kicker: "创造服",
            title: "抵达海滨宿海",
            alt: "创造服海滨宿海站的站牌与高架站体",
          },
          "pyutocor-spawn-bay": {
            kicker: "生存服",
            title: "蒲塘桥风光",
            alt: "蒲塘桥高架铁路与城市天际线",
          },
          "huayuan-lobby-center": {
            kicker: "大厅服",
            title: "旧服连快线华园站",
            alt: "旧服连快线列车停靠在华园站站台旁",
          },
        },
      },
      triServer: {
        label: "Fetarute 三个子服务器",
        lead: "铁路没有让三个世界变得相同，而是让它们能够彼此抵达。",
        placeholderTitle: "图片展示区",
        placeholderHint: "代表图片将在选定后从服务器素材目录自动载入。",
        previousSlideLabel: "上一张图片",
        nextSlideLabel: "下一张图片",
        slideStatusTemplate: "第 {current} / {total} 张",
        imageLoadingLabel: "正在准备下一张风景…",
        imageLoadErrorLabel: "图片暂时无法载入，请稍后重试",
        serverLoadingLabel: "正在准备下一站风景…",
        mapCardTitle: "从车窗进入实时地图",
        mapCardDescription: "地图只会在你主动选择后载入；退出后将回到当前图片位置。",
        mapExternalCardTitle: "在新标签页查看实时地图",
        mapExternalCardDescription:
          "移动端不在页面内嵌地图；选择下方入口后，将在新标签页打开这个世界的实时地图。",
        mapLaunchLabel: "启动交互地图",
        mapCloseLabel: "退出实时地图",
        mapLoadingTitle: "正在连接实时地图",
        mapLoadingDescription: "正在载入这个世界的地形与标记，你可以随时退出。",
        mapExternalLabel: "在新标签页打开",
        mapFrameLabel: "交互地图",
        serverById: {
          creative: {
            name: "创造服",
            tagline: "让想象成为可以抵达的城市",
            description:
              "创造服延续 Fetarute 自 2017 年以来的传统玩法，也是轨交城建经验积累最久的世界。人们可以自由规划街区、铺设线路，与伙伴共同把交通设施、都市与建筑群从设想变成现实。它保存着我们建设铁路城市的经验，也等待新的合作继续改变天际线。",
            imageAltPrefix: "Fetarute 创造服代表场景",
          },
          lobby: {
            name: "大厅服",
            tagline: "让每一次抵达都有下一程",
            description:
              "过去被称为门户世界的大厅服，是创造服与生存服之间的中转枢纽，也是跨服铁路的中心站。高楼与空岛保存着 Fetarute 过去的痕迹；旅人可以在这里相遇、停留，也可以重新选择方向，前往另外两个世界开始下一程。",
            imageAltPrefix: "Fetarute 大厅服代表场景",
          },
          survival: {
            name: "生存服",
            tagline: "让旅程在共同生活中延伸",
            description:
              "在生存服，铁路被视为大陆的命脉，把资源、聚落与远方连接起来。人们可以独自探索和收集，也可以与朋友共同建立小镇，让新的线路随着生活自然延伸。每一次出发都会在世界里留下痕迹，并通过跨服铁路与另外两个世界相连。",
            imageAltPrefix: "Fetarute 生存服代表场景",
          },
        },
      },
      community: {
        label: "同岸玩家故事",
        introHeading: "由相遇，到共同生活",
        statement: "我们在这里相遇，也在一次次共同参与中，让这里逐渐成为一个世界。",
        introduction:
          "世界不只由建筑与风景组成，也由一次次共同建设、共同经历与共同维系慢慢形成。下面只是其中三段。",
        creditLabel: "署名",
        storyOpenLabel: "点击图片，读这一段",
        storyCloseLabel: "收起图片中的文字",
        playerLabel: "故事中的玩家",
        featureStoryById: {
          "surcentral-rebuild": {
            label: "规划与建设",
            title: "为了让下一班车继续抵达",
            description:
              "2026 年，旧 SURcentral 的设施渐近饱和。Acatine 重新设计 SUR100 系列列车，建设者们也开始重想整套系统如何继续运转。",
            detail:
              "Hot945、Katsuta_Minamoto、LanYuvu 与 Complex_Colors 参与规划和建设；海岛线与大都会线由此铺开，让新的生活区域更容易抵达，换乘也保持清楚。列车、线路与车站并非各自完成的工程，而是在讨论、施工和试运行中被共同连接起来。玩家彼此交流、共同建设，Fetarute 也在这些持续发生的行动里，逐渐成为一个世界；SURcentral 只是其中一程。",
            imageAlt: "SURcentral 重建计划中的城市铁路与列车",
            credit: "Acatine、Hot945、Katsuta_Minamoto、LanYuvu、Complex_Colors",
          },
          "new-year-2026": {
            label: "共同经历",
            title: "一起经过",
            description:
              "玩家不只一起建设，也一起度过具体的时刻。在迎接 2026 的跨年夜，许多原本各自行走的人，在东港大桥为同一刻停下。",
            detail:
              "城市和铁路不只用来抵达目的地，也是交流、相聚和共同经历时间的地方。那张合照没有用规模定义一次活动，只留下一个简单的事实：原本有着各自路线的人，曾在同一个世界相遇，一起迎接新年，并把这一刻留了下来。",
            imageAlt: "Fetarute 玩家在东港大桥拍摄的 2026 跨年合照",
            credit: "[合照参与者与图片作者署名待核实]",
          },
          "pulan-south-extension-trial": {
            label: "共同经历",
            title: "一起经过",
            description:
              "与其他建设者一起坐上浦蓝线南延伸大港城段的试车。第一次运行不只是在检验轨道，也是在庆祝新线路完成。",
            detail:
              "在 Fetarute，试车既是检查，也是大家庆祝一段共同建设终于连通的方式。有人留意站台与线路，有人从车窗望向刚刚抵达的城市；浦蓝线南延伸大港城段的第一次经过，把分散的工作变成了所有人共享的一程。",
            imageAlt: "浦蓝线列车在南延伸大港城段进行试车",
            credit: "[试车参与者与图片作者署名待核实]",
          },
          "kitariku-lightrail-trial": {
            label: "共同经历",
            title: "一起经过",
            description:
              "与其他建设者一起坐进北陆轻轨尚未正式运行的车厢，庆祝新的线路即将开始服务。",
            detail:
              "试车让规划图、轨道和车站第一次成为一段可以共同乘坐的旅程。大家在车厢里确认线路怎样运行，也一起经过刚刚完成的建设；新线路的意义，就在这一次共同出发中，从工程变成了日常。",
            imageAlt: "北陆轻轨试车时尚未正式载客的车厢内部",
            credit: "[试车参与者与图片作者署名待核实]",
          },
        },
        presenceStoryById: {
          "presence-neo-fueya-maintenance": {
            label: "一直在场",
            title: "下一班车出发以前",
            description: "抵达新笛矢·壑湖站维护线路与设施，并前往林湾车库为列车做出发准备。",
            detail:
              "一次平常的抵达，背后往往有人先检查站台、线路与车辆。Acatine 往返新笛矢·壑湖站和林湾车库，完成维护与整备；于是后来的人走上站台时，看见的仍是一班已经准备好继续出发的列车。",
            imageAlt: "停靠在新笛矢·壑湖站站台旁、等待整备的列车",
            credit: "Acatine",
          },
          "presence-pyutocor-lighting": {
            label: "一直在场",
            title: "让一盏灯照亮日常",
            description:
              "维护蒲塘桥城区的建筑灯光与装修，让夜里的道路保持明亮，城市也保持美观整洁。",
            detail:
              "城市的样子也来自一次次不显眼的整理。Hot945 检查建筑照明，修整室内外装饰，让公共空间在夜里仍然清楚、好看，也让每天经过蒲塘桥的人看见一座持续被照料的城市。",
            imageAlt: "夜间蒲塘桥城区建筑前连续亮起的街灯",
            credit: "Hot945",
          },
          "presence-bayside-railway": {
            label: "一直在场",
            title: "在田野边留下旧线的样子",
            description:
              "在湾岸镇田间劳作时，拍下从麦田边驶过的旧湾岸支线。如今线路已经重建，照片留下了它曾经的样子。",
            detail:
              "那天没有特意安排记录：劳作间隙，列车从田野旁经过，LanYuvu 按下快门。后来湾岸支线完成重建，这张照片便成了两次日常之间的连接——让后来抵达的人，也能看见线路改变以前，湾岸镇曾有怎样的风景。",
            imageAlt: "旧湾岸支线列车从湾岸镇成熟的麦田上方驶过",
            credit: "LanYuvu",
          },
          "presence-fueya-renewal": {
            label: "一直在场",
            title: "老城也在继续生长",
            description: "作为镇长持续建设笛矢老城；这里没有停在过去，熟悉的街区仍在更新。",
            detail:
              "一座已经形成的城市，同样需要有人继续照看与建设。Complex_Colors 在保留老城脉络的同时推进新的街区变化，让这里既能留下曾经的样子，也能继续回应今天的生活。所谓完成，在 Fetarute 往往只是下一次更新的起点。",
            imageAlt: "阳光下持续更新的笛矢老城街区全景",
            credit: "Complex_Colors",
          },
          "presence-nktr-tram": {
            label: "一直在场",
            title: "有轨电车把地区连在一起",
            description: "持续建设新北陆地区的有轨电车，让不同街区之间有了清楚、可抵达的联系。",
            detail:
              "线路沿城市延伸，车站和街道也随之获得新的关系。Katsuta_Minamoto 将有轨电车铺向新北陆各处，让人们能够在不同街区间移动，也让一片片原本分散的建设，逐渐成为彼此相连的地区。",
            imageAlt: "新北陆地区的有轨电车从高架步道与传统建筑旁驶过",
            credit: "Katsuta_Minamoto",
          },
        },
        closingTitle: "这只是 Fetarute 上的几次停靠。",
        closingDescription:
          "首页只停靠在少数片段。还有许多建设、维护、带路与记录，等待在未来的社区页被继续读到；列车也将从这里驶向下一程。",
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
          "2017 年，Fetarute 從一座 Forge 模組鐵路伺服器起步。後來，承載世界的方式從模組轉向原版與插件，鐵路卻一直留在旅程裡。眼前的三處風景，來自如今彼此相連的三個子伺服器；沿著服聯快線繼續前行，我們會在下一站認識它們。",
      },
      arrival: {
        trainTooltip: {
          triggerLabel: "開啟列車章節快選",
          hoverHint: "懸停預覽；點擊固定旅程導覽",
          tapHint: "輕觸列車，開啟旅程導覽",
          title: "列車導覽",
          currentSectionLabel: "本站",
          quickPickLabel: "章節路線",
          goToSectionLabel: "前往章節",
          closeLabel: "關閉列車導覽",
        },
      },
      gallery: {
        label: "鐵路回顧圖片廊",
        sceneById: {
          "kaihin-shukukai-station": {
            kicker: "創造服",
            title: "抵達海濱宿海",
            alt: "創造服海濱宿海站的站牌與高架站體",
          },
          "pyutocor-spawn-bay": {
            kicker: "生存服",
            title: "蒲塘橋風光",
            alt: "蒲塘橋高架鐵路與城市天際線",
          },
          "huayuan-lobby-center": {
            kicker: "大廳服",
            title: "舊服聯快線華園站",
            alt: "舊服聯快線列車停靠在華園站月台旁",
          },
        },
      },
      triServer: {
        label: "Fetarute 三個子伺服器",
        lead: "鐵路沒有讓三個世界變得相同，而是讓它們能夠彼此抵達。",
        placeholderTitle: "圖片展示區",
        placeholderHint: "代表圖片將在選定後從伺服器素材目錄自動載入。",
        previousSlideLabel: "上一張圖片",
        nextSlideLabel: "下一張圖片",
        slideStatusTemplate: "第 {current} / {total} 張",
        imageLoadingLabel: "正在準備下一張風景…",
        imageLoadErrorLabel: "圖片暫時無法載入，請稍後重試",
        serverLoadingLabel: "正在準備下一站風景…",
        mapCardTitle: "從車窗進入即時地圖",
        mapCardDescription: "地圖只會在你主動選擇後載入；退出後將回到目前圖片位置。",
        mapExternalCardTitle: "在新分頁查看即時地圖",
        mapExternalCardDescription:
          "行動裝置不在頁面內嵌地圖；選擇下方入口後，將在新分頁開啟這個世界的即時地圖。",
        mapLaunchLabel: "啟動互動地圖",
        mapCloseLabel: "退出即時地圖",
        mapLoadingTitle: "正在連接即時地圖",
        mapLoadingDescription: "正在載入這個世界的地形與標記，你可以隨時退出。",
        mapExternalLabel: "在新分頁開啟",
        mapFrameLabel: "互動地圖",
        serverById: {
          creative: {
            name: "創造服",
            tagline: "讓想像成為可以抵達的城市",
            description:
              "創造服延續 Fetarute 自 2017 年以來的傳統玩法，也是軌交城建經驗累積最久的世界。人們可以自由規劃街區、鋪設路線，與夥伴共同把交通設施、都市與建築群從設想變成現實。它保存著我們建設鐵路城市的經驗，也等待新的合作繼續改變天際線。",
            imageAltPrefix: "Fetarute 創造服代表場景",
          },
          lobby: {
            name: "大廳服",
            tagline: "讓每一次抵達都有下一程",
            description:
              "過去被稱為門戶世界的大廳服，是創造服與生存服之間的轉乘樞紐，也是跨服鐵路的中心站。高樓與空島保存著 Fetarute 過去的痕跡；旅人可以在這裡相遇、停留，也可以重新選擇方向，前往另外兩個世界開始下一程。",
            imageAltPrefix: "Fetarute 大廳服代表場景",
          },
          survival: {
            name: "生存服",
            tagline: "讓旅程在共同生活中延伸",
            description:
              "在生存服，鐵路被視為大陸的命脈，把資源、聚落與遠方連接起來。人們可以獨自探索和收集，也可以與朋友共同建立小鎮，讓新的路線隨著生活自然延伸。每一次出發都會在世界裡留下痕跡，並透過跨服鐵路與另外兩個世界相連。",
            imageAltPrefix: "Fetarute 生存服代表場景",
          },
        },
      },
      community: {
        label: "同岸玩家故事",
        introHeading: "由相遇，到共同生活",
        statement: "我們在這裡相遇，也在一次次共同參與中，讓這裡逐漸成為一個世界。",
        introduction:
          "世界不只由建築與風景組成，也由一次次共同建設、共同經歷與共同維繫慢慢形成。下面只是其中三段。",
        creditLabel: "署名",
        storyOpenLabel: "點擊圖片，讀這一段",
        storyCloseLabel: "收起圖片中的文字",
        playerLabel: "故事中的玩家",
        featureStoryById: {
          "surcentral-rebuild": {
            label: "規劃與建設",
            title: "為了讓下一班車繼續抵達",
            description:
              "2026 年，舊 SURcentral 的設施漸近飽和。Acatine 重新設計 SUR100 系列列車，建設者們也開始重想整套系統如何繼續運轉。",
            detail:
              "Hot945、Katsuta_Minamoto、LanYuvu 與 Complex_Colors 參與規劃和建設；海島線與大都會線由此鋪開，讓新的生活區域更容易抵達，轉乘也保持清楚。列車、路線與車站並非各自完成的工程，而是在討論、施工和試運行中被共同連接起來。玩家彼此交流、共同建設，Fetarute 也在這些持續發生的行動裡，逐漸成為一個世界；SURcentral 只是其中一程。",
            imageAlt: "SURcentral 重建計畫中的城市鐵路與列車",
            credit: "Acatine、Hot945、Katsuta_Minamoto、LanYuvu、Complex_Colors",
          },
          "new-year-2026": {
            label: "共同經歷",
            title: "一起經過",
            description:
              "玩家不只一起建設，也一起度過具體的時刻。在迎接 2026 的跨年夜，許多原本各自行走的人，在東港大橋為同一刻停下。",
            detail:
              "城市和鐵路不只用來抵達目的地，也是交流、相聚和共同經歷時間的地方。那張合照沒有用規模定義一次活動，只留下一個簡單的事實：原本有著各自路線的人，曾在同一個世界相遇，一起迎接新年，並把這一刻留了下來。",
            imageAlt: "Fetarute 玩家在東港大橋拍攝的 2026 跨年合照",
            credit: "[合照參與者與圖片作者署名待核實]",
          },
          "pulan-south-extension-trial": {
            label: "共同經歷",
            title: "一起經過",
            description:
              "與其他建設者一起坐上浦藍線南延伸大港城段的試車。第一次運行不只是在檢驗軌道，也是在慶祝新路線完成。",
            detail:
              "在 Fetarute，試車既是檢查，也是大家慶祝一段共同建設終於連通的方式。有人留意月台與路線，有人從車窗望向剛剛抵達的城市；浦藍線南延伸大港城段的第一次經過，把分散的工作變成了所有人共享的一程。",
            imageAlt: "浦藍線列車在南延伸大港城段進行試車",
            credit: "[試車參與者與圖片作者署名待核實]",
          },
          "kitariku-lightrail-trial": {
            label: "共同經歷",
            title: "一起經過",
            description:
              "與其他建設者一起坐進北陸輕軌尚未正式運行的車廂，慶祝新的路線即將開始服務。",
            detail:
              "試車讓規劃圖、軌道和車站第一次成為一段可以共同乘坐的旅程。大家在車廂裡確認路線怎樣運行，也一起經過剛剛完成的建設；新路線的意義，就在這一次共同出發中，從工程變成了日常。",
            imageAlt: "北陸輕軌試車時尚未正式載客的車廂內部",
            credit: "[試車參與者與圖片作者署名待核實]",
          },
        },
        presenceStoryById: {
          "presence-neo-fueya-maintenance": {
            label: "一直在場",
            title: "下一班車出發以前",
            description: "抵達新笛矢·壑湖站維護路線與設施，並前往林灣車庫為列車做出發準備。",
            detail:
              "一次平常的抵達，背後往往有人先檢查月台、路線與車輛。Acatine 往返新笛矢·壑湖站和林灣車庫，完成維護與整備；於是後來的人走上月台時，看見的仍是一班已經準備好繼續出發的列車。",
            imageAlt: "停靠在新笛矢·壑湖站月台旁、等待整備的列車",
            credit: "Acatine",
          },
          "presence-pyutocor-lighting": {
            label: "一直在場",
            title: "讓一盞燈照亮日常",
            description:
              "維護蒲塘橋城區的建築燈光與裝修，讓夜裡的道路保持明亮，城市也保持美觀整潔。",
            detail:
              "城市的樣子也來自一次次不顯眼的整理。Hot945 檢查建築照明，修整室內外裝飾，讓公共空間在夜裡仍然清楚、好看，也讓每天經過蒲塘橋的人看見一座持續被照料的城市。",
            imageAlt: "夜間蒲塘橋城區建築前連續亮起的街燈",
            credit: "Hot945",
          },
          "presence-bayside-railway": {
            label: "一直在場",
            title: "在田野邊留下舊線的樣子",
            description:
              "在灣岸鎮田間勞作時，拍下從麥田邊駛過的舊灣岸支線。如今路線已經重建，照片留下了它曾經的樣子。",
            detail:
              "那天沒有特意安排記錄：勞作間隙，列車從田野旁經過，LanYuvu 按下快門。後來灣岸支線完成重建，這張照片便成了兩次日常之間的連接——讓後來抵達的人，也能看見路線改變以前，灣岸鎮曾有怎樣的風景。",
            imageAlt: "舊灣岸支線列車從灣岸鎮成熟的麥田上方駛過",
            credit: "LanYuvu",
          },
          "presence-fueya-renewal": {
            label: "一直在場",
            title: "老城也在繼續生長",
            description: "作為鎮長持續建設笛矢老城；這裡沒有停在過去，熟悉的街區仍在更新。",
            detail:
              "一座已經形成的城市，同樣需要有人繼續照看與建設。Complex_Colors 在保留老城脈絡的同時推進新的街區變化，讓這裡既能留下曾經的樣子，也能繼續回應今天的生活。所謂完成，在 Fetarute 往往只是下一次更新的起點。",
            imageAlt: "陽光下持續更新的笛矢老城街區全景",
            credit: "Complex_Colors",
          },
          "presence-nktr-tram": {
            label: "一直在場",
            title: "有軌電車把地區連在一起",
            description: "持續建設新北陸地區的有軌電車，讓不同街區之間有了清楚、可抵達的聯繫。",
            detail:
              "路線沿城市延伸，車站和街道也隨之獲得新的關係。Katsuta_Minamoto 將有軌電車鋪向新北陸各處，讓人們能夠在不同街區間移動，也讓一片片原本分散的建設，逐漸成為彼此相連的地區。",
            imageAlt: "新北陸地區的有軌電車從高架步道與傳統建築旁駛過",
            credit: "Katsuta_Minamoto",
          },
        },
        closingTitle: "這只是 Fetarute 上的幾次停靠。",
        closingDescription:
          "首頁只停靠在少數片段。還有許多建設、維護、帶路與記錄，等待在未來的社群頁被繼續讀到；列車也將從這裡駛向下一程。",
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
          "Fetarute began in 2017 as a Forge-modded railway server. The way we built its world later shifted from mods to Vanilla and plugins, but the railway remained part of the journey. The three scenes ahead come from the three servers now connected by Serverlink; at the next stop, we’ll meet each of them.",
      },
      arrival: {
        trainTooltip: {
          triggerLabel: "Open the train section picker",
          hoverHint: "Hover to preview; click to pin journey navigation",
          tapHint: "Tap the train to open journey navigation",
          title: "Train wayfinding",
          currentSectionLabel: "This stop",
          quickPickLabel: "Section route",
          goToSectionLabel: "Go to section",
          closeLabel: "Close train wayfinding",
        },
      },
      gallery: {
        label: "Railway retrospective gallery",
        sceneById: {
          "kaihin-shukukai-station": {
            kicker: "CREATIVE",
            title: "Arriving at Kaihin-Shukukai",
            alt: "The Kaihin-Shukukai station sign and elevated station structures in the Creative server",
          },
          "pyutocor-spawn-bay": {
            kicker: "SURVIVAL",
            title: "Pyutocor",
            alt: "Pyutocor's elevated railway and city skyline",
          },
          "huayuan-lobby-center": {
            kicker: "LOBBY",
            title: "Old Serverlink · Huayuan Station",
            alt: "An old Serverlink train stopped beside the platform at Huayuan Station",
          },
        },
      },
      triServer: {
        label: "Fetarute's three servers",
        lead: "The railway does not make three worlds alike. It makes each of them reachable.",
        placeholderTitle: "Image window",
        placeholderHint: "Selected scenes will load automatically from this server's media folder.",
        previousSlideLabel: "Previous image",
        nextSlideLabel: "Next image",
        slideStatusTemplate: "{current} of {total}",
        imageLoadingLabel: "Preparing the next scene…",
        imageLoadErrorLabel: "This image could not be loaded. Please try again.",
        serverLoadingLabel: "Preparing the next stop…",
        mapCardTitle: "Enter the live map through the window",
        mapCardDescription:
          "The map loads only when you choose to open it. Closing it returns you to the current slide.",
        mapExternalCardTitle: "View the live map in a new tab",
        mapExternalCardDescription:
          "On smaller screens, the live map opens in a new tab instead of inside the image window.",
        mapLaunchLabel: "Launch interactive map",
        mapCloseLabel: "Close live map",
        mapLoadingTitle: "Connecting to the live map",
        mapLoadingDescription:
          "Loading this world's terrain and markers. You can close it at any time.",
        mapExternalLabel: "Open in a new tab",
        mapFrameLabel: "interactive map",
        serverById: {
          creative: {
            name: "Creative",
            tagline: "Turn imagination into cities you can reach",
            description:
              "Creative continues Fetarute's traditional play since 2017 and its longest-running experience in rail-oriented city building. Players plan districts and lines together, turning transport, cities and architecture into places that can be reached and expanded.",
            imageAltPrefix: "A representative scene from Fetarute Creative",
          },
          lobby: {
            name: "Lobby",
            tagline: "Give every arrival a next leg",
            description:
              "Formerly known as Portal World, Lobby is the interchange between Creative and Survival and the centre of the cross-server railway. Its towers and floating islands hold traces of Fetarute's past, while every meeting can lead to a new departure.",
            imageAltPrefix: "A representative scene from Fetarute Lobby",
          },
          survival: {
            name: "Survival",
            tagline: "Let the journey grow through a shared world",
            description:
              "In Survival, the railway is the continent's lifeline, joining resources, settlements and distant frontiers. Players can explore and gather alone or build towns with friends, letting new lines grow from shared life and carry each journey back to the other worlds.",
            imageAltPrefix: "A representative scene from Fetarute Survival",
          },
        },
      },
      community: {
        label: "Shared Shore player stories",
        introHeading: "From meeting to living together",
        statement:
          "We meet here and, through each act of participation, gradually make this place a world.",
        introduction:
          "A world is made not only of buildings and scenery, but through building together, sharing time and keeping common places going. These are only three such moments.",
        creditLabel: "Credit",
        storyOpenLabel: "Select the image to read",
        storyCloseLabel: "Hide the text on the image",
        playerLabel: "Player in this story",
        featureStoryById: {
          "surcentral-rebuild": {
            label: "Planning and building",
            title: "So the next train can still arrive",
            description:
              "In 2026, the original SURcentral system approached capacity. Acatine redesigned the SUR100 train series while builders reconsidered how the whole system could keep moving.",
            detail:
              "Hot945, Katsuta_Minamoto, LanYuvu and Complex_Colors joined the planning and construction. The new Islands Line and Metropolitan Line made more living areas easier to reach and transfers clearer. Trains, routes and stations came together through discussion, construction and trials—not as separate projects. As players exchange ideas and build together, Fetarute continues becoming a world; SURcentral is only one part of that journey.",
            imageAlt: "A city railway and train in the SURcentral rebuild plan",
            credit: "Acatine, Hot945, Katsuta_Minamoto, LanYuvu, Complex_Colors",
          },
          "new-year-2026": {
            label: "Shared moments",
            title: "Passing through together",
            description:
              "Players do more than build together; they share particular moments. On the night they welcomed 2026, many separate journeys paused together at Eastport Bridge.",
            detail:
              "Cities and railways do more than carry people to destinations. They are also places to meet, gather and share time. The photograph does not define the night by its scale. It keeps a simpler fact: people following different routes met in one world, welcomed a new year together, and left that moment behind.",
            imageAlt: "Fetarute players taking a 2026 New Year group photograph at Eastport Bridge",
            credit: "[Group participants and image credit to be confirmed]",
          },
          "pulan-south-extension-trial": {
            label: "Shared moments",
            title: "Passing through together",
            description:
              "joined other builders aboard the first trial of the Waterside Line's southern extension to The Port City, testing and celebrating the completed route.",
            detail:
              "In Fetarute, a trial run checks the work and celebrates a shared route finally joining up. Some watch the platforms and track; others look out at a newly reached city. The first run turns separate tasks into one journey everyone shares.",
            imageAlt:
              "A Waterside Line train making a trial run on the southern extension to The Port City",
            credit: "[Trial participants and image credit to be confirmed]",
          },
          "kitariku-lightrail-trial": {
            label: "Shared moments",
            title: "Passing through together",
            description:
              "joined other builders aboard a Kitariku Lightrail train not yet in service, celebrating a new route preparing to open.",
            detail:
              "A trial run turns plans, rails and stops into a journey people can take together. In the carriage, builders check how the line works and pass through what they have just completed. A project begins to feel like everyday life.",
            imageAlt: "The interior of a Kitariku Lightrail train during pre-service trials",
            credit: "[Trial participants and image credit to be confirmed]",
          },
        },
        presenceStoryById: {
          "presence-neo-fueya-maintenance": {
            label: "Always here",
            title: "Before the next train departs",
            description:
              "maintains the line and facilities at Neo Fueya - Hor Huu, then heads to Limbay Depot to prepare a train for departure.",
            detail:
              "An ordinary arrival often begins with someone checking the platform, track and train. Acatine moves between Neo Fueya - Hor Huu and Limbay Depot to maintain and prepare them, so the next person who reaches the platform simply finds a train ready to continue.",
            imageAlt: "A train beside the platform at Neo Fueya - Hor Huu, waiting to be prepared",
            credit: "Acatine",
          },
          "presence-pyutocor-lighting": {
            label: "Always here",
            title: "Keeping an everyday light on",
            description:
              "maintains building lights and finishes across Pyutocor, keeping its streets bright and the city cared for after dark.",
            detail:
              "The character of a city also comes from small acts of upkeep. Hot945 checks architectural lighting and refines interiors and façades, keeping shared spaces clear and welcoming at night—and showing each person who passes through a city that is still being cared for.",
            imageAlt: "A row of street lights glowing in front of Pyutocor buildings at night",
            credit: "Hot945",
          },
          "presence-bayside-railway": {
            label: "Always here",
            title: "Keeping the old line in view",
            description:
              "photographed the old Bayside Branch passing the wheat while working the fields. The rebuilt line now runs through a changed landscape.",
            detail:
              "The moment was not arranged as a historical record: a train passed the fields during a break in the work, and LanYuvu took the picture. After the Bayside Branch was rebuilt, that everyday image became a link between two versions of the place, letting later arrivals see what once ran beside the town.",
            imageAlt: "A train on the old Bayside Branch passing above a ripe wheat field",
            credit: "LanYuvu",
          },
          "presence-fueya-renewal": {
            label: "Always here",
            title: "The old town keeps growing",
            description:
              "continues building Fueya's old town as mayor, keeping its familiar districts growing rather than leaving them in the past.",
            detail:
              "A city that already feels established still needs someone to care for and build it. Complex_Colors keeps Fueya's earlier shape visible while carrying new changes through its districts, allowing the town to hold on to what it was and respond to life today. In Fetarute, completion is often the start of another update.",
            imageAlt: "A sunlit panorama of Fueya's old town as its districts continue to change",
            credit: "Complex_Colors",
          },
          "presence-nktr-tram": {
            label: "Always here",
            title: "A tram joins the district together",
            description:
              "continues building New Kitariku's tramways, giving its different neighbourhoods a clear and reachable connection.",
            detail:
              "As the line extends through the city, stops and streets gain new relationships. Katsuta_Minamoto carries the tram to more of New Kitariku, helping people move between neighbourhoods and turning separate pieces of building into one connected district.",
            imageAlt:
              "A New Kitariku tram passing an elevated walkway and traditional architecture",
            credit: "Katsuta_Minamoto",
          },
        },
        closingTitle: "These are only a few stops along Fetarute's journey.",
        closingDescription:
          "The homepage pauses at only a few fragments. More stories of building, maintaining, guiding and recording will continue on a future Community page, while the train moves on from here.",
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
