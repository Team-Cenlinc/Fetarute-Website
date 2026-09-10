import { getCollection, type CollectionEntry } from "astro:content";
import type { WebMcpArticle } from "@/data/webmcp";
import { locales, type Locale } from "@/i18n/config";
import { getLocalizedAbsoluteUrl } from "@/i18n/links";

/**
 * 读取指定语言的最近公告，置顶条目优先。
 * 内容语言由 frontmatter 明确声明；缺少翻译时不会把另一语言的公告静默混入当前页面。
 */
export async function getLocalizedNews(locale: Locale): Promise<CollectionEntry<"news">[]> {
  return (await getCollection("news", ({ data }) => data.locale === locale)).sort(
    (left, right) =>
      Number(right.data.pinned) - Number(left.data.pinned) ||
      Number(right.data.publishedAt) - Number(left.data.publishedAt),
  );
}

/**
 * 在构建期把公告与指南集合派生成 WebMCP 可检索的目录。
 * 发布边界与 `src/pages/[locale]/{news,guides}/[slug].astro` 的 `getStaticPaths` 完全一致：集合中的每个条目都会生成一个静态页面，
 * 因此目录直接消费集合，既不会硬编码一份随内容漂移的清单，也不会把 `indexable={false}`（爬虫收录边界）误读成未发布。
 * 排序沿用站内既有约定：指南按 order 再按标题，公告置顶优先再按发布时间倒序；指南在前，因为「怎么加入」这类长期问题比时效公告更常被问到。
 */
export async function getWebMcpArticleCatalogue(): Promise<WebMcpArticle[]> {
  const [news, guides] = await Promise.all([getCollection("news"), getCollection("guides")]);

  /** 同一 translationKey 在集合内实际存在的语言，用于如实报告翻译覆盖而不是静默回退到另一种语言。 */
  const getAvailableLocales = (
    entries: readonly { data: { translationKey: string; locale: Locale } }[],
    translationKey: string,
  ): Locale[] =>
    locales.filter((locale) =>
      entries.some(
        (entry) => entry.data.translationKey === translationKey && entry.data.locale === locale,
      ),
    );

  const guideArticles: WebMcpArticle[] = [...guides]
    .sort(
      (left, right) =>
        left.data.order - right.data.order || left.data.title.localeCompare(right.data.title),
    )
    .map((entry) => ({
      collection: "guides" as const,
      translationKey: entry.data.translationKey,
      locale: entry.data.locale,
      title: entry.data.title,
      description: entry.data.description,
      url: getLocalizedAbsoluteUrl(entry.data.locale, `guides/${entry.data.translationKey}`),
      availableLocales: getAvailableLocales(guides, entry.data.translationKey),
    }));

  const newsArticles: WebMcpArticle[] = [...news]
    .sort(
      (left, right) =>
        Number(right.data.pinned) - Number(left.data.pinned) ||
        Number(right.data.publishedAt) - Number(left.data.publishedAt),
    )
    .map((entry) => ({
      collection: "news" as const,
      translationKey: entry.data.translationKey,
      locale: entry.data.locale,
      title: entry.data.title,
      description: entry.data.description,
      url: getLocalizedAbsoluteUrl(entry.data.locale, `news/${entry.data.translationKey}`),
      availableLocales: getAvailableLocales(news, entry.data.translationKey),
      publishedAt: entry.data.publishedAt.toISOString(),
      ...(entry.data.updatedAt ? { updatedAt: entry.data.updatedAt.toISOString() } : {}),
      pinned: entry.data.pinned,
    }));

  return [...guideArticles, ...newsArticles];
}
