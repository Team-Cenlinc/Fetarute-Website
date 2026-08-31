import assert from "node:assert/strict";
import test from "node:test";
import {
  getHomeCommunityMainStoryMotionState,
  homeCommunityStories,
  segmentHomeCommunityPlayerText,
  selectHomeCommunityMemoryStoryId,
  selectHomeCommunityPresenceStoryId,
} from "../src/data/home-community.ts";

test("同岸固定主故事保持 SURcentral，共同经历池收录三个真实片段", () => {
  assert.equal(homeCommunityStories.main.id, "surcentral-rebuild");
  assert.deepEqual(
    homeCommunityStories.memory.map((story) => story.id),
    ["new-year-2026", "pulan-south-extension-trial", "kitariku-lightrail-trial"],
  );
});

test("已确认的主故事与试车建设者可以公开，集体合照仍保持待核实", () => {
  assert.equal(homeCommunityStories.main.hasPublicCredit, true);
  assert.deepEqual(
    homeCommunityStories.main.players?.map((player) => player.name),
    ["Acatine", "Hot945", "Katsuta_Minamoto", "LanYuvu", "Complex_Colors"],
  );
  assert.equal(
    homeCommunityStories.main.players?.find((player) => player.name === "Complex_Colors")?.uuid,
    "49a9cb104b224aceb91f7605df0b34a6",
  );
  assert.equal(homeCommunityStories.memory[0].hasPublicCredit, false);
  assert.deepEqual(
    homeCommunityStories.memory.slice(1).map((story) => story.player?.name),
    ["Acatine", "Katsuta_Minamoto"],
  );
  assert.ok(homeCommunityStories.memory.slice(1).every((story) => story.hasPublicCredit));
});

test("一直在场故事池使用唯一稳定 id 与 Mojang 玩家身份", () => {
  const storyIds = homeCommunityStories.presence.map((story) => story.id);
  const playerNames = homeCommunityStories.presence.map((story) => story.player.name);
  const playerUuids = homeCommunityStories.presence.map((story) => story.player.uuid);

  assert.equal(storyIds.length, 5);
  assert.equal(new Set(storyIds).size, storyIds.length);
  assert.equal(new Set(playerNames).size, playerNames.length);
  assert.ok(playerUuids.every((uuid) => /^[0-9a-f]{32}$/.test(uuid)));
});

test("一直在场随机值会稳定映射到候选范围", () => {
  assert.equal(
    selectHomeCommunityPresenceStoryId(homeCommunityStories.presence, 0),
    "presence-neo-fueya-maintenance",
  );
  assert.equal(
    selectHomeCommunityPresenceStoryId(homeCommunityStories.presence, 0.4),
    "presence-bayside-railway",
  );
  assert.equal(
    selectHomeCommunityPresenceStoryId(homeCommunityStories.presence, 0.999999),
    "presence-nktr-tram",
  );
  assert.equal(
    selectHomeCommunityPresenceStoryId(homeCommunityStories.presence, Number.NaN),
    "presence-neo-fueya-maintenance",
  );
});

test("刷新短故事时会从候选中排除刚展示的一则", () => {
  assert.notEqual(
    selectHomeCommunityPresenceStoryId(
      homeCommunityStories.presence,
      0,
      "presence-neo-fueya-maintenance",
    ),
    "presence-neo-fueya-maintenance",
  );
  assert.notEqual(
    selectHomeCommunityMemoryStoryId(
      homeCommunityStories.memory,
      0.999999,
      "kitariku-lightrail-trial",
    ),
    "kitariku-lightrail-trial",
  );
});

test("沉浸主故事先保留完整图片，再揭示带玩家头像的正文", () => {
  assert.deepEqual(getHomeCommunityMainStoryMotionState(0), {
    sceneProgress: 0,
    veilProgress: 0,
    detailProgress: 0,
  });

  const middleState = getHomeCommunityMainStoryMotionState(0.5);
  assert.ok(middleState.veilProgress > middleState.detailProgress);

  assert.deepEqual(getHomeCommunityMainStoryMotionState(1), {
    sceneProgress: 1,
    veilProgress: 1,
    detailProgress: 1,
  });
});

test("主故事原文按出现顺序把玩家名切成可嵌入头像的片段", () => {
  const players = homeCommunityStories.main.players ?? [];
  const segments = segmentHomeCommunityPlayerText(
    "Acatine 与 Hot945、Katsuta_Minamoto、LanYuvu、Complex_Colors 共同建设。",
    players,
  );

  assert.deepEqual(
    segments.filter((segment) => segment.type === "player").map((segment) => segment.player.name),
    ["Acatine", "Hot945", "Katsuta_Minamoto", "LanYuvu", "Complex_Colors"],
  );
  assert.equal(
    segments
      .map((segment) => (segment.type === "player" ? segment.player.name : segment.value))
      .join(""),
    "Acatine 与 Hot945、Katsuta_Minamoto、LanYuvu、Complex_Colors 共同建设。",
  );
});

test("沉浸主故事会收束异常与越界进度", () => {
  assert.equal(getHomeCommunityMainStoryMotionState(Number.NaN).sceneProgress, 0);
  assert.equal(getHomeCommunityMainStoryMotionState(-1).sceneProgress, 0);
  assert.equal(getHomeCommunityMainStoryMotionState(2).sceneProgress, 1);
});
