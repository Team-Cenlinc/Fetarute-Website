import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { locales } from "@/i18n/config";

const news = defineCollection({
  // 公告适合构建期收集，保证首页和公告页可以静态生成并获得类型校验。
  loader: glob({ base: "./src/content/news", pattern: "**/*.{md,mdx}" }),
  // 公告 frontmatter 同时约束翻译关联和当前语言，首页只能读取与页面 locale 匹配的条目。
  schema: z.object({
    translationKey: z.string().min(1),
    locale: z.enum(locales),
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    pinned: z.boolean().default(false),
  }),
});

const guides = defineCollection({
  // 指南用于沉淀加入服务器、客户端准备、规则说明等长期内容。
  loader: glob({ base: "./src/content/guides", pattern: "**/*.{md,mdx}" }),
  // 指南 frontmatter 约束翻译关联、列表排序和摘要展示；缺省排序靠后，便于先写少量核心指南。
  schema: z.object({
    translationKey: z.string().min(1),
    locale: z.enum(locales),
    title: z.string(),
    description: z.string(),
    order: z.number().int().nonnegative().default(100),
  }),
});

export const collections = { news, guides };
