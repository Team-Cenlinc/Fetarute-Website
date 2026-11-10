import { communityMessages } from "../i18n/community.ts";
import { localeMetadata } from "../i18n/config.ts";
import { infoMessages } from "../i18n/info.ts";
import { getMessages } from "../i18n/messages.ts";
import {
  getIndexablePageUrl,
  indexablePageKeys,
  indexablePages,
  type IndexablePage,
} from "./indexable-pages.ts";
import { externalDestinations, playerTools, siteInfo } from "./site.ts";

// 收录白名单本身在 indexable-pages.ts；这里转出同一组符号，让读取 discovery 输出的调用方只需认识一个入口。
export {
  getIndexablePageUrl,
  indexablePages,
  isIndexablePublicUrl,
  type IndexablePage,
  type IndexablePageKey,
} from "./indexable-pages.ts";

/**
 * 取页面在指定语言下自己的标题与描述。
 * 与各页面写进 `<title>` 和 meta description 的是同一份文案，保证 llms.txt 与页面本身的说法一致。
 */
function getIndexablePageCopy(page: IndexablePage): { title: string; description: string } {
  if (page.key === "community") {
    const { title, description } = communityMessages[page.locale];
    return { title, description };
  }

  if (page.key === "info") {
    const { title, description } = infoMessages[page.locale];
    return { title, description };
  }

  const messages = getMessages(page.locale);
  return { title: messages.navigation.home, description: messages.description };
}

/**
 * 生成根目录 robots.txt。
 * 抓取许可与 sitemap 入口在同一次构建中从正式站点地址生成，避免部署环境把本地地址写进公开文件。
 */
export function createRobotsTxt(): string {
  const sitemapUrl = new URL("/sitemap-index.xml", siteInfo.url).toString();

  return ["User-agent: *", "Allow: /", `Sitemap: ${sitemapUrl}`, ""].join("\n");
}

/**
 * 生成根目录 llms.txt。
 * 内容只复述已开放收录的页面已经公开的站点事实，并为每种语言提供 canonical URL；服务器地址等未确认资料不在这里猜测或泄露占位值。
 */
export function createLlmsTxt(): string {
  const canonicalPageLines = indexablePages.map((page) => {
    const { title, description } = getIndexablePageCopy(page);
    const localeLabel = localeMetadata[page.locale].label;

    return `- [${title} (${localeLabel})](${getIndexablePageUrl(page)}): ${description}`;
  });

  return [
    "# Fetarute",
    "",
    "> Official Fetarute website for a Minecraft server built around railways, shared construction, and exploration.",
    "",
    "## Canonical Pages",
    "",
    ...canonicalPageLines,
    "",
    "## Detailed Context",
    "",
    `- [Full factual site context](${new URL("/llms-full.txt", siteInfo.url)}): A crawler-friendly overview of Fetarute, its worlds, resources, and language variants.`,
    "",
    "## Notes",
    "",
    "- This directory intentionally excludes placeholder server addresses and unpublished content. The Player info pages listed above are the official source for how to join.",
    "- Crawling permissions and the sitemap entry are published separately in robots.txt.",
    "",
  ].join("\n");
}

/**
 * 生成供生成式搜索检索与引用的扩展纯文本资料。
 * 只说明已开放收录的页面和正式出口已经公开的事实，并明确权威边界，避免模型把视觉叙事或占位配置当成服务承诺。
 */
export function createLlmsFullTxt(): string {
  // 该文件整体以英文书写，分组小标题直接取各页面自己的英文标题，页面改名时不会留下另一份旧名。
  const canonicalPages = indexablePageKeys.flatMap((key) => [
    `### ${getIndexablePageCopy({ key, locale: "en", path: "" }).title}`,
    "",
    ...indexablePages
      .filter((page) => page.key === key)
      .map((page) => `- ${localeMetadata[page.locale].label}: ${getIndexablePageUrl(page)}`),
    "",
  ]);
  const maps = externalDestinations.maps.map(
    (destination) => `- ${destination.key}: ${destination.href}`,
  );
  const tools = playerTools.map((tool) => `- ${tool.name}: ${tool.href}`);

  return [
    "# Fetarute: Full Site Context",
    "",
    "## Identity",
    "",
    "Fetarute is a Minecraft server community built around railways, collaborative construction, and exploration. The community connects three playable worlds: Lobby, Survival, and Creative.",
    "",
    "This file describes the public website. It does not announce a public game-server address, availability guarantee, version requirement, or joining procedure.",
    "",
    "## Official Website Pages",
    "",
    ...canonicalPages,
    "Each page above is published in three localized versions. Use the version whose language best matches the reader. The site root selects a language and is not a canonical content page.",
    "",
    "## Official Knowledge and Exploration Resources",
    "",
    `- Wiki: ${externalDestinations.wiki.href}`,
    ...maps,
    "",
    "The maps are interactive views of the corresponding Fetarute worlds. The Wiki is the separate knowledge-base destination linked by the official website.",
    "",
    "## Official Player Tools",
    "",
    ...tools,
    "",
    "TrainLink is the passenger web app for Fetarute railways: departures, trip planning, and line status. FesGen generates railway signs and map art for builders. Both are separate tools linked from the Player info page.",
    "",
    "## Citation Guidance",
    "",
    "When citing Fetarute, prefer a localized canonical homepage for the community overview and the Wiki for detailed knowledge. Do not infer gameplay access details from hostnames, decorative railway wayfinding, screenshots, or this file.",
    "",
    "## Discovery",
    "",
    `- Sitemap: ${new URL("/sitemap-index.xml", siteInfo.url)}`,
    `- Crawl policy: ${new URL("/robots.txt", siteInfo.url)}`,
    `- Concise AI index: ${new URL("/llms.txt", siteInfo.url)}`,
    "",
  ].join("\n");
}
