import { locales, localeMetadata, type Locale } from "../i18n/config.ts";
import { getMessages } from "../i18n/messages.ts";
import { siteInfo } from "./site.ts";

/** 已经具备完整正文、可向搜索引擎和 AI 工具公开引用的静态页面。 */
export interface IndexablePage {
  /** 该页面实际生成所在的语言目录。 */
  locale: Locale;
  /** 不带查询参数的公开路径；同时是 sitemap 的唯一收录判断依据。 */
  path: string;
}

/**
 * 当前公开页面的唯一收录白名单。
 * 根路径只是 noindex 跳转页，内容集合也尚未有对应的公开路由，因此都不能因为文件存在而被 sitemap 或 llms.txt 提前发现。
 */
export const indexablePages: readonly IndexablePage[] = locales.map((locale) => ({
  locale,
  path: `/${locale}/`,
}));

/**
 * 生成静态页面的规范绝对 URL。
 * 此处只接受白名单中的站内路径，确保 robots、llms 和 sitemap 始终从同一个站点 origin 派生。
 */
export function getIndexablePageUrl(page: IndexablePage): string {
  return new URL(page.path, siteInfo.url).toString();
}

/**
 * 判断构建器提供的 URL 是否属于已公开的规范页面。
 * `@astrojs/sitemap` 会枚举所有静态产物；这个边界防止根路径跳转页、文本端点和将来的未发布路由进入搜索索引。
 */
export function isIndexablePublicUrl(url: string): boolean {
  let pageUrl: URL;

  try {
    pageUrl = new URL(url);
  } catch {
    return false;
  }

  const siteOrigin = new URL(siteInfo.url).origin;

  return (
    pageUrl.origin === siteOrigin && indexablePages.some((page) => page.path === pageUrl.pathname)
  );
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
 * 内容只复述已发布首页已经公开的站点事实，并为每种语言提供 canonical URL；服务器地址等未确认资料不在这里猜测或泄露占位值。
 */
export function createLlmsTxt(): string {
  const canonicalPageLines = indexablePages.map((page) => {
    const messages = getMessages(page.locale);
    const localeLabel = localeMetadata[page.locale].label;

    return `- [${messages.navigation.home} (${localeLabel})](${getIndexablePageUrl(page)}): ${messages.description}`;
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
    "## Notes",
    "",
    "- This directory intentionally excludes placeholder server-address, join, and unpublished-content details.",
    "- Crawling permissions and the sitemap entry are published separately in robots.txt.",
    "",
  ].join("\n");
}
