import { defineConfig } from "astro/config";

export default defineConfig({
  // Fetarute 官网默认按静态站点发布；需要账号、订单或后台能力时再评估 SSR。
  output: "static",
});
