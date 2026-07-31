/**
 * 当前对外发布的语言。
 * 值同时是 Astro 文件路由中的目录名，因此保留 BCP 47 的标准大小写；新增语言必须同时补齐页面、文案和内容集合。
 */
export const locales = ["zh-Hans", "zh-Hant", "en"] as const;

/** 当前网站可渲染的语言代码。 */
export type Locale = (typeof locales)[number];

/** 根路径及未指定语言内容默认进入的公开语言。 */
export const defaultLocale = "zh-Hans";

/**
 * 每种公开语言在 HTML、分享卡片和界面切换器中所需的元数据。
 * URL 路径与 BCP 47 语言标签分别维护，避免路径规则改变时意外影响浏览器语言与日期格式。
 */
export interface LocaleMetadata {
  /** HTML `lang`、`hreflang` 与 Intl 使用的标准语言标签。 */
  languageTag: string;
  /** Open Graph 要求的下划线语言区域格式。 */
  openGraphLocale: string;
  /** 通过语言切换器向读者展示的完整名称。 */
  label: string;
  /** 顶栏有限宽度内显示的短名称。 */
  shortLabel: string;
}

/**
 * 网站语言的展示与 SEO 元数据。
 * 简繁中文均保留中文铁路领域名称，但所有普通界面文案、内容和 metadata 都按这里的语言代码独立生成。
 */
export const localeMetadata: Record<Locale, LocaleMetadata> = {
  "zh-Hans": {
    languageTag: "zh-Hans",
    openGraphLocale: "zh_CN",
    label: "简体中文",
    shortLabel: "简",
  },
  "zh-Hant": {
    languageTag: "zh-Hant",
    openGraphLocale: "zh_TW",
    label: "繁體中文",
    shortLabel: "繁",
  },
  en: {
    languageTag: "en",
    openGraphLocale: "en_US",
    label: "English",
    shortLabel: "EN",
  },
};

/**
 * 判断未知字符串是否为当前可生成的语言。
 * 内容 frontmatter 和未来动态路由都应先通过此函数收窄类型，避免把未发布语言写入静态链接。
 */
export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
