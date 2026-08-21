import type { APIRoute } from "astro";
import { createRobotsTxt } from "../data/discovery";

/**
 * robots.txt 静态端点。
 * Astro SSG 在构建期生成根目录文本文件；内容与 sitemap 入口由 discovery 数据层共同维护。
 */
export const GET: APIRoute = () => {
  return new Response(createRobotsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
