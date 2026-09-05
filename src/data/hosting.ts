import { defaultLocale, locales, type Locale } from "../i18n/config.ts";

/** GitHub Pages 根路径语言入口在静态发布时需要遵守的公开配置。 */
export interface RootLanguageEntry {
  /** 当前部署平台决定根路径只能提供静态 HTML，而不能读取请求头。 */
  readonly hosting: "github-pages";
  /** 根入口在浏览器中选择语言，避免把首次访问语言固化为 HTTP 永久重定向。 */
  readonly negotiation: "client-static-fallback";
  /** 未知语言和无脚本访问统一进入的默认公开路径。 */
  readonly defaultPath: `/${Locale}/`;
  /** 所有已发布语言首页的白名单，不能由浏览器语言字符串直接拼接。 */
  readonly localizedPaths: Readonly<Record<Locale, `/${Locale}/`>>;
}

/** 将公开语言代码转换为带尾部斜杠的静态首页路径，供入口白名单统一复用。 */
function getPublishedLocalePath(locale: Locale): `/${Locale}/` {
  return `/${locale}/`;
}

/** 从唯一的 i18n 发布语言集合建立入口路径映射，避免页面自行复制路径字面量。 */
function createLocalizedPaths(): Record<Locale, `/${Locale}/`> {
  return Object.fromEntries(
    locales.map((locale) => [locale, getPublishedLocalePath(locale)]),
  ) as Record<Locale, `/${Locale}/`>;
}

/**
 * GitHub Pages 根入口语言回退。
 *
 * Pages 不能根据 Accept-Language 返回边缘重定向或为根路径设置 Vary；根页面因此保留客户端选择和
 * 无脚本默认回退。迁移到具备请求头规则的平台时，边缘层应先经过真实响应验收，再替换该静态入口。
 */
export const rootLanguageEntry: RootLanguageEntry = {
  hosting: "github-pages",
  negotiation: "client-static-fallback",
  defaultPath: getPublishedLocalePath(defaultLocale),
  localizedPaths: createLocalizedPaths(),
};
