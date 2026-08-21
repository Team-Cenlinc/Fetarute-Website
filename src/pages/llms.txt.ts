import type { APIRoute } from "astro";
import { createLlmsTxt } from "../data/discovery";

/**
 * llms.txt 静态端点。
 * 它为支持该约定的 AI 工具提供已发布资料目录，不替代 robots.txt 的抓取许可或页面本身的权威内容。
 */
export const GET: APIRoute = () => {
  return new Response(createLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
