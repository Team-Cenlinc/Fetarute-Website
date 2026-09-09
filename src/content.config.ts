import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { locales } from "@/i18n/config";

const news = defineCollection({
  // 公告适合构建期收集，保证首页和公告页可以静态生成并获得类型校验。
  loader: glob({ base: "./src/content/news", pattern: "**/*.{md,mdx}" }),
  // 公告 frontmatter 同时约束翻译关联、封面图片和当前语言，首页只能读取与页面 locale 匹配的条目。
  schema: ({ image }) =>
    z
      .object({
        translationKey: z.string().min(1),
        locale: z.enum(locales),
        title: z.string(),
        description: z.string(),
        /** 至少记录一位内容责任人；团队名称可作为稳定的组织署名。 */
        authors: z.array(z.string().trim().min(1)).min(1),
        /** 与文章同目录的本地封面会被 Astro 识别为可优化图片，而不是 public 原样资源。 */
        cover: image().optional(),
        /** 封面替代文字与图片成对出现，确保读者和辅助技术得到同等信息。 */
        coverAlt: z.string().trim().min(1).optional(),
        publishedAt: z.coerce.date(),
        updatedAt: z.coerce.date().optional(),
        pinned: z.boolean().default(false),
      })
      .refine((data) => Boolean(data.cover) === Boolean(data.coverAlt), {
        message: "cover 与 coverAlt 必须同时提供或同时省略",
        path: ["coverAlt"],
      }),
});

const guides = defineCollection({
  // 指南用于沉淀加入服务器、客户端准备、规则说明等长期内容。
  loader: glob({ base: "./src/content/guides", pattern: "**/*.{md,mdx}" }),
  // 指南 frontmatter 约束翻译关联、封面图片、列表排序和摘要展示；缺省排序靠后，便于先写少量核心指南。
  schema: ({ image }) =>
    z
      .object({
        translationKey: z.string().min(1),
        locale: z.enum(locales),
        title: z.string(),
        description: z.string(),
        /** 指南同样必须标注责任作者，方便长期内容在更新时找到维护人。 */
        authors: z.array(z.string().trim().min(1)).min(1),
        /** 指南封面必须是文章目录内的可追踪本地资源，方便构建期生成现代格式。 */
        cover: image().optional(),
        /** 替代文字让封面不只服务于视觉读者，并与 cover 的存在状态保持一致。 */
        coverAlt: z.string().trim().min(1).optional(),
        order: z.number().int().nonnegative().default(100),
      })
      .refine((data) => Boolean(data.cover) === Boolean(data.coverAlt), {
        message: "cover 与 coverAlt 必须同时提供或同时省略",
        path: ["coverAlt"],
      }),
});

export const collections = { news, guides };
