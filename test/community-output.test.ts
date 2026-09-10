import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { communityEntities } from "../src/data/community.ts";
import { communityMessages } from "../src/i18n/community.ts";
import { locales } from "../src/i18n/config.ts";

test("三语社区原型静态输出完整成员、概念地图和原生降级内容", () => {
  for (const locale of locales) {
    const html = readFileSync(
      new URL(`../dist/${locale}/community/index.html`, import.meta.url),
      "utf8",
    );
    for (const entity of communityEntities) assert.ok(html.includes(`id="${entity.id}"`));
    assert.equal((html.match(/data-community-entity=/g) ?? []).length, communityEntities.length);
    assert.match(html, /<noscript>/);
    assert.match(html, /<meta name="robots" content="noindex, follow"/);
    assert.match(html, /id="community-district"/);
    assert.match(html, /data-community-copy="517248890"/);
    assert.ok(
      html.includes("希望Fetarute和其玩家们的明天会更好~"),
      "Thomasxyx 的公开签名必须进入静态页面",
    );
    const storyBody = locale === "zh-Hant" ? "美麗新北陸建設中" : "美丽新北陆建设中";
    assert.match(html, /katsuta-minamoto-story\.[^" ]+\.webp/);
    assert.ok(html.includes(storyBody), "Katsuta_Minamoto 的个人故事正文必须按语言进入静态页面");
    assert.ok(html.includes(storyBody), "Katsuta_Minamoto 的个人故事正文必须替换通用占位文案");
    const acatineStoryBody =
      locale === "en"
        ? "Greenport Bridge on SURnorth is being widened to make room for more trains—and more first-time visitors."
        : locale === "zh-Hant"
          ? "SURnorth 的格林波特大橋正在擴容，為更多列車，也為更多初次到來的人留出位置。"
          : "SURnorth 的格林波特大桥正在扩容，为更多列车，也为更多初次到来的人留出位置。";
    assert.match(html, /acatine-greenport-br-memorial\.[^" ]+\.webp/);
    assert.ok(html.includes(acatineStoryBody), "Acatine 的格林波特大桥故事必须按语言进入静态页面");
    assert.match(
      html,
      /class="community-profile__story-link"[^>]+aria-haspopup="dialog"[^>]+data-community-story-open/,
    );
    assert.match(html, /class="community-media-dialog"[^>]+data-community-media-dialog/);
    assert.doesNotMatch(html, /class="community-profile__story-link"[^>]+target="_blank"/);
    assert.ok(
      html.includes(communityMessages[locale].mottoPending),
      "没有投稿 Motto 的玩家也必须保留资料字段",
    );
    assert.doesNotMatch(html, new RegExp(`class="community-profile__motto">${storyBody}`));
    for (const role of ["owner", "administrator", "mayor"] as const)
      assert.ok(html.includes(communityMessages[locale].playerRoles[role]));
    assert.match(html, /data-home-journey-picker/);
    const headerLinks = [...html.matchAll(/<a\b[^>]*data-header-menu-link[^>]*>/g)].map(
      (match) => match[0],
    );
    const communityLinks = headerLinks.filter((link) =>
      link.includes(`href="/${locale}/community/"`),
    );
    assert.equal(communityLinks.length, 1, "仅手机更多菜单收录社区；桌面使用独立主导航牌");
    assert.match(html, /class="home-nav community-nav"[^>]*aria-current="page"/);
    assert.match(html, /id="community-connections"/);
    assert.doesNotMatch(
      html,
      /community-district__english|station-marker[^\s]*\.svg|community-map-route/,
    );
    for (const link of communityLinks) assert.match(link, /aria-current="page"/);
    for (const link of headerLinks.filter((link) => link.includes(`href="/${locale}/"`)))
      assert.doesNotMatch(link, /aria-current/);
    for (const alternate of locales.filter((candidate) => candidate !== locale)) {
      assert.ok(html.includes(`href="/${alternate}/community/"`), "切换语言不能误回首页");
    }
    assert.doesNotMatch(html, /src="https?:\/\/[^\"]*(?:crafatar|mc-heads|minotar)/);
  }
});

test("已确认服务器使用核实名称和入口，未知外部团体仍不伪造身份或链接", () => {
  assert.deepEqual(
    communityEntities.flatMap((entity) =>
      entity.profile?.kind === "partner"
        ? [
            {
              id: entity.id,
              kind: entity.kind,
              name: entity.name,
              href: entity.href,
              partnerId: entity.profile.partnerId,
            },
          ]
        : [],
    ),
    [
      {
        id: "urasaka",
        kind: "server",
        name: "浦坂 Urasaka",
        href: undefined,
        partnerId: "urasaka",
      },
      {
        id: "hydcraft",
        kind: "server",
        name: "HydCraft",
        href: "https://hydcraft.cn",
        partnerId: "hydcraft",
      },
      {
        id: "nebulaecraft",
        kind: "server",
        name: "NebulaeCraft",
        href: "https://wiki.knebulae.com/wiki/%E9%A6%96%E9%A1%B5",
        partnerId: "nebulaecraft",
      },
    ],
  );
  const groupPlaceholder = communityEntities.find((entity) => entity.id === "group-placeholder");
  assert.equal(groupPlaceholder?.kind, "group");
  assert.equal(groupPlaceholder?.name, undefined);
  assert.equal(groupPlaceholder?.href, undefined);
});

test("已确认友好服务器显示关系年份，等待相遇只留给未确认对象", () => {
  for (const locale of locales) {
    const html = readFileSync(
      new URL(`../dist/${locale}/community/index.html`, import.meta.url),
      "utf8",
    );
    const profiles = communityMessages[locale].partnerProfiles;
    assert.ok(html.includes(profiles.hydcraft.status!));
    assert.ok(html.includes(profiles.nebulaecraft.status!));
    assert.ok(html.includes(communityMessages[locale].partnerNote));
  }
});

test("用户确认的 FR 玩家逐一保留，未核实 Java 档案者不伪造 UUID", () => {
  const players = communityEntities.filter((entity) => entity.kind === "player");
  const playerByName = new Map(players.map((player) => [player.name, player]));

  for (const name of [
    "EricH_SPT",
    "HabQi",
    "John_Mail",
    "Odeinjul",
    "tudo_",
    "Extravagate",
    "Thomasxyx",
    "ThirteenRoil",
    "DylanAndy1107",
    "kuroh1ro",
    "Sad_Tsui",
    "ScienRyz",
  ])
    assert.ok(playerByName.has(name));

  assert.match(playerByName.get("EricH_SPT")?.playerUuid ?? "", /^[0-9a-f]{32}$/);
  const acatineProfile = playerByName.get("Acatine")?.profile;
  assert.equal(acatineProfile?.kind, "player");
  if (acatineProfile?.kind !== "player") throw new Error("Acatine 应保留玩家资料。");
  assert.equal(acatineProfile.motto, "蒲塘桥民");
  assert.equal(acatineProfile.storyId, "acatine-greenport-br-memorial");
  const thomasProfile = playerByName.get("Thomasxyx")?.profile;
  assert.equal(thomasProfile?.kind, "player");
  if (thomasProfile?.kind !== "player") throw new Error("Thomasxyx 应保留玩家资料。");
  assert.equal(thomasProfile.motto, "希望Fetarute和其玩家们的明天会更好~");
  const katsutaProfile = playerByName.get("Katsuta_Minamoto")?.profile;
  assert.equal(katsutaProfile?.kind, "player");
  if (katsutaProfile?.kind !== "player") throw new Error("Katsuta_Minamoto 应保留玩家资料。");
  assert.equal(katsutaProfile.storyId, "katsuta-minamoto");
  assert.equal(katsutaProfile.motto, undefined, "未填写 Motto 仍是明确的资料状态");
  assert.deepEqual(
    Object.fromEntries(
      [
        "Acatine",
        "Thomasxyx",
        "Hot945",
        "Katsuta_Minamoto",
        "Complex_Colors",
        "LanYuvu",
        "John_Mail",
        "HabQi",
      ].map((name) => [name, playerByName.get(name)?.playerRole]),
    ),
    {
      Acatine: "owner",
      Thomasxyx: "owner",
      Hot945: "administrator",
      Katsuta_Minamoto: "mayor",
      Complex_Colors: "mayor",
      LanYuvu: "mayor",
      John_Mail: "mayor",
      HabQi: "mayor",
    },
  );
});
