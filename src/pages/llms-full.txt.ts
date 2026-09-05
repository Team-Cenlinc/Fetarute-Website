import type { APIRoute } from "astro";
import { createLlmsFullTxt } from "../data/discovery";

/** 为需要更多上下文的生成式搜索工具输出静态、可引用且不依赖脚本的站点事实。 */
export const GET: APIRoute = () => {
  return new Response(createLlmsFullTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
