import type { ImageMetadata } from "astro";

/** 同岸共同经历故事池的稳定身份。 */
export type HomeCommunityMemoryStoryId =
  "new-year-2026" | "pulan-south-extension-trial" | "kitariku-lightrail-trial";

/** 同岸主故事与共同经历片段的稳定身份。 */
export type HomeCommunityFeatureStoryId = "surcentral-rebuild" | HomeCommunityMemoryStoryId;

/** “一直在场”随机故事池的稳定身份；后续替换真实内容时保留 id 可避免刷新轮换失效。 */
export type HomeCommunityPresenceStoryId =
  | "presence-neo-fueya-maintenance"
  | "presence-pyutocor-lighting"
  | "presence-bayside-railway"
  | "presence-fueya-renewal"
  | "presence-nktr-tram";

/**
 * 首页同岸故事的可替换媒体槽位。
 * 图片由维护者从 src/assets 导入，并在 Astro 组件的构建边界按稳定 id 注入。
 */
export interface HomeCommunityStoryMedia {
  /** 经 Astro 处理的真实图片；组件在构建边界按稳定故事 id 注入。 */
  image?: ImageMetadata;
  /** 图片在裁切容器中的视觉焦点，例如 50% 42%。 */
  focalPoint: string;
}

/** 同岸短故事中与具体行动对应的玩家资料，可同时用于共同经历与日常贡献。 */
export interface HomeCommunityPlayer {
  /** Mojang 返回的规范 Java 版玩家名，作为首页轻量署名显示。 */
  name: string;
  /** Mojang Java 档案 UUID，记录本地头像对应的公开资料来源。 */
  uuid: string;
  /** 从 Mojang 公开皮肤纹理生成的本地像素头像；组件在构建边界按 UUID 注入。 */
  avatar?: ImageMetadata;
}

/** 首页故事正文中可直接渲染的文字或玩家片段，保留原句顺序供头像与姓名自然同行。 */
export type HomeCommunityPlayerTextSegment<
  Player extends HomeCommunityPlayer = HomeCommunityPlayer,
> =
  | {
      /** 普通文案片段不改变原始标点与空格。 */
      type: "text";
      /** 玩家名之间或前后的原始文字。 */
      value: string;
    }
  | {
      /** 玩家片段由组件渲染本地头像和规范玩家名。 */
      type: "player";
      /** 与当前正文中玩家名对应的已确认资料。 */
      player: Player;
    };

/** 首页同岸主故事或固定纪念片段的非文案配置。 */
export interface HomeCommunityFeatureStory {
  /** 与三语文案和 DOM 状态共用的稳定故事身份。 */
  id: HomeCommunityFeatureStoryId;
  /** 可由维护者独立替换的图片和视觉焦点。 */
  media: HomeCommunityStoryMedia;
  /** 只有参与者署名与展示许可都确认后才允许首页公开署名。 */
  hasPublicCredit: boolean;
  /** 已确认可以公开展示的参与玩家；主故事可同时呈现多人头像。 */
  players?: readonly HomeCommunityPlayer[];
}

/** 共同经历池中的一则固定事实片段，使用更窄的身份类型避免混入主故事。 */
export interface HomeCommunityMemoryStory extends Omit<
  HomeCommunityFeatureStory,
  "id" | "players"
> {
  /** 与共同经历文案和刷新轮换状态共用的稳定身份。 */
  id: HomeCommunityMemoryStoryId;
  /** 当具体建设者已经确认时加入玩家资料；集体合照等片段可以省略。 */
  player?: HomeCommunityPlayer;
}

/** 首页同岸“一直在场”故事池中一条可随机抽取的非文案配置。 */
export interface HomeCommunityPresenceStory {
  /** 与三语文案、页面轮换和社区页深链共用的稳定故事身份。 */
  id: HomeCommunityPresenceStoryId;
  /** 可由维护者独立替换的图片和视觉焦点。 */
  media: HomeCommunityStoryMedia;
  /** 用户提供的真实行动与对应玩家，让故事保持具体而不成为名单墙。 */
  player: HomeCommunityPlayer;
}

/**
 * SURcentral 沉浸主故事在一个滚动时刻的展示状态。
 * 将视觉阶段收束成纯数据，浏览器脚本与测试共用同一套阈值，避免滚动文案和遮罩各自漂移。
 */
export interface HomeCommunityMainStoryMotionState {
  /** 已限制在 0 到 1 的主故事阅读进度。 */
  sceneProgress: number;
  /** 图片从完整呈现过渡到浅色背景的进度。 */
  veilProgress: number;
  /** 正文从画面后方进入可读状态的进度。 */
  detailProgress: number;
}

/**
 * 按原文出现顺序把已确认玩家名切成独立片段。
 * 组件只替换匹配到的完整玩家名，其余文字、标点与语言顺序保持不变。
 */
export function segmentHomeCommunityPlayerText<Player extends HomeCommunityPlayer>(
  text: string,
  players: readonly Player[],
): HomeCommunityPlayerTextSegment<Player>[] {
  const segments: HomeCommunityPlayerTextSegment<Player>[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    let nextPlayer: Player | undefined;
    let nextPlayerIndex = Number.POSITIVE_INFINITY;

    for (const player of players) {
      const playerIndex = text.indexOf(player.name, cursor);

      if (
        playerIndex >= 0 &&
        (playerIndex < nextPlayerIndex ||
          (playerIndex === nextPlayerIndex && player.name.length > (nextPlayer?.name.length ?? 0)))
      ) {
        nextPlayer = player;
        nextPlayerIndex = playerIndex;
      }
    }

    if (!nextPlayer) {
      segments.push({ type: "text", value: text.slice(cursor) });
      break;
    }

    if (nextPlayerIndex > cursor) {
      segments.push({ type: "text", value: text.slice(cursor, nextPlayerIndex) });
    }

    segments.push({ type: "player", player: nextPlayer });
    cursor = nextPlayerIndex + nextPlayer.name.length;
  }

  return segments;
}

/**
 * 首页同岸的故事槽位。
 * main 固定出现；memory 与 presence 每次页面载入各选择一条，完整内容以后由社区页承接。
 */
export const homeCommunityStories: {
  readonly main: HomeCommunityFeatureStory;
  readonly memory: readonly HomeCommunityMemoryStory[];
  readonly presence: readonly HomeCommunityPresenceStory[];
} = {
  main: {
    id: "surcentral-rebuild",
    media: {
      focalPoint: "50% 50%",
    },
    hasPublicCredit: true,
    players: [
      {
        name: "Acatine",
        uuid: "044741a8b61048f4aed1553b7e2ca8da",
      },
      {
        name: "Hot945",
        uuid: "5b8c1dec528a4a6286fc49fdc94a7b23",
      },
      {
        name: "Katsuta_Minamoto",
        uuid: "302c6dad42bd46f996e3a4b239ab88ca",
      },
      {
        name: "LanYuvu",
        uuid: "6c921ad9ee8e42ddae447558e76239e5",
      },
      {
        name: "Complex_Colors",
        uuid: "49a9cb104b224aceb91f7605df0b34a6",
      },
    ],
  },
  memory: [
    {
      id: "new-year-2026",
      media: {
        focalPoint: "50% 54%",
      },
      hasPublicCredit: false,
    },
    {
      id: "pulan-south-extension-trial",
      media: {
        focalPoint: "58% 52%",
      },
      hasPublicCredit: true,
      player: {
        name: "Acatine",
        uuid: "044741a8b61048f4aed1553b7e2ca8da",
      },
    },
    {
      id: "kitariku-lightrail-trial",
      media: {
        focalPoint: "50% 52%",
      },
      hasPublicCredit: true,
      player: {
        name: "Katsuta_Minamoto",
        uuid: "302c6dad42bd46f996e3a4b239ab88ca",
      },
    },
  ],
  presence: [
    {
      id: "presence-neo-fueya-maintenance",
      media: {
        focalPoint: "48% 50%",
      },
      player: {
        name: "Acatine",
        uuid: "044741a8b61048f4aed1553b7e2ca8da",
      },
    },
    {
      id: "presence-pyutocor-lighting",
      media: {
        focalPoint: "50% 48%",
      },
      player: {
        name: "Hot945",
        uuid: "5b8c1dec528a4a6286fc49fdc94a7b23",
      },
    },
    {
      id: "presence-bayside-railway",
      media: {
        focalPoint: "58% 52%",
      },
      player: {
        name: "LanYuvu",
        uuid: "6c921ad9ee8e42ddae447558e76239e5",
      },
    },
    {
      id: "presence-fueya-renewal",
      media: {
        focalPoint: "52% 53%",
      },
      player: {
        name: "Complex_Colors",
        uuid: "49a9cb104b224aceb91f7605df0b34a6",
      },
    },
    {
      id: "presence-nktr-tram",
      media: {
        focalPoint: "55% 50%",
      },
      player: {
        name: "Katsuta_Minamoto",
        uuid: "302c6dad42bd46f996e3a4b239ab88ca",
      },
    },
  ],
};

/** 只记录上次展示的“一直在场”故事，用于刷新时避开立即重复，不把选择固定在会话中。 */
export const HOME_COMMUNITY_LAST_PRESENCE_SESSION_KEY =
  "fetarute.home.community-last-presence-story";

/** 共同经历同样只记录上一则，刷新时轮换画面而不增加首页卡片数量。 */
export const HOME_COMMUNITY_LAST_MEMORY_SESSION_KEY = "fetarute.home.community-last-memory-story";

/** 从带稳定 id 的故事池抽取一则，并在候选充足时排除上一则。 */
function selectHomeCommunityStoryId<StoryId extends string>(
  stories: readonly { readonly id: StoryId }[],
  randomValue: number,
  excludedStoryId?: StoryId,
): StoryId {
  if (stories.length === 0) {
    throw new Error("同岸故事池不能为空。");
  }

  const candidates =
    stories.length > 1 && excludedStoryId
      ? stories.filter((story) => story.id !== excludedStoryId)
      : stories;
  const finiteRandomValue = Number.isFinite(randomValue) ? randomValue : 0;
  const normalizedRandomValue = Math.min(Math.max(finiteRandomValue, 0), 1 - Number.EPSILON);
  const selectedIndex = Math.floor(normalizedRandomValue * candidates.length);

  return candidates[selectedIndex].id;
}

/**
 * 从“一直在场”故事池选择一条稳定身份。
 * randomValue 作为可测试输入注入；excludedStoryId 让刷新时避开刚展示的故事，越界值会被收束。
 */
export function selectHomeCommunityPresenceStoryId(
  stories: readonly HomeCommunityPresenceStory[],
  randomValue: number,
  excludedStoryId?: HomeCommunityPresenceStoryId,
): HomeCommunityPresenceStoryId {
  return selectHomeCommunityStoryId(stories, randomValue, excludedStoryId);
}

/** 从共同经历池选择一则，并让连续刷新尽量呈现不同的共同片段。 */
export function selectHomeCommunityMemoryStoryId(
  stories: readonly HomeCommunityMemoryStory[],
  randomValue: number,
  excludedStoryId?: HomeCommunityMemoryStoryId,
): HomeCommunityMemoryStoryId {
  return selectHomeCommunityStoryId(stories, randomValue, excludedStoryId);
}

/**
 * 使用平滑起止的曲线把一段总进度映射到局部叙事阶段。
 * 它只处理数值，不读取 DOM，确保滚动效果可以在无浏览器环境下验证边界。
 */
function smoothHomeCommunityProgress(start: number, end: number, progress: number): number {
  const normalized = Math.min(Math.max((progress - start) / (end - start), 0), 1);

  return normalized * normalized * (3 - 2 * normalized);
}

/**
 * 将主故事滚动进度转换成遮罩、正文和署名的分阶段进度。
 * 先保留完整图片，再让正文进入，避免画面与长文同时运动造成视觉噪音。
 */
export function getHomeCommunityMainStoryMotionState(
  progress: number,
): HomeCommunityMainStoryMotionState {
  const finiteProgress = Number.isFinite(progress) ? progress : 0;
  const sceneProgress = Math.min(Math.max(finiteProgress, 0), 1);

  return {
    sceneProgress,
    veilProgress: smoothHomeCommunityProgress(0.2, 0.68, sceneProgress),
    detailProgress: smoothHomeCommunityProgress(0.34, 0.76, sceneProgress),
  };
}
