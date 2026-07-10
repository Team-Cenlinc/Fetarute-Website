import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const news = defineCollection({
  // 公告适合构建期收集，保证首页和公告页可以静态生成并获得类型校验。
  loader: glob({ base: "./src/content/news", pattern: "**/*.{md,mdx}" }),
  // 公告 frontmatter 约束首页卡片和未来公告页列表需要的标题、摘要、发布时间与置顶状态。
  schema: z.object({
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
  // 指南 frontmatter 约束列表排序和摘要展示；缺省排序靠后，便于先写少量核心指南。
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().int().nonnegative().default(100),
  }),
});

export const collections = { news, guides };
