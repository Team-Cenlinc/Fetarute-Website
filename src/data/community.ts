import { homeCommunityStories } from "./home-community.ts";

/** 共享地图只区分玩家、其他服务器/社区、外部团体，不增加内部组织或贡献等级。 */
export type CommunityEntityKind = "player" | "server" | "group";

/** 可公开展示的一处社区地点；作品和外链均非必填，未知关系不能伪装成真实合作。 */
export interface CommunityEntity {
  /** 稳定身份用于地块、深链与焦点回归，不使用随机位置作为身份。 */
  id: string;
  kind: CommunityEntityKind;
  /** 玩家姓名复用已有公开署名；未确认合作方使用本地化占位名称。 */
  name?: string;
  /** 本地头像按 UUID 对应；不向第三方头像服务发出访客请求。 */
  playerUuid?: string;
  /** 只有核实关系与目的地后才填写；占位对象没有可点击外链。 */
  href?: string;
}

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
  })),
  { id: "server-placeholder", kind: "server" },
  { id: "community-placeholder", kind: "server" },
  { id: "group-placeholder", kind: "group" },
];

/** SSG 后备地图种子；脚本增强时生成本次访问种子，浏览过程中绝不洗牌。 */
export const communityLayoutSeed = 20260907;

/** 首屏头像马赛克沿用 Figma 的疏密轮廓；只放入已有成员，其余格子仍为中性占位。 */
export const communityMosaicCells = [
  [5, 0],
  [4, 1],
  [2, 1],
  [3, 2],
  [5, 2],
  [1, 3],
  [2, 3],
  [4, 3],
  [0, 4],
  [2, 4],
  [1, 5],
  [3, 5],
] as const;
