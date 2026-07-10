# Fetarute-Website

Fetarute 服务器官网 · 新版

## 技术栈

- Astro SSG：默认静态生成，适合 Minecraft 服务器官网、公告、规则和指南。
- TypeScript：使用 Astro strict 配置。
- Astro Content Collections：管理公告和指南内容。
- npm + Node 24：`.nvmrc` 和 `package.json#engines` 已固定到 Node 24 系列。

## 开发命令

```sh
npm install
npm run dev
```

常规验证：

```sh
npm run check
git diff --check
```

## 目录结构

```text
src/
  components/        可复用 Astro 组件
  content/           公告、指南等内容
  data/              站点级静态数据
  layouts/           页面布局
  pages/             Astro 页面路由
  styles/            全局样式和品牌变量
  content.config.ts  内容集合 schema
```

## 内容维护

- 公告：`src/content/news/`
- 指南：`src/content/guides/`
- 站点名称、默认描述、服务器地址、主导航：`src/data/site.ts`

当前首页是项目骨架，不是最终视觉方案。正式设计前应先确认服务器定位、真实地址、版本、玩法模块、加入流程和需要公开的社区入口。
