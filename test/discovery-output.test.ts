import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { externalDestinations } from "../src/data/site.ts";
import type { Locale } from "../src/i18n/config.ts";
import { getMessages } from "../src/i18n/messages.ts";

const publicHomeLocales = ["zh-Hans", "zh-Hant", "en"] as const satisfies readonly Locale[];

/** 读取真实 Astro 构建后的语言首页，使发现关系与 JSON-LD 断言覆盖最终 HTML。 */
function readStaticHomeHtml(locale: Locale): string {
  return readFileSync(new URL(`../dist/${locale}/index.html`, import.meta.url), "utf8");
}

/** 从一个已经匹配到的静态标签读取属性，不依赖 Astro 输出的属性顺序。 */
function getAttribute(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"))?.[1];
}

/** 按 rel 定位最终 head 中的链接，避免把 hreflang alternate 与 AI 描述文件混淆。 */
function findLinkByRel(html: string, rel: string): string | undefined {
  return Array.from(html.matchAll(/<link\b[^>]*>/gi), ({ 0: tag }) => tag).find(
    (tag) => getAttribute(tag, "rel") === rel,
  );
}

test("三语言首页把 llms.txt 声明为页面描述文件", () => {
  for (const locale of publicHomeLocales) {
    const llmsDescriptor = findLinkByRel(readStaticHomeHtml(locale), "describedby");

    assert.equal(getAttribute(llmsDescriptor ?? "", "href"), "/llms.txt");
  }
});

test("Organization 保持站点级描述且不把知识库误报为身份等价页", () => {
  for (const locale of publicHomeLocales) {
    const html = readStaticHomeHtml(locale);
    const structuredDataMarkup = html.match(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i,
    )?.[1];
    assert.ok(structuredDataMarkup, `${locale} 首页应输出 JSON-LD`);

    const structuredData = JSON.parse(structuredDataMarkup);
    const organization = structuredData["@graph"].find(
      (item: { "@type": string }) => item["@type"] === "Organization",
    );

    assert.equal(organization.description, getMessages(locale).description);
    assert.equal(organization.sameAs, undefined);
  }
});

test("构建后的 llms-full.txt 保留正式资源与服务器接入事实边界", () => {
  const llmsFullTxt = readFileSync(new URL("../dist/llms-full.txt", import.meta.url), "utf8");

  assert.doesNotMatch(llmsFullTxt, /play\.fetarute\.example/);
  assert.match(llmsFullTxt, /does not announce a public game-server address/i);
  assert.match(llmsFullTxt, new RegExp(externalDestinations.wiki.href.replaceAll("/", "\\/")));

  for (const map of externalDestinations.maps) {
    assert.match(llmsFullTxt, new RegExp(map.href.replaceAll("/", "\\/")));
  }
});
