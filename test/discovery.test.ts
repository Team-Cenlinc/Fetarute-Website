import assert from "node:assert/strict";
import test from "node:test";
import {
  createLlmsFullTxt,
  createLlmsTxt,
  createRobotsTxt,
  isIndexablePublicUrl,
} from "../src/data/discovery.ts";

test("只把三语首页、社区页、资讯页与已开放的指南暴露给 discovery 输出", () => {
  const publishedUrls = ["zh-Hans", "zh-Hant", "en"].flatMap((locale) =>
    ["", "community/", "info/"].map((path) => `https://fetarute.org/${locale}/${path}`),
  );

  for (const url of publishedUrls) {
    assert.equal(isIndexablePublicUrl(url), true, `${url} 应开放收录`);
  }

  assert.equal(isIndexablePublicUrl("https://fetarute.org/"), false);
  assert.equal(isIndexablePublicUrl("https://fetarute.org/zh-Hans/join/"), false);
  // 「申请加入」指南已开放收录，三种语言都进入 sitemap；公告正文仍是 noindex。
  for (const locale of ["zh-Hans", "zh-Hant", "en"]) {
    assert.equal(isIndexablePublicUrl(`https://fetarute.org/${locale}/guides/join/`), true);
  }
  assert.equal(isIndexablePublicUrl("https://fetarute.org/zh-Hans/guides/unlisted/"), false);
  assert.equal(isIndexablePublicUrl("https://fetarute.org/zh-Hans/news/site-foundation/"), false);
});

test("robots.txt 指向构建生成的 sitemap，llms.txt 不泄露占位服务器地址", () => {
  const robotsTxt = createRobotsTxt();
  const llmsTxt = createLlmsTxt();

  assert.match(robotsTxt, /^User-agent: \*$/m);
  assert.match(robotsTxt, /^Sitemap: https:\/\/fetarute\.org\/sitemap-index\.xml$/m);
  assert.match(llmsTxt, /^# Fetarute$/m);
  assert.match(llmsTxt, /https:\/\/fetarute\.org\/zh-Hans\//);
  assert.match(llmsTxt, /https:\/\/fetarute\.org\/zh-Hant\//);
  assert.match(llmsTxt, /https:\/\/fetarute\.org\/en\//);
  // 社区页与资讯页各用自己的标题，而不是都被列成首页。
  assert.match(
    llmsTxt,
    /^- \[社区中心 \(.+\)\]\(https:\/\/fetarute\.org\/zh-Hans\/community\/\): /m,
  );
  assert.match(llmsTxt, /^- \[Player info \(.+\)\]\(https:\/\/fetarute\.org\/en\/info\/\): /m);
  assert.match(llmsTxt, /https:\/\/fetarute\.org\/llms-full\.txt/);
  assert.doesNotMatch(llmsTxt, /play\.fetarute\.example/);
});

test("llms-full.txt 提供可引用的站点实体、语言与正式资源边界", () => {
  const llmsFullTxt = createLlmsFullTxt();

  assert.match(llmsFullTxt, /^# Fetarute: Full Site Context$/m);
  assert.match(llmsFullTxt, /Lobby, Survival, and Creative/);
  assert.match(llmsFullTxt, /https:\/\/wiki\.fetarute\.org/);
  assert.match(llmsFullTxt, /https:\/\/map\.survival\.fetarute\.org/);
  assert.match(llmsFullTxt, /^### Player info$/m);
  assert.match(llmsFullTxt, /https:\/\/fetarute\.org\/zh-Hant\/community\//);
  assert.match(llmsFullTxt, /^- TrainLink: https:\/\/trainlink\.fetarute\.info\/$/m);
  assert.match(llmsFullTxt, /^- FesGen: https:\/\/team-cenlinc\.github\.io\/FesGen\/$/m);
  assert.match(llmsFullTxt, /does not announce a public game-server address/);
  assert.doesNotMatch(llmsFullTxt, /play\.fetarute\.example/);
});
