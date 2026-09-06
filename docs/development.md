# Fetarute 网站开发与发布指南

本文档集中记录 Fetarute 官网的技术架构、本地开发、内容维护与发布流程。面向访客的 Fetarute 介绍保留在仓库根目录的
[`README.md`](../README.md)。

## 技术栈

- Astro SSG：默认静态生成，适合 Minecraft 服务器官网、公告、规则和指南。
- TypeScript：使用 Astro strict 配置。
- Astro Content Collections：管理公告和指南内容。
- `@astrojs/sitemap`：从已发布的三语页面生成 sitemap，并与 robots.txt 共用收录边界。
- Sharp：生成稳定的社交预览 PNG，并把已确认玩家的公开 Minecraft 皮肤预缓存为本地头像。
- npm + Node 24：`.nvmrc` 和 `package.json#engines` 已固定到 Node 24 系列。

## 本地开发

安装依赖并启动开发服务器：

```sh
npm install
npm run dev
```

提交前至少运行：

```sh
npm run check
git diff --check
```

`npm run check` 包含 Prettier、Astro 类型检查、Node 原生测试与最终静态构建。

真实浏览器回归覆盖列车对齐、续行正文与页尾、反向滚动、减少动态，以及 PIDS 双向切换、手动选择保持、整行地图命中、复制成功和失败反馈。先构建并在
`4323` 端口启动预览，再使用本机已有的 Playwright 和 Chrome 运行：

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4323
```

```sh
node --test test/*.browser.mjs
```

如果 Playwright 位于仓库外，用 `FETARUTE_PLAYWRIGHT_MODULE` 指定其模块绝对路径；
`FETARUTE_HOME_TEST_URL` 可覆盖预览地址，`FETARUTE_TEST_BROWSER=webkit`
可检查已安装的 WebKit。这项检查独立于 `npm run check`，不为项目安装新的浏览器依赖。

`test/home-tooltip.browser.mjs`
还会对比同一段滚动中 Tooltip 开关前后的实际布局次数，并从标题区发起原生触摸滑动，防止跟随定位逐帧回流或局部手势被吞掉。这两项使用 Chromium
CDP；WebKit 覆盖弹窗边界、触摸开关、键盘与跳站关闭。本机浏览器结果不替代 iPhone
Safari 真机滚动验收。

`test/home-scroll-frame.browser.mjs`
在真实页面的动画帧中检查列车样式写入与窗口布局读取顺序，并验证静止列车不会重复提交样式。滚动位置必须与 DOMRect 在 read 阶段一起采样，后续路线与章节同步只消费快照；WebKit 的
`scrollY` getter 会进入同步布局更新，不能把它当作 write 阶段的普通数值读取。

启示湾车身和点击区域在进入正文前与轨道共用文档定位，纵向滚动不依赖路线帧追赶；上述测试会暂停路线帧，检查原生滚动时仍然同轴，并覆盖文档定位与视口定位的双向交接。
`test/home-train-alignment.browser.mjs`
还覆盖启示湾、三服汇、同岸和续行横轨的往返行驶：横轨两端必须共用同一实测中心线，弯轨的 SVG 缩放与车位的整数盒模型不能引入额外纵向位移。

地址栏高度变化时，列车和 Tooltip 在统一帧中采用最新可见视口；120ms 稳定计时只延迟章节与 URL 同步。上述帧回归会模拟地址栏收放，检查同岸、交接段与续行每帧响应高度变化，且计时结束后不会补跳。

`test/home-departure-gate.browser.mjs`
覆盖拖卡期间的可见高度与顶部偏移变化：前景重排必须保留卡片相对指针的位置，并同步重建 Validator 命中基准；连续小步拖动仍按最初按下位置判断，松手早于视口刷新帧也使用最新命中区。桌面退回 Home 后停止 Gate 视口监听，重新激活时恢复；相同视口读数不重复写样式。

## 图片与字体资产

社交分享卡会在普通构建前自动生成；需要单独更新时运行：

```sh
npm run social-card:build
```

同岸故事加入或更新玩家头像时，传入 Java 版玩家名，从 Mojang 公开档案刷新本地缓存：

```sh
npm run avatar:cache -- Acatine Hot945
```

字体子集化：

```sh
npm run font:extract
npm run font:subset
npm run build:with-fonts
```

完整字体源文件放在 `fonts-source/`，生成的 woff2 放在 `src/assets/fonts/`。普通 `npm run build`
不依赖完整字体；具体放置与更新步骤见[字体子集化指南](font-subset.md)。

## GitHub Actions

`Verify` workflow 会在 pull request 和 `main` 推送时执行字体子集一致性检查，并运行 `npm run check`。

`Deploy GitHub Pages` workflow 会在 `main` 推送或手动触发时：

1. 安装锁文件指定的依赖；
2. 重新生成字体子集，并拒绝未提交的生成差异；
3. 运行完整的 `npm run check`；
4. 只把通过门禁的 `dist/` 上传并部署到 GitHub Pages。

本地 `git commit` 会由 Husky 先格式化暂存文件，再执行字体子集一致性检查与
`npm run check`。如果格式化引入新的 CJK 字符，需要将 `scripts/font-subset/chars.txt`
与重新生成的 woff2 文件一并暂存后再提交。

## GitHub Pages 发布

仓库的 Pages Source 需选择 **GitHub Actions**，Custom domain 设为 `fetarute.org`。正式 canonical 与
`public/CNAME` 同样指向 `fetarute.org`；DNS、Custom domain 与 Enforce HTTPS 设置在仓库外管理。

根域名需要通过 A、AAAA、ALIAS 或 ANAME 记录指向 GitHub Pages。`www.fetarute.org` 可以继续 CNAME 到
`team-cenlinc.github.io`，由 GitHub Pages 重定向到正式根域名。`wiki`
与各环境地图使用各自独立的 DNS 记录，不随官网根域名配置变更。

每次更换 CDN 或缓存规则后，都要对正式域名执行一次响应头验收。使用支持自动解压的客户端分别请求 HTML、构建生成的 JavaScript/CSS、SVG 和 JSON，并确认
`Content-Encoding` 为 `br` 或 `gzip`；对文件名带长 hash 的 `/_astro/` 资源还要确认 `Cache-Control`
包含 `public`、较长的 `max-age` 和 `immutable`。这些是部署环境的验收项，不能由只读取 `dist/`
的静态输出测试代替。

```bash
curl --compressed -sS -D - -o /dev/null https://fetarute.org/en/
curl --compressed -sS -D - -o /dev/null https://fetarute.org/_astro/<hashed-asset>.js
curl --compressed -sS -D - -o /dev/null https://fetarute.org/_astro/<hashed-asset>.css
curl --compressed -sS -D - -o /dev/null https://fetarute.org/favicon.svg
curl --compressed -sS -D - -o /dev/null https://fetarute.org/site.webmanifest
```

## 目录结构

```text
public/                 浏览器图标、Web App Manifest 与构建生成的社交分享卡等需原样发布的品牌文件
fonts-source/           完整字体源文件，仅用于本地生成子集，不直接发布
scripts/
  cache-minecraft-avatars.ts  从 Mojang 公开皮肤生成同岸故事使用的方形本地头像
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
  lib/               全站共享的轻量浏览器行为
  pages/             Astro 页面路由
  styles/            全局样式和品牌变量
  content.config.ts  内容集合 schema
test/                   Node 原生测试与独立浏览器回归，覆盖静态约定、页面行为和铁路对齐
```

## 内容维护

- 公告：`src/content/news/`
- 指南：`src/content/guides/`
- 站点名称、服务器地址、品牌图片与语言无关的主导航结构：`src/data/site.ts`
- 公开语言、普通界面文案、各语言 SEO 描述与本地化链接：`src/i18n/`
- 公告和指南需在 frontmatter 标明 `locale` 与 `translationKey`，同一内容的翻译共用关联键。

当前三语首页已实现启动导视、出发验票、随机实景 Arrival、服连快线章节、响应式铁路图片 Gallery、同岸社群故事与续行出发厅。Gallery 在桌面将纵向阅读进度映射为横向浏览，在小屏改为带当前焦点变化的原生纵向图片列；续行只公开已确认的 QQ 门户群加入入口。公告与指南内容仍保留在 Content
Collections 中，但首页暂不展示公告列表。
