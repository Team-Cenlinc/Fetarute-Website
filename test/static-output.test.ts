import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { siteInfo } from "../src/data/site.ts";
import { defaultLocale, localeMetadata, type Locale } from "../src/i18n/config.ts";
import { getMessages } from "../src/i18n/messages.ts";

const publicHomeLocales = ["zh-Hans", "zh-Hant", "en"] as const satisfies readonly Locale[];
const homeCommunitySource = readFileSync(
  new URL("../src/components/HomeCommunitySection.astro", import.meta.url),
  "utf8",
);

/** 读取一次真实 Astro 构建后的语言首页，避免只检查组件源码而漏掉最终 HTML 变换。 */
function readStaticHomeHtml(locale: Locale): string {
  return readFileSync(new URL(`../dist/${locale}/index.html`, import.meta.url), "utf8");
}

/** 读取不承载正文的根入口；它只负责语言推断与无脚本默认回退。 */
function readStaticRootHtml(): string {
  return readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
}

/** 将标题内部标记压平成搜索抓取器能直接读取的文本，用于发现视觉副本造成的重复。 */
function extractText(markup: string): string {
  return markup
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** 从一个已经匹配到的静态标签读取属性；测试只关心最终 HTML，不绑定 Astro 源码中的属性顺序。 */
function getAttribute(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"))?.[1];
}

/** 按属性身份定位 head 标签，避免把 Open Graph、Twitter 与标准 description 混为同一项。 */
function findHeadTag(
  html: string,
  tagName: "link" | "meta",
  attributeName: string,
  attributeValue: string,
): string | undefined {
  return Array.from(
    html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, "gi")),
    ({ 0: tag }) => tag,
  ).find((tag) => getAttribute(tag, attributeName) === attributeValue);
}

/** 读取同岸短故事的完整 article，供延迟媒体契约检查。 */
function findCommunityStories(html: string, attributeName: string): string[] {
  return Array.from(
    html.matchAll(
      new RegExp(`<article\\b[^>]*${attributeName}="[^"]+"[^>]*>[\\s\\S]*?<\\/article>`, "gi"),
    ),
    ({ 0: article }) => article,
  );
}

test("三语言静态首页各自只输出一个不重复的主标题", () => {
  for (const locale of publicHomeLocales) {
    const html = readStaticHomeHtml(locale);
    const headings = Array.from(html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi));

    assert.equal(headings.length, 1, `${locale} 首页应只有一个 h1`);
    assert.equal(extractText(headings[0][1]), getMessages(locale).home.title);
  }
});

test("同岸非初始短故事只保存响应式媒体描述，不输出可立即请求的图片 URL", () => {
  for (const locale of publicHomeLocales) {
    const html = readStaticHomeHtml(locale);

    for (const attributeName of [
      "data-home-community-memory-story",
      "data-home-community-presence-story",
    ]) {
      const stories = findCommunityStories(html, attributeName);
      assert.ok(stories.length > 1, `${locale} ${attributeName} 应保留完整故事池`);

      assert.match(stories[0], /home-community__short-media[\s\S]*?<img\b[^>]*\ssrc="/i);
      for (const story of stories.slice(1)) {
        assert.doesNotMatch(story, /<img\b[^>]*\ssrc(?:set)?="/i);
        const deferredPicture = story.match(
          /<picture\b[^>]*data-home-community-deferred-picture[^>]*>([\s\S]*?)<\/picture>/i,
        )?.[1];
        assert.ok(deferredPicture, `${locale} 的隐藏故事应输出延迟 picture 描述`);
        assert.match(deferredPicture, /data-home-community-deferred-src="[^"]+"/i);
        assert.match(deferredPicture, /data-home-community-deferred-srcset="[^"]+\s\d+w/i);
        assert.match(deferredPicture, /\salt="[^"]+"/i);
      }
    }
  }
});

test("同岸客户端在故事切换与 details 展开时提交延迟媒体及替代文本", () => {
  assert.match(homeCommunitySource, /image\.alt = homeCommunityDeferredAlt/);
  assert.match(homeCommunitySource, /details\.addEventListener\("toggle"/);
  assert.match(homeCommunitySource, /details\.open && storyElement/);
  assert.match(homeCommunitySource, /if \(selected\) \{\s+loadStoryImages\(storyElement\)/);
  assert.match(homeCommunitySource, /preloadSelectedStoryImages\(storyElement\)/);
  assert.match(homeCommunitySource, /image\.loading = "eager"/);
  assert.match(homeCommunitySource, /image\.srcset = homeCommunityDeferredSrcset/);
  assert.match(homeCommunitySource, /image\.src = homeCommunityDeferredSrc/);
});

test("根入口与三语言首页都声明 edge-to-edge viewport，保持 Safari 与 Portal 的安全区契约一致", () => {
  const pageHtmlByLabel = [
    ["root", readStaticRootHtml()],
    ...publicHomeLocales.map((locale) => [locale, readStaticHomeHtml(locale)] as const),
  ] as const;

  for (const [label, html] of pageHtmlByLabel) {
    const viewportTag = findHeadTag(html, "meta", "name", "viewport");

    assert.equal(
      getAttribute(viewportTag ?? "", "content"),
      "width=device-width, initial-scale=1, viewport-fit=cover",
      `${label} 应允许浏览器从首帧建立 edge-to-edge viewport`,
    );
  }
});

test("启动序列不会成为三语言搜索摘要的候选正文", () => {
  for (const locale of publicHomeLocales) {
    const html = readStaticHomeHtml(locale);
    const launchOpeningTag = html.match(/<section\b[^>]*class="launch-sequence"[^>]*>/i)?.[0];

    assert.ok(launchOpeningTag, `${locale} 首页应输出启动序列`);
    assert.match(launchOpeningTag, /\sdata-nosnippet(?:\s|=|>)/i);
  }
});

test("三语言静态首页不输出重复 DOM id", () => {
  for (const locale of publicHomeLocales) {
    const html = readStaticHomeHtml(locale);
    const ids = Array.from(html.matchAll(/\sid="([^"]+)"/gi), (match) => match[1]);
    const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];

    assert.deepEqual(duplicateIds, [], `${locale} 首页存在重复 id: ${duplicateIds.join(", ")}`);
  }
});

test("三语言静态首页输出完整且一致的可索引元数据", () => {
  for (const locale of publicHomeLocales) {
    const html = readStaticHomeHtml(locale);
    const messages = getMessages(locale);
    const canonicalUrl = `${siteInfo.url}/${locale}/`;
    const descriptionTag = findHeadTag(html, "meta", "name", "description");
    const canonicalTag = findHeadTag(html, "link", "rel", "canonical");
    const robotsTag = findHeadTag(html, "meta", "name", "robots");
    const openGraphUrlTag = findHeadTag(html, "meta", "property", "og:url");
    const openGraphDescriptionTag = findHeadTag(html, "meta", "property", "og:description");
    const twitterDescriptionTag = findHeadTag(html, "meta", "name", "twitter:description");

    assert.match(html, new RegExp(`<html\\s+lang="${localeMetadata[locale].languageTag}"`, "i"));
    assert.equal(extractText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? ""), siteInfo.name);
    assert.equal(getAttribute(descriptionTag ?? "", "content"), messages.description);
    assert.doesNotMatch(messages.description, /正在建设|正在建設|under construction/i);
    assert.equal(getAttribute(canonicalTag ?? "", "href"), canonicalUrl);
    assert.equal(
      getAttribute(robotsTag ?? "", "content"),
      "index, follow, max-image-preview:large",
    );
    assert.equal(getAttribute(openGraphUrlTag ?? "", "content"), canonicalUrl);
    assert.equal(getAttribute(openGraphDescriptionTag ?? "", "content"), messages.description);
    assert.equal(getAttribute(twitterDescriptionTag ?? "", "content"), messages.description);

    for (const alternateLocale of publicHomeLocales) {
      const alternate = findHeadTag(
        html,
        "link",
        "hreflang",
        localeMetadata[alternateLocale].languageTag,
      );
      assert.equal(getAttribute(alternate ?? "", "href"), `${siteInfo.url}/${alternateLocale}/`);
    }
    const defaultAlternate = findHeadTag(html, "link", "hreflang", "x-default");
    assert.equal(getAttribute(defaultAlternate ?? "", "href"), `${siteInfo.url}/`);

    const structuredDataMarkup = html.match(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i,
    )?.[1];
    assert.ok(structuredDataMarkup, `${locale} 首页应输出 JSON-LD`);
    const structuredData = JSON.parse(structuredDataMarkup);
    const webPage = structuredData["@graph"].find(
      (item: { "@type": string }) => item["@type"] === "WebPage",
    );
    assert.equal(webPage.url, canonicalUrl);
    assert.equal(webPage.description, messages.description);
    assert.equal(webPage.inLanguage, localeMetadata[locale].languageTag);
  }
});

test("根入口按浏览器语言推断三种公开路由并保留查询与深链", () => {
  const html = readStaticRootHtml();
  const redirectScript = html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
  assert.ok(redirectScript, "根入口应在首帧执行语言推断");

  const cases = [
    { languages: ["zh-TW"], expectedLocale: "zh-Hant" },
    { languages: ["zh-Hant-HK"], expectedLocale: "zh-Hant" },
    { languages: ["zh-HK"], expectedLocale: "zh-Hant" },
    { languages: ["zh-CN"], expectedLocale: "zh-Hans" },
    { languages: ["zh"], expectedLocale: "zh-Hans" },
    { languages: ["en-US"], expectedLocale: "en" },
    { languages: ["fr-FR", "en-GB"], expectedLocale: "en" },
    { languages: ["fr-FR"], expectedLocale: "zh-Hans" },
  ] as const;

  for (const { languages, expectedLocale } of cases) {
    let destination = "";
    const location = {
      search: "?from=launch",
      hash: "#tri-server-joint",
      replace(nextDestination: string) {
        destination = nextDestination;
      },
    };
    runInNewContext(redirectScript, {
      navigator: { languages, language: languages[0] },
      window: { location },
    });
    assert.equal(destination, `/${expectedLocale}/?from=launch#tri-server-joint`);
  }
});

test("根入口保持 noindex、完整 hreflang 与无脚本默认回退", () => {
  const html = readStaticRootHtml();
  const robotsTag = findHeadTag(html, "meta", "name", "robots");
  const canonicalTag = findHeadTag(html, "link", "rel", "canonical");

  assert.equal(getAttribute(robotsTag ?? "", "content"), "noindex, follow");
  assert.equal(getAttribute(canonicalTag ?? "", "href"), `${siteInfo.url}/`);
  assert.match(
    html,
    /<noscript>\s*<meta\s+http-equiv="refresh"\s+content="0;url=\/zh-Hans\/"\s*\/?>(?:\s*)<\/noscript>/i,
  );

  for (const locale of publicHomeLocales) {
    const alternate = findHeadTag(html, "link", "hreflang", localeMetadata[locale].languageTag);
    assert.equal(getAttribute(alternate ?? "", "href"), `${siteInfo.url}/${locale}/`);
  }
  const defaultAlternate = findHeadTag(html, "link", "hreflang", "x-default");
  assert.equal(getAttribute(defaultAlternate ?? "", "href"), `${siteInfo.url}/`);
});

test("根入口为不执行语言跳转的分享抓取器输出站点级预览", () => {
  const html = readStaticRootHtml();
  const messages = getMessages(defaultLocale);
  const expectedImageUrl = new URL(siteInfo.socialImage, siteInfo.url).toString();
  const descriptionTag = findHeadTag(html, "meta", "name", "description");
  const openGraphTitleTag = findHeadTag(html, "meta", "property", "og:title");
  const openGraphDescriptionTag = findHeadTag(html, "meta", "property", "og:description");
  const openGraphUrlTag = findHeadTag(html, "meta", "property", "og:url");
  const openGraphImageTag = findHeadTag(html, "meta", "property", "og:image");
  const openGraphSecureImageTag = findHeadTag(html, "meta", "property", "og:image:secure_url");
  const openGraphImageTypeTag = findHeadTag(html, "meta", "property", "og:image:type");
  const openGraphImageWidthTag = findHeadTag(html, "meta", "property", "og:image:width");
  const openGraphImageHeightTag = findHeadTag(html, "meta", "property", "og:image:height");
  const openGraphImageAltTag = findHeadTag(html, "meta", "property", "og:image:alt");
  const twitterCardTag = findHeadTag(html, "meta", "name", "twitter:card");
  const twitterTitleTag = findHeadTag(html, "meta", "name", "twitter:title");
  const twitterDescriptionTag = findHeadTag(html, "meta", "name", "twitter:description");
  const twitterImageTag = findHeadTag(html, "meta", "name", "twitter:image");
  const twitterImageAltTag = findHeadTag(html, "meta", "name", "twitter:image:alt");

  assert.equal(extractText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? ""), siteInfo.name);
  assert.equal(getAttribute(descriptionTag ?? "", "content"), messages.description);
  assert.equal(getAttribute(openGraphTitleTag ?? "", "content"), siteInfo.name);
  assert.equal(getAttribute(openGraphDescriptionTag ?? "", "content"), messages.description);
  assert.equal(getAttribute(openGraphUrlTag ?? "", "content"), `${siteInfo.url}/`);
  assert.equal(getAttribute(openGraphImageTag ?? "", "content"), expectedImageUrl);
  assert.equal(getAttribute(openGraphSecureImageTag ?? "", "content"), expectedImageUrl);
  assert.equal(getAttribute(openGraphImageTypeTag ?? "", "content"), "image/png");
  assert.equal(getAttribute(openGraphImageWidthTag ?? "", "content"), "1200");
  assert.equal(getAttribute(openGraphImageHeightTag ?? "", "content"), "630");
  assert.equal(getAttribute(openGraphImageAltTag ?? "", "content"), messages.socialImageAlt);
  assert.equal(getAttribute(twitterCardTag ?? "", "content"), "summary_large_image");
  assert.equal(getAttribute(twitterTitleTag ?? "", "content"), siteInfo.name);
  assert.equal(getAttribute(twitterDescriptionTag ?? "", "content"), messages.description);
  assert.equal(getAttribute(twitterImageTag ?? "", "content"), expectedImageUrl);
  assert.equal(getAttribute(twitterImageAltTag ?? "", "content"), messages.socialImageAlt);
});

test("根入口的文档语言与默认分享语言保持一致", () => {
  const html = readStaticRootHtml();
  const openGraphLocaleTag = findHeadTag(html, "meta", "property", "og:locale");

  assert.match(
    html,
    new RegExp(`<html\\s+lang="${localeMetadata[defaultLocale].languageTag}"`, "i"),
  );
  assert.equal(
    getAttribute(openGraphLocaleTag ?? "", "content"),
    localeMetadata[defaultLocale].openGraphLocale,
  );
});

test("构建后的 discovery 文件只公开正式页面与正式描述", () => {
  const robotsTxt = readFileSync(new URL("../dist/robots.txt", import.meta.url), "utf8");
  const llmsTxt = readFileSync(new URL("../dist/llms.txt", import.meta.url), "utf8");
  const sitemap = readFileSync(new URL("../dist/sitemap-0.xml", import.meta.url), "utf8");

  assert.match(robotsTxt, /^Sitemap: https:\/\/fetarute\.org\/sitemap-index\.xml$/m);
  assert.doesNotMatch(llmsTxt, /正在建设|正在建設|under construction/i);
  assert.doesNotMatch(llmsTxt, /play\.fetarute\.example/);

  for (const locale of publicHomeLocales) {
    const canonicalUrl = `${siteInfo.url}/${locale}/`;
    assert.match(llmsTxt, new RegExp(canonicalUrl.replaceAll("/", "\\/")));
    assert.match(sitemap, new RegExp(`<loc>${canonicalUrl.replaceAll("/", "\\/")}</loc>`));
  }
});

test("GitHub Pages 自定义域名与 canonical 来源保持一致", () => {
  const cname = readFileSync(new URL("../dist/CNAME", import.meta.url), "utf8").trim();

  assert.equal(cname, new URL(siteInfo.url).hostname);
});
