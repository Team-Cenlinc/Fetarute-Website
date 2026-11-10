// astro.config.ts 在配置加载阶段读取本文件来过滤 sitemap，因此这里只依赖站点数据与语言列表，不引入任何文案模块：
// 否则每改一句文案都会被 Astro 视为配置依赖变化而重启开发服务器。
import { locales, type Locale } from "../i18n/config.ts";
import { siteInfo } from "./site.ts";

/** 已开放收录的页面身份；决定 llms 文件引用哪一页自己的标题与描述，而不是都套用首页文案。 */
export type IndexablePageKey = "home" | "community" | "info";

/** 已经具备完整正文、可向搜索引擎和 AI 工具公开引用的静态页面。 */
export interface IndexablePage {
  /** 页面身份；同一身份在每种语言下各有一个地址。 */
  key: IndexablePageKey;
  /** 该页面实际生成所在的语言目录。 */
  locale: Locale;
  /** 不带查询参数的公开路径；同时是 sitemap 的唯一收录判断依据。 */
  path: string;
}

/**
 * 开放收录的页面在语言目录之后的路径。
 * 公告与指南的正文页仍保持 noindex，因此不在这里登记。
 */
const indexablePagePaths: Readonly<Record<IndexablePageKey, string>> = {
  home: "",
  community: "community/",
  info: "info/",
};

/** 开放收录的页面身份，顺序即 llms 文件中的列出顺序。 */
export const indexablePageKeys = Object.keys(indexablePagePaths) as readonly IndexablePageKey[];

/**
 * 当前公开页面的唯一收录白名单：三种语言的首页、社区页与资讯页。
 * 根路径只是 noindex 跳转页，公告与指南正文也尚未开放，因此都不能因为文件存在而被 sitemap 或 llms.txt 提前发现。
 */
export const indexablePages: readonly IndexablePage[] = indexablePageKeys.flatMap((key) =>
  locales.map((locale) => ({
    key,
    locale,
    path: `/${locale}/${indexablePagePaths[key]}`,
  })),
);

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
