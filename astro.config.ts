import { defineConfig, fontProviders } from "astro/config";
import { siteInfo } from "./src/data/site";
import { defaultLocale, locales } from "./src/i18n/config";

export default defineConfig({
  // Fetarute 官网默认按静态站点发布；需要账号、订单或后台能力时再评估 SSR。
  output: "static",
  // 正式站点地址用于在静态构建阶段生成稳定的 canonical 和分享链接。
  site: siteInfo.url,
  /**
   * 静态多语言路由配置。
   * 所有语言都拥有路径前缀，根路径只作为默认简中入口的兼容跳转，避免不同语言的 canonical 结构不对称。
   */
  i18n: {
    locales: [...locales],
    defaultLocale,
    routing: {
      prefixDefaultLocale: true,
      // 根路径由 index.astro 生成唯一的静态跳转，避免内建跳转与文件路由争夺同一个输出文件。
      redirectToDefaultLocale: false,
    },
  },
  /**
   * 本地 Noto Sans 字体配置。
   *
   * 只引用由子集脚本生成的 woff2；Display 是英文与数字的默认字形，SC 是当前简体中文站点的 CJK 面孔。
   * TC、JP 和 Display Italic 保持按需加载，分别为未来的繁中、日文和英文斜体强调保留正确字形。
   */
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Fetarute Sans SC",
      cssVariable: "--font-fetarute-sans-sc",
      display: "swap",
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/noto-sans-sc-subset.woff2"],
            weight: "100 900",
            style: "normal",
          },
        ],
      },
      fallbacks: ["PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "sans-serif"],
      optimizedFallbacks: false,
    },
    {
      provider: fontProviders.local(),
      name: "Fetarute Sans TC",
      cssVariable: "--font-fetarute-sans-tc",
      display: "swap",
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/noto-sans-tc-subset.woff2"],
            weight: "100 900",
            style: "normal",
          },
        ],
      },
      fallbacks: ["PingFang TC", "Microsoft JhengHei", "sans-serif"],
      optimizedFallbacks: false,
    },
    {
      provider: fontProviders.local(),
      name: "Fetarute Sans JP",
      cssVariable: "--font-fetarute-sans-jp",
      display: "swap",
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/noto-sans-jp-subset.woff2"],
            weight: "100 900",
            style: "normal",
          },
        ],
      },
      fallbacks: ["Hiragino Sans", "Yu Gothic", "Meiryo", "sans-serif"],
      optimizedFallbacks: false,
    },
    {
      provider: fontProviders.local(),
      name: "Fetarute Display",
      cssVariable: "--font-fetarute-display",
      display: "swap",
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/noto-sans-display-subset.woff2"],
            weight: "100 900",
            style: "normal",
            stretch: "62.5% 100%",
          },
        ],
      },
      // 此处不写 generic fallback，让缺少的 CJK 字符继续落到 CSS 中紧随其后的本地 Noto Sans 面孔。
      fallbacks: [],
      optimizedFallbacks: false,
    },
    {
      provider: fontProviders.local(),
      name: "Fetarute Display Italic",
      cssVariable: "--font-fetarute-display-italic",
      display: "swap",
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/noto-sans-display-italic-subset.woff2"],
            weight: "100 900",
            style: "italic",
            stretch: "62.5% 100%",
          },
        ],
      },
      // 斜体与常规 Display 一样不吞掉 CJK fallback，混排文字仍会交给当前语言对应的 Noto Sans 面孔。
      fallbacks: [],
      optimizedFallbacks: false,
    },
  ],
});
