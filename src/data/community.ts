import { homeCommunityStories } from "./home-community.ts";

/** 共享地图只区分玩家、其他服务器/社区、外部团体，不增加内部组织或贡献等级。 */
export type CommunityEntityKind = "player" | "server" | "group";

/** 玩家在服务器内经确认可公开展示的职务；与地图中的“玩家”类别分别建模。 */
export type CommunityPlayerRole = "owner" | "administrator" | "mayor";

/** 已核实服务器资料的稳定键，供三语文案和本地图片在构建期安全对应。 */
export type CommunityPartnerId = "urasaka" | "hydcraft" | "nebulaecraft";

/** 玩家投稿故事的稳定键；资料与素材按此键关联，不让改名影响既有投稿。 */
export type CommunityPlayerStoryId = "acatine-greenport-br-memorial" | "katsuta-minamoto";

/** 玩家资料只收录本人公开确认的 Motto 或投稿，不从首页故事反推出个人介绍。 */
export interface CommunityPlayerProfile {
  kind: "player";
  /** 玩家主动提供的原文 Motto；没有填写时仍保留资料卡中的字段位置。 */
  motto?: string;
  /** 已许可公开的个人故事；正文和本地素材由该稳定键统一解析。 */
  storyId?: CommunityPlayerStoryId;
}

/** 其他服务器或外部社群通过独立键取得三语关系说明与本地图片。 */
export interface CommunityPartnerProfile {
  kind: "partner";
  /** 只有核实关系与资料后才引用；占位对象不应伪装成合作方。 */
  partnerId: CommunityPartnerId;
}

/** 一处实体最多拥有一种资料来源，避免故事、Motto 和伙伴资料散落在页面层拼接。 */
export type CommunityEntityProfile = CommunityPlayerProfile | CommunityPartnerProfile;

/** 可公开展示的一处社区地点；作品和外链均非必填，未知关系不能伪装成真实合作。 */
export interface CommunityEntity {
  /** 稳定身份用于地块、深链与焦点回归，不使用随机位置作为身份。 */
  id: string;
  kind: CommunityEntityKind;
  /** 玩家姓名复用已有公开署名；未确认合作方使用本地化占位名称。 */
  name?: string;
  /** 本地头像按 UUID 对应；不向第三方头像服务发出访客请求。 */
  playerUuid?: string;
  /** 已确认的玩家职务；没有职务资料时页面继续使用通用“玩家”类别。 */
  playerRole?: CommunityPlayerRole;
  /** 只有核实关系与目的地后才填写；占位对象没有可点击外链。 */
  href?: string;
  /** 个人投稿或伙伴资料的唯一入口；展示层只解析它，不维护额外的身份映射。 */
  profile?: CommunityEntityProfile;
}

/**
 * 用户确认可以在社区地图公开展示的 FR 玩家。
 * 仅收录已取得 UUID 且已缓存本地头像的玩家，避免头像墙混入未核实的身份资料。
 */
const confirmedCommunityPlayers: readonly CommunityEntity[] = [
  {
    id: "player-b6d8a5ceb06b466e855f0f20abfde3fc",
    kind: "player",
    name: "Chinyuhsing",
    playerUuid: "b6d8a5ceb06b466e855f0f20abfde3fc",
  },
  {
    id: "player-8502d0b70e0d4433a674d111734efa25",
    kind: "player",
    name: "EricH_SPT",
    playerUuid: "8502d0b70e0d4433a674d111734efa25",
  },
  {
    id: "player-00df8f3fb6e041ceabdcaf7e31ec0091",
    kind: "player",
    name: "HabQi",
    playerUuid: "00df8f3fb6e041ceabdcaf7e31ec0091",
    playerRole: "mayor",
  },
  {
    id: "player-57633e720389457f9caacd4b48413c47",
    kind: "player",
    name: "John_Mail",
    playerUuid: "57633e720389457f9caacd4b48413c47",
    playerRole: "mayor",
  },
  {
    id: "player-0431570389964c64a55e1aa767cbf892",
    kind: "player",
    name: "Odeinjul",
    playerUuid: "0431570389964c64a55e1aa767cbf892",
  },
  {
    id: "player-323de256767145b7a2f1659c543addff",
    kind: "player",
    name: "tudo_",
    playerUuid: "323de256767145b7a2f1659c543addff",
  },
  {
    id: "player-96d8840b3c3142908b98a2b43a00c088",
    kind: "player",
    name: "Extravagate",
    playerUuid: "96d8840b3c3142908b98a2b43a00c088",
  },
  {
    id: "player-ba4fa89850a04a4bb3ee2d5ece82d7a7",
    kind: "player",
    name: "Thomasxyx",
    playerUuid: "ba4fa89850a04a4bb3ee2d5ece82d7a7",
    playerRole: "owner",
    profile: { kind: "player", motto: "希望Fetarute和其玩家们的明天会更好~" },
  },
  {
    id: "player-7a740f60cf96481aa74a8a618569eb3b",
    kind: "player",
    name: "ThirteenRoil",
    playerUuid: "7a740f60cf96481aa74a8a618569eb3b",
  },
  {
    id: "player-3dcd73e42dba43e6b0fab656cf758132",
    kind: "player",
    name: "DylanAndy1107",
    playerUuid: "3dcd73e42dba43e6b0fab656cf758132",
  },
  {
    id: "player-1d445d97397c499aa1f57beaf5818914",
    kind: "player",
    name: "kuroh1ro",
    playerUuid: "1d445d97397c499aa1f57beaf5818914",
  },
  {
    id: "player-8aa71543257a4a5598b489776ed0258c",
    kind: "player",
    name: "Sad_Tsui",
    playerUuid: "8aa71543257a4a5598b489776ed0258c",
  },
  {
    id: "player-f0cbeb4c89ee40cbb411e84b153f0a8b",
    kind: "player",
    name: "ScienRyz",
    playerUuid: "f0cbeb4c89ee40cbb411e84b153f0a8b",
  },
];

/** 首页已公开署名玩家的职务按 UUID 固定，改名不会让资料卡误配职务。 */
const communityPlayerRolesByUuid: Readonly<Record<string, CommunityPlayerRole>> = {
  "044741a8b61048f4aed1553b7e2ca8da": "owner",
  "5b8c1dec528a4a6286fc49fdc94a7b23": "administrator",
  "302c6dad42bd46f996e3a4b239ab88ca": "mayor",
  "6c921ad9ee8e42ddae447558e76239e5": "mayor",
  "49a9cb104b224aceb91f7605df0b34a6": "mayor",
};

/** 已确认公开的玩家资料按 UUID 关联，避免页面列表同时承担身份、Motto 与故事资料的映射。 */
const communityPlayerProfilesByUuid: Readonly<Partial<Record<string, CommunityPlayerProfile>>> = {
  "044741a8b61048f4aed1553b7e2ca8da": {
    kind: "player",
    motto: "蒲塘桥民",
    storyId: "acatine-greenport-br-memorial",
  },
  "302c6dad42bd46f996e3a4b239ab88ca": { kind: "player", storyId: "katsuta-minamoto" },
};

/**
 * 首版从首页已获公开署名许可的成员读取样本，不以首页作品池作为未来收录门槛。
 * 新成员可以直接补充 player 记录，不需要添加作品、贡献分数或首页故事。
 */
export const communityEntities: readonly CommunityEntity[] = [
  ...(homeCommunityStories.main.hasPublicCredit
    ? (homeCommunityStories.main.players ?? [])
    : []
  ).map((player): CommunityEntity => ({
    id: "player-" + player.uuid,
    kind: "player",
    name: player.name,
    playerUuid: player.uuid,
    playerRole: communityPlayerRolesByUuid[player.uuid],
    profile: communityPlayerProfilesByUuid[player.uuid],
  })),
  ...confirmedCommunityPlayers,
  {
    id: "urasaka",
    kind: "server",
    name: "浦坂 Urasaka",
    profile: { kind: "partner", partnerId: "urasaka" },
  },
  {
    id: "hydcraft",
    kind: "server",
    name: "HydCraft",
    href: "https://hydcraft.cn",
    profile: { kind: "partner", partnerId: "hydcraft" },
  },
  {
    id: "nebulaecraft",
    kind: "server",
    name: "NebulaeCraft",
    href: "https://wiki.knebulae.com/wiki/%E9%A6%96%E9%A1%B5",
    profile: { kind: "partner", partnerId: "nebulaecraft" },
  },
  { id: "group-placeholder", kind: "group" },
];

/** SSG 首帧地图的固定种子；运行时可替换街区地块，但绝不参与头像墙的构图。 */
export const communityLayoutSeed = 20260907;

/**
 * 玩家与世界街区中同时可展示的玩家数。
 * 八块土地固定让出一半给公园、学校、广场和文化设施，避免地图为了收录名单而失去公共空间。
 */
export const communityPlayerMapEntityLimit = 4;

/** 首屏棋盘生长边缘为未来玩家预留六格；真实成员增加时优先保证成员完整展示。 */
export const communityMosaicInvitationCount = 6;

/** 头像墙使用八乘八棋盘网格，兼顾马赛克留白、首屏密度与后续成员增长空间。 */
const communityMosaicColumns = 8;
const communityMosaicRows = 8;

/** 头像墙中一个格子的零起始列、行坐标；只落在同一棋盘色，保持像素马赛克留白。 */
export type CommunityMosaicCell = readonly [number, number];

/**
 * 从画布中部向四周铺开不规则棋盘拼贴，避免沿一条对角线扩张成三角形。
 * 固定的小幅位置扰动打破圆形或菱形边界；新增成员沿同一序列补位，访问时只洗牌真实头像。
 */
export function createCommunityMosaicLayout(itemCount: number): readonly CommunityMosaicCell[] {
  const capacity = (communityMosaicColumns * communityMosaicRows) / 2;
  if (!Number.isInteger(itemCount) || itemCount < 1 || itemCount > capacity)
    throw new Error(`头像墙数量必须介于 1 到 ${capacity} 之间。`);
  const cells: CommunityMosaicCell[] = [];
  for (let row = 0; row < communityMosaicRows; row++) {
    for (let column = 0; column < communityMosaicColumns; column++) {
      if ((column + row) % 2 === 1) cells.push([column, row]);
    }
  }
  /** 中心距离控制聚拢程度，坐标扰动让轮廓错落；构图本身不依赖刷新随机数。 */
  function rank([column, row]: CommunityMosaicCell): number {
    const x = column - (communityMosaicColumns - 1) / 2;
    const y = row - (communityMosaicRows - 1) / 2;
    return x * x + y * y * 0.8 + ((column * 11 + row * 7) % 13) * 0.65;
  }
  return cells.sort((a, b) => rank(a) - rank(b)).slice(0, itemCount);
}

/** 首屏成员墙的默认 24 格容量；页面会按实际成员数量从同一中心扩展序列截取。 */
export const communityMosaicCells = createCommunityMosaicLayout(24);
