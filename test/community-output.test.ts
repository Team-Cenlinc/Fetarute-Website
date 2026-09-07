import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { communityEntities } from "../src/data/community.ts";
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

test("社区样本明确保留外部团体占位，不为未知伙伴伪造身份或链接", () => {
  const placeholders = communityEntities.filter((entity) => entity.kind !== "player");
  assert.ok(placeholders.some((entity) => entity.kind === "server"));
  assert.ok(placeholders.some((entity) => entity.kind === "group"));
  for (const entity of placeholders) {
    assert.equal(entity.name, undefined);
    assert.equal(entity.href, undefined);
  }
});
