# Fetarute 网站开发与发布指南

本文档集中记录 Fetarute 官网的技术架构、本地开发、内容维护与发布流程。面向访客的 Fetarute 介绍保留在仓库根目录的
[`README.md`](../README.md)。

## 技术栈

- Astro SSG：默认静态生成，适合 Minecraft 服务器官网、公告、规则和指南。
- TypeScript：使用 Astro strict 配置。
- Astro Content Collections：管理公告和指南内容。
- `@astrojs/sitemap`：从已发布的三语页面生成 sitemap，并与 robots.txt 共用收录边界。
- Sharp：生成稳定的社交预览 PNG，并把已确认玩家的公开 Minecraft 皮肤预缓存为本地头像。
- WebMCP：在支持该草案 API 的浏览器中，把官网现有的公开资料和链接安全地注册为代理可调用的只读工具。
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

## WebMCP 渐进增强

`src/lib/webmcp.ts` 通过 `document.modelContext`
能力检查注册五个只读工具：查询 Fetarute 公开概览、取得某一项正式资源 URL、取得特定语言的站内页面 URL、检索公告与指南，以及读取一次公开服务状态。资源和页面白名单集中在
`src/data/webmcp.ts`，并复用 `src/data/site.ts`
的正式链接；不提供占位服务器地址、QQ 群号、玩家数据、剪贴板写入、跨域授权或可改变页面状态的工具。

概览应准确说明私有服务器采用申请审核制，并提示代理用 `find-fetarute-page` 的 `page=info`
和读者语言取得加入指南入口；不返回群号或服务器地址，不等于官网没有加入流程。

当前覆盖范围与后续边界：

- 已覆盖：公开概览、三语 Home / Community /
  Info 页面、Wiki、三张地图与服务状态面板 URL，以及公告与指南的目录检索。
- 未覆盖：玩家人数与名单、可加入的服务器地址、QQ 群号、版本兼容性承诺。
- `llms.txt` / sitemap 是独立的爬虫收录边界，目前仅收录首页；WebMCP 页面白名单不改变这些设置。

### 公告与指南检索

`find-fetarute-articles`
按读者语言检索公告与指南的**标题和摘要**，返回目录条目与正式 URL，不返回正文——正文留给读者在页面上阅读，代理也就不会复述未经审阅的长文。可选参数为
`collection`（`guides` / `news`）、`query` 与
`limit`（1–20，默认 10）；越界或多余参数整体拒绝，而不是回退到默认值。

目录由 `getWebMcpArticleCatalogue()`（`src/i18n/content.ts`）在构建期从 Astro Content
Collections 派生，与 `getLocalizedNews()` 共用同一个内容查询模块，并复用 `getLocalizedAbsoluteUrl()`
生成 URL，不另起一套路由或发布逻辑。发布边界取自 `src/pages/[locale]/{news,guides}/[slug].astro` 的
`getStaticPaths`：集合中的每个条目都会生成一个静态页面，因此目录直接消费集合。两个方向都不能想当然——既不硬编码一份会随内容漂移的文章清单，也不把内容页的
`indexable={false}`（爬虫收录边界）误读成未发布。若将来出现「已进集合但尚不应公开」的内容，必须先在 schema 里显式表达该状态，再让目录消费它。

语言按 frontmatter 精确匹配，沿用站内不做跨语言回退的约定：请求语言没有的条目不会混入结果，而是以
`missingTranslations` 单独列出（含
`availableLocales`），使代理既不会误报语言，也不会声称内容不存在。该清单与 `articles` 一样受 `limit`
截断，并由 `missingTranslationsTotal` 如实报告总数——否则站点内容变多后，代理指定 `limit=1`
仍会收到整站的缺翻译清单，`limit` 就挡不住上下文膨胀。

目录条目的 `url` 按 **origin** 校验，不用前缀匹配：`https://fetarute.org.<其他域>`
这类同前缀的站外地址必须被丢弃，否则一份被篡改的目录就能借工具把读者引向站外。

目录随 `BaseLayout.astro` 以 `application/json`
脚本内嵌到每个页面，静态站点因此不需要为代理检索新增接口或运行时请求。节点缺失、JSON 损坏或条目不合法时按条丢弃；目录为空则**不注册**该工具，其余工具不受影响。

代价是每个页面都带一份完整目录（当前 6 条约 1.5
KB）。它随文章数乘语言数线性增长，且乘以页面数落进静态产物。内容规模明显变大时应改为构建期输出一份独立 JSON 再按需取，而不是继续加大内嵌体积；在那之前内嵌换来的是零额外请求与离线可用。

`test:static`
会逐一检查工具返回的三语页面 URL、页面实际加载的工具注册脚本，以及 Info 的加入指南链接和目标产物；该检查证明静态接线完整，不证明浏览器已经成功注册工具。

WebMCP 仍是浏览器标准草案。普通浏览器没有该 API 时注册层会直接跳过，官网的 Astro 静态内容和已有交互不受影响；因此
`npm run check` 中的 `test:webmcp` 只验证工具契约与失败回退，不能替代在真实浏览器或正式 origin
trial 中完成的端到端发现与调用验收。任何将来新增的写入型工具都必须复用实际 UI 逻辑、严格验证输入，并依据副作用设置
`consequentialHint` 或 `untrustedContentHint`。

### 原生浏览器验收

Chrome 152 把 `chrome://flags/#enable-webmcp-testing` 映射到 `WebMCPTesting`
feature，因此本机 Chrome 加上 `--enable-features=WebMCPTesting` 启动即可得到与手动开旗标一致的原生
`document.modelContext`。 `test/webmcp.browser.mjs`
用这一方式复用仓库既有的浏览器回归运行方式（本机 Playwright +
`channel: "chrome"`），覆盖工具发现、正确调用、非法参数、跨页面导航与重载，并用同版本但未开启 feature 的 Chrome 做失败回退对照组。

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4330
```

```sh
node --test test/webmcp.browser.mjs
```

`FETARUTE_WEBMCP_TEST_URL` 可覆盖预览地址；`FETARUTE_PLAYWRIGHT_MODULE`
与其他浏览器回归共用。这项检查独立于
`npm run check`，不为项目安装新的浏览器依赖。没有可用的原生实现时必须明确记为「未验证」，不能改成向页面注入
`modelContext` 替身后声称原生通过——替身只能证明注册代码路径，不能证明浏览器实现。

需要人工在带界面的 Chrome 里复核时，开启 `chrome://flags/#enable-webmcp-testing`
并重启后，在 DevTools 控制台运行：

```js
for (const [name, input] of [
  ["get-fetarute-overview", {}],
  ["find-fetarute-resource", { resource: "wiki" }],
  ["find-fetarute-page", { page: "info", locale: "zh-Hans" }],
]) {
  const tool = (await document.modelContext.getTools()).find((t) => t.name === name);
  console.log(name, await document.modelContext.executeTool(tool, JSON.stringify(input)));
}
```

### Chrome 152 的调用侧兼容差异

以下差异属于浏览器实现，不是站点契约；写调用侧脚本或读取发现结果时需要按此处理，**不要**据此改动
`src/lib/webmcp.ts` 的回调签名：

- `executeTool(tool, argumentsJson)` 的两个参数都是必需的，缺省第二个参数会抛
  `TypeError`；无入参工具需显式传 `"{}"`。
- 第二个参数必须是 JSON **字符串**。直接传对象会抛
  `UnknownError: Failed to parse input arguments`，在进入站点回调之前就失败；站点 execute 回调收到的仍是解析后的对象。
- 第一个参数必须是 `getTools()` 返回的 `RegisteredTool` 实例，传工具名字符串会抛 `TypeError`。
- `getTools()` 返回的对象不保证注册顺序，并且持有 `window` 引用，不能整体 `JSON.stringify`。
- 发现结果里的 `inputSchema` 是 JSON 字符串，而站点注册时提供的是对象。
- Chrome 152 的发现结果只回传 `readOnlyHint` 与 `untrustedContentHint`，站点声明的
  `consequentialHint` 不会出现；这是实现覆盖范围的差异，站点仍应按真实副作用完整声明标注。
- `executeTool` 的返回值也是 JSON 字符串，需要调用侧自行 `JSON.parse`。
- **Chrome 152 只向 `execute` 传入参**，草案里的执行上下文（含 `AbortSignal`）尚未实现。因此
  `WebMcpTool["execute"]` 的第二个参数必须是可选的，工具内部只能用 `options?.signal`——直接读
  `options.signal` 会抛错，并被兜底的 `catch`
  悄悄退化成失败结果。实时状态工具就曾因此在原生浏览器里一律返回
  `unknown`，单元测试和静态检查都发现不了；`test/webmcp.browser.mjs` 现在会实测这个参数个数。

### 公开服务状态

`get-fetarute-service-status` 无入参，读取一次状态服务并返回入口可用性、Lobby / Survival /
Creative 三个世界的健康度、采样时间与状态面板链接。它复用 Info 页面状态组件的同一套
`getMinecraftStatusUrl()` 与
`parseMinecraftSnapshot()`（`src/lib/minecraft-status.ts`），因此代理的判定与读者在页面上看到的同源；请求时限也已集中为
`minecraftStatusTimeout`，两条读取路径不会给出不同的等待体验。

语义上必须守住三条，测试逐条覆盖：

- **未知不等于离线。** 请求失败、超时或快照不合法都只能得出 `availability: "unknown"`，并把
  `checkedAt`、`ageSeconds`、`freshness` 与三个世界一并置为未知；结果里固定附带一句 `note`
  说明这一点，因为代理很容易把「读不到」讲成「已离线」。
- **采样时间与新鲜度一起返回。** `ageSeconds` 超过一个刷新周期（`minecraftRefreshInterval`）即标为
  `stale`：旧快照仍是事实，但代理必须能看出它可能已不代表此刻。
- **入口可用性与子服务器健康度分开。** 入口在线不代表三个世界都健康，反之亦然。

上游响应里含有玩家人数、名单、MOTD 与版本，工具**一律不透传**，只输出已校验的枚举与时间戳——这也是它在返回第三方来源数据的同时仍可保持
`untrustedContentHint: false`
的原因：没有任何上游自由文本经由该工具流向代理。现有「不返回玩家数据」的边界不因此扩大；要改变它需要单独决定，而不是顺手加字段。

本地预览通过 `astro.config.ts`
里的固定目标转发（`/__minecraft-status`）读取正式 API，因此原生浏览器回归能真正跑通在线分支；
`test/webmcp.browser.mjs` 会先确认该转发可读，可读却仍返回 `unknown`
就判定为取数路径故障，而不是服务不可用。

### 证据边界

不同层级的验证不能互相冒充，报告时必须分开陈述：

- **单元测试**（`test:webmcp`）：只覆盖工具契约、输入收窄、目录解析、状态语义与注册失败回退；状态取数由注入的替身提供，不接触真实网络。
- **静态构建**（`test:static`）：只覆盖工具返回的 URL 与构建产物、注册脚本的接线一致，包括文章目录中每条 URL 与
  `availableLocales` 都对应真实产物、标题与页面 `h1` 一致。
- **本地原生浏览器**（`test/webmcp.browser.mjs`）：覆盖本机 Chrome 152 + `WebMCPTesting`
  下的注册、发现、调用、回调参数个数与回退，其中实时状态经预览转发读到的是正式 API 的真实响应。
- **线上验收**：正式域名的 origin
  trial、代理凭自然语言自主选择工具，均**尚未验证**；本地通过不能代替。

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

`test/home-desktop-layout.browser.mjs`
检查三语桌面短故事的图文分栏、Header 阅读间距、桌面与移动端 PIDS 框外切换按钮，以及 Footer 往返滚动全程的牌体净空；同时覆盖 1024px 断点两侧、手机纵向版式、页尾返回起点的触控与键盘操作、Logo 与版权换行，以及减少动态模式；语言与 Wiki 入口继续由 Header 提供。

桌面精修回归还会检查同岸图内展开文案（窄屏长文允许图片随内容增高）、PIDS 与导视牌的宽度关系、页尾文案组间距，以及窄高窗口和缩放后的 2:1 列车比例。首页的轨道收尾与滚动交接由
`HomeFooter.astro`
负责；将来内容页应使用自然流页尾，复用品牌与版权信息，语言切换沿用 Header，无需继承首页动画。

`test/home-departure-layout.browser.mjs`
检查 Gate 在 320px 手机、横屏、平板与桌面短屏上的读卡机、卡片和略过入口净空，并验证已抵达锚点或缺少
`scrollend` 时不会空等 900ms 才能操作；同时测量现有浅深外观中读卡机小字与实际牌面的合成对比度。既有
`test/home-departure-gate.browser.mjs`
继续覆盖拖卡时的 VisualViewport 重排、键盘验票与回退生命周期。

`test/home-lifecycle.browser.mjs`
使用真实构建产物和受控的浏览器 API，验证章节下载、Clipboard 拒绝与图片 decode 晚于 `pagehide`
时停止续写，并保留 `persisted`
页面返回后的正常行为。它还覆盖旧复制 API 的成功、失败与异常清理，确认临时输入框不残留、键盘焦点回到原按钮。这些事件时序回归不替代真实浏览器往返导航的 BFCache 验收。

`test/home-tooltip.browser.mjs`
还会对比同一段滚动中 Tooltip 开关前后的实际布局次数，并从标题区发起原生触摸滑动，防止跟随定位逐帧回流或局部手势被吞掉。这两项使用 Chromium
CDP；WebKit 覆盖弹窗边界、触摸开关、键盘与跳站关闭。本机浏览器结果不替代 iPhone
Safari 真机滚动验收。

`test/train-tooltip-zoom.browser.mjs` 覆盖两页共用站牌的原生 200% 缩放（Chromium
CDP）、短屏末站触控、关闭按钮的键盘可达性，以及正常尺寸不产生多余滚动。缩放时允许整张站牌原生滚动与站名换行；WebKit 运行短屏触控回归，跳过仅支持 CDP 的缩放用例。

`test/home-scroll-frame.browser.mjs`
在真实页面的动画帧中检查列车样式写入与窗口布局读取顺序，并验证静止列车不会重复提交样式。滚动位置必须与 DOMRect 在 read 阶段一起采样，后续路线与章节同步只消费快照；WebKit 的
`scrollY` getter 会进入同步布局更新，不能把它当作 write 阶段的普通数值读取。

启示湾车身和点击区域在进入正文前与轨道共用文档定位，纵向滚动不依赖路线帧追赶；上述测试会暂停路线帧，检查原生滚动时仍然同轴，并覆盖文档定位与视口定位的双向交接。
`test/home-train-alignment.browser.mjs`
还覆盖启示湾、三服汇、同岸和续行横轨的往返行驶：横轨两端必须共用同一实测中心线，弯轨的 SVG 缩放与车位的整数盒模型不能引入额外纵向位移。

地址栏高度变化时，列车和 Tooltip 在统一帧中采用最新可见视口；120ms 稳定计时只延迟章节与 URL 同步。上述帧回归会模拟地址栏收放，检查同岸、交接段与续行每帧响应高度变化，且计时结束后不会补跳。

`test/home-departure-gate.browser.mjs`
覆盖拖卡期间的可见高度与顶部偏移变化：前景重排必须保留卡片相对指针的位置，并同步重建 Validator 命中基准；连续小步拖动仍按最初按下位置判断，松手早于视口刷新帧也使用最新命中区。桌面退回 Home 后停止 Gate 视口监听，重新激活时恢复；相同视口读数不重复写样式。

## Info 与公告

Info 结构预览位于 `/zh-Hans/info`、`/zh-Hant/info` 和
`/en/info`，以 Figma 的彩色章节导视为骨架。页面文案在 `src/i18n/info.ts`，图标和自然流页尾在
`src/components/info/`，样式在
`src/styles/info.css`。服务器状态和玩家名单尚未接入数据源，页面明确显示暂不可用，不将未知状态当作离线或零人。加入帮助链接返回首页续行章节；地图和 Wiki 地址复用
`src/data/site.ts`。

公告继续使用 `src/content/news/<locale>/*.md`，构建时生成
`/<locale>/news/<translationKey>`。同一公告的翻译应使用相同的
`translationKey`，语言菜单只显示实际存在的翻译。列表优先显示置顶公告，再按发布日期降序显示最近三条；正文由 Markdown 渲染。结构预览和公告页暂设
`noindex`，不加入 sitemap 与发现白名单；内容准备完成后再统一开放收录。

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
3. 运行完整的 `npm run check`，其中包含根路径语言入口配置与静态产物检查；
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
`Content-Encoding` 为 `br` 或 `gzip`，并记录实际的 `Cache-Control`。当前 GitHub
Pages 直出资源在 2026-09-06 的验收中返回 `max-age=600`，没有
`immutable`；仓库中的静态文件不能配置该响应头。若后续在可配置的 CDN 上设置长期缓存，只对文件名带 hash 的
`/_astro/` 资源启用 `public`、较长的 `max-age` 和
`immutable`，HTML 仍应及时重新验证，避免引用已经替换的 chunk。这些是部署环境的验收项，不能由只读取
`dist/` 的静态输出测试代替。

```bash
curl --compressed -sS -D - -o /dev/null https://fetarute.org/en/
curl --compressed -sS -D - -o /dev/null https://fetarute.org/_astro/<hashed-asset>.js
curl --compressed -sS -D - -o /dev/null https://fetarute.org/_astro/<hashed-asset>.css
curl --compressed -sS -D - -o /dev/null https://fetarute.org/favicon.svg
curl --compressed -sS -D - -o /dev/null https://fetarute.org/site.webmanifest
```

### 根路径语言入口

GitHub Pages 只能提供静态文件，不能针对 `/` 读取 `Accept-Language` 后返回边缘重定向或设置 `Vary`
响应头。因此 `src/pages/index.astro` 保留客户端语言推断：已发布路径、默认语言和无脚本回退统一由
`src/data/hosting.ts` 维护。它不会把首次语言选择写成 HTTP 301 或 308，未知语言与无脚本访问都进入
`/zh-Hans/`；语言首页仍可由读者主动切换。

若迁移到支持请求头规则的平台，根路径应改为只允许 `/zh-Hans/`、`/zh-Hant/` 或 `/en/` 的
`307 Temporary Redirect`，并同时返回 `Vary: Accept-Language` 与
`Cache-Control: private, no-store`。该规则必须以真实生产响应验证后，才能删除静态入口回退；当前
`test:hosting` 和 `test:static`
只证明仓库内的配置与构建产物，不代表已验证边缘规则、DNS、HTTPS 或 GitHub Pages 实际部署。

## 目录结构

社区页原型通过 `/zh-Hans/community/`、`/zh-Hant/community/` 和 `/en/community/`
访问，也已注册为 Header 的并列社区主导航牌及手机更多菜单入口，桌面出口仅含外部服务。占位资料确认前仍使用
`noindex`；地图资料、布局约定和浏览器验证方法见[社区地图原型](community-map.md)。

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
      community/      社区导视画板导出的原始站点标记
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

- 公告：`src/content/news/<year>/<YYYY-MM-DD-translationKey>/<locale>.md`；同目录的 `assets/`
  存放该公告图片。
- 指南：`src/content/guides/<task>/<locale>.md`；同目录的 `assets/` 存放该指南图片。
- 站点名称、服务器地址、品牌图片与语言无关的主导航结构：`src/data/site.ts`
- 公开语言、普通界面文案、各语言 SEO 描述与本地化链接：`src/i18n/`
- 公告和指南需在 frontmatter 标明 `locale`、`translationKey` 与至少一位
  `authors`；同一内容的翻译共用关联键。
- 新建或更新公告、加入和探索等文章前，复制并遵守[内容文章模板](content-article-template.md)；它定义了 frontmatter、正文层级与发布前检查。

当前三语首页已实现启动导视、出发验票、随机实景 Arrival、服连快线章节、响应式铁路图片 Gallery、同岸社群故事与续行出发厅。Gallery 在桌面将纵向阅读进度映射为横向浏览，在小屏改为带当前焦点变化的原生纵向图片列；续行只公开已确认的 QQ 门户群加入入口。公告与指南内容仍保留在 Content
Collections 中，但首页暂不展示公告列表。
