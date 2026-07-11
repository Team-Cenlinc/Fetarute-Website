import { defineConfig } from "astro/config";
import { siteInfo } from "./src/data/site";

export default defineConfig({
  // Fetarute 官网默认按静态站点发布；需要账号、订单或后台能力时再评估 SSR。
  output: "static",
  // 正式站点地址用于在静态构建阶段生成稳定的 canonical 和分享链接。
  site: siteInfo.url,
});
