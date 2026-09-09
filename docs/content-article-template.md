# 内容文章模板

本模板适用于 `src/content/` 内由 Astro Content Collections 发布的 Markdown 文章。公告属于
`news`，长期有效的加入、准备与探索内容属于 `guides`；不要新建泛用的 `articles` 集合来混合两者。

## 使用规则

1. 先判断内容是否会过期：活动、维护与版本更新写入 `news`；可长期查阅的操作说明写入 `guides`。
2. 公告按年份与日期归档，例如
   `src/content/news/2026/2026-09-09-server-maintenance/zh-Hans.md`；长期指南按读者任务归档，例如
   `src/content/guides/join/zh-Hans.md`。同一篇文章的三语版本和其 `assets/`
   放在同一目录。三语版本必须使用相同 `translationKey`，但不能以一种语言的正文代替另一种语言。
3. frontmatter 是文章的元数据头，字段必须与 `src/content.config.ts` 的 schema 一致。`authors`
   至少写一位内容责任人；团队名称可作为组织署名。日期使用 `YYYY-MM-DD`；`locale` 只能是 `zh-Hans`、
   `zh-Hant` 或 `en`。
4. 页面已经渲染文章标题与摘要，因此正文从 `##` 开始，不再重复 Markdown 的 `# 标题`。
5. 服务器名称、地址、入口链接等全站事实应以 `src/data/site.ts`
   为准；正文只解释读者需要的背景、步骤与限制。尚未确认的地址、日期、规则或外部链接不要写入正式内容。
6. 文章图片放在文章目录的 `assets/` 中，并在正文使用
   `![替代文本](./assets/图片名.png)`；本地图片会进入 Astro 优化管线。`public/`
   图片会原样发布，不能作为普通文章图片。外部链接应写明目标是什么，避免使用“点击这里”。
7. 普通文章优先使用 `.md`；只有需要受控 `<Picture>`、图片说明或其他组件时才使用 `.mdx`，并复用
   `src/components/content/ArticleImage.astro`，不要在文章里手写多套图片输出策略。加入指南需要 QQ 申请入口时使用
   `<QqPortalGroup locale="zh-Hans" />`；群号与复制行为由组件统一维护，不要把群号再写进正文。

## 公告模板：`news`

复制到 `src/content/news/<year>/<YYYY-MM-DD-translationKey>/<locale>.md`。`updatedAt`
仅在首次发布后确有内容更新时填写；置顶结束后应改回 `false`。如有封面，在同目录 `assets/`
放置源图，并同时填写 `cover` 和 `coverAlt`。

```md
---
translationKey: "<stable-kebab-case-key>"
locale: "zh-Hans"
title: "<公告标题>"
description: "<一句话说明公告的影响或重点。>"
authors: ["<作者或维护团队>"]
cover: "./assets/cover.png" # 没有封面时删除本行和下一行
coverAlt: "<封面传达的信息描述>"
publishedAt: "YYYY-MM-DD"
updatedAt: "YYYY-MM-DD" # 没有更新时删除整行
pinned: false
---

## 概要

<先说明发生了什么、影响谁，以及读者是否需要行动。>

## 时间与影响

- **时间：** <开始、结束或预计恢复时间；时区明确时一并写出>
- **影响范围：** <服务器、功能、玩家或无影响>
- **需要做什么：** <无需操作，或明确步骤>

## 详细说明

<按读者需要提供背景、变更内容或已知限制。>

## 后续安排

<说明下一次更新、恢复确认方式，或在没有后续事项时删除本节。>
```

## 指南模板：`guides`

复制到 `src/content/guides/<task>/<locale>.md`，例如 `guides/join/zh-Hans.md`。`order`
越小越靠前；核心“加入服务器”指南建议保留较小且稳定的数字，不要因新增普通文章而频繁重排。如有封面，在同目录
`assets/` 放置源图，并同时填写 `cover` 和 `coverAlt`。

```md
---
translationKey: "<stable-kebab-case-key>"
locale: "zh-Hans"
title: "<指南标题，例如：加入 Fetarute>"
description: "<一句话说明读者完成本指南后能做到什么。>"
authors: ["<作者或维护团队>"]
cover: "./assets/cover.png" # 没有封面时删除本行和下一行
coverAlt: "<封面传达的信息描述>"
order: 10
---

## 适用对象

<说明本指南面向首次加入的玩家、回归玩家，或特定服务器/线路的访客。>

## 开始前准备

- <版本、客户端、账号或规则方面的已确认前提>
- <读者需要事先准备的内容>

## 操作步骤

1. <可执行的第一步。>
2. <可验证的第二步。>
3. <完成后的预期结果。>

## 加入后与探索建议

<给出第一站、可用入口或探索方向；只使用已确认的站点事实与链接。>

## 常见问题

### <问题>

<简短、可操作的解答。>

## 需要帮助？

<指向已确认的求助渠道；若暂无正式渠道，删除本节。>
```

## 发布前检查

- [ ] 文件位于正确的年份或任务目录；同一文章的 `assets/`、三语版本和稳定 `translationKey` 彼此对应。
- [ ] frontmatter 通过 schema；翻译版本共用 `translationKey`，但正文已完整本地化。
- [ ] `authors` 明确写出内容责任人；不确定个人姓名时使用可确认的维护团队名称。
- [ ] 标题、摘要、日期、版本、服务器地址和外部链接都已确认且仍然有效。
- [ ] 正文没有重复一级标题；层级从 `##` 开始，步骤与图片有清晰说明。
- [ ] 公告只保留必要的置顶；指南的 `order` 与读者旅程相符。
- [ ] 图片位于文章自己的 `assets/`；每张正文图片都有准确替代文字，封面同时具有 `cover` 与
      `coverAlt`。
- [ ] 运行 `npm run check` 与 `git diff --check`。
