import { getAbsoluteLocaleUrl, getRelativeLocaleUrl } from "astro:i18n";
import type { Locale } from "@/i18n/config";

/**
 * 生成 locale URL 时保持配置中的 BCP 47 大小写。
 * Astro helper 默认会将 `zh-Hans` 规范化为小写；本项目的静态目录则使用公开约定的标准大小写。
 */
const localeUrlOptions = { normalizeLocale: false };

/**
 * 生成站内的本地化相对链接。
 * 所有语言化链接均通过此函数构造，避免根路径、锚点和未来独立页面各自拼接 locale 前缀。
 */
export function getLocalizedRelativeUrl(locale: Locale, path = "", fragment?: string): string {
  const href = getRelativeLocaleUrl(locale, path, localeUrlOptions);

  return fragment ? `${href}#${fragment}` : href;
}

/**
 * 生成 canonical、hreflang 等 metadata 使用的本地化绝对链接。
 * 路径与相对链接共享同一套大小写规则，保证静态产物与搜索引擎声明完全一致。
 */
export function getLocalizedAbsoluteUrl(locale: Locale, path = ""): string {
  return getAbsoluteLocaleUrl(locale, path, localeUrlOptions);
}
