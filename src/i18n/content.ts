import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "@/i18n/config";

/**
 * 读取指定语言首页可展示的公告。
 * 内容语言由 frontmatter 明确声明；缺少翻译时不会把另一语言的公告静默混入当前页面。
 */
export async function getLocalizedNews(locale: Locale): Promise<CollectionEntry<"news">[]> {
  return (await getCollection("news", ({ data }) => data.locale === locale))
    .sort((left, right) => Number(right.data.publishedAt) - Number(left.data.publishedAt))
    .slice(0, 3);
}
