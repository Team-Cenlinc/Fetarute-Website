# Fetarute-Website

Fetarute 服务器官网 · 新版

## 技术栈

- Astro SSG：默认静态生成，适合 Minecraft 服务器官网、公告、规则和指南。
- TypeScript：使用 Astro strict 配置。
- Astro Content Collections：管理公告和指南内容。
- `@astrojs/sitemap`：从已发布的三语页面生成 sitemap，并与 robots.txt 共用收录边界。
- Sharp：在构建期把既有 Logo、首页场景和铁路数据合成为稳定的社交预览 PNG。
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

社交分享卡会在普通构建前自动生成；需要单独更新时运行：

```sh
npm run social-card:build
```

GitHub Actions 会在 pull request 和 `main` 推送时执行字体子集一致性检查，并运行同一条
`npm run check`，其中包含 Prettier、Astro 类型检查与静态构建。

本地 `git commit` 会由 Husky 先格式化暂存文件，再执行字体子集一致性检查与
`npm run check`；若子集产物有更新，需将生成的文件一并暂存后重新提交。

字体子集化：

```sh
npm run font:extract
npm run font:subset
npm run build:with-fonts
```

完整字体源文件放在 `fonts-source/`，生成的 woff2 放在 `src/assets/fonts/`。普通 `npm run build`
不依赖完整字体；具体放置与更新步骤见 [`docs/font-subset.md`](docs/font-subset.md)。

## 目录结构

```text
public/                 浏览器图标、Web App Manifest 与构建生成的社交分享卡等需原样发布的品牌文件
fonts-source/           完整字体源文件，仅用于本地生成子集，不直接发布
scripts/
  font-subset/          Node-only 字符抽取与 woff2 子集生成脚本
  generate-social-card.ts  用既有 Logo、首页场景与铁路数据生成分享卡 PNG
src/
  assets/
    fonts/            生成的浏览器 woff2 字体子集
    pages/
      home/           首页场景图等按页面归类的源图片；构建时生成 AVIF/WebP
  components/        可复用 Astro 组件
  content/           公告、指南等内容
  data/              站点级静态数据
  i18n/              公开语言、文案、内容查询与本地化链接
  layouts/           页面布局
  pages/             Astro 页面路由
  styles/            全局样式和品牌变量
  content.config.ts  内容集合 schema
test/                   Node 原生测试，覆盖公开收录与发现文件的输出边界
```

## 内容维护

- 公告：`src/content/news/`
- 指南：`src/content/guides/`
- 站点名称、服务器地址、品牌图片与语言无关的主导航结构：`src/data/site.ts`
- 公开语言、普通界面文案、各语言 SEO 描述与本地化链接：`src/i18n/`
- 公告和指南需在 frontmatter 标明 `locale` 与 `translationKey`，同一内容的翻译共用关联键。

当前首页是项目骨架，不是最终视觉方案。正式设计前应先确认服务器定位、真实地址、版本、玩法模块、加入流程和需要公开的社区入口。
