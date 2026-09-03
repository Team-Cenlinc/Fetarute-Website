import assert from "node:assert/strict";
import test from "node:test";
import { createLlmsTxt, createRobotsTxt, isIndexablePublicUrl } from "../src/data/discovery.ts";

test("只把三个已发布的语言首页暴露给 discovery 输出", () => {
  const publishedHomeUrls = [
    "https://fetarute.org/zh-Hans/",
    "https://fetarute.org/zh-Hant/",
    "https://fetarute.org/en/",
  ];

  for (const url of publishedHomeUrls) {
    assert.equal(isIndexablePublicUrl(url), true);
  }

  assert.equal(isIndexablePublicUrl("https://fetarute.org/"), false);
  assert.equal(isIndexablePublicUrl("https://fetarute.org/zh-Hans/join/"), false);
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
  assert.doesNotMatch(llmsTxt, /play\.fetarute\.example/);
});
