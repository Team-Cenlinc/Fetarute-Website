# 字体源文件

此目录只保存供 `npm run font:subset` 读取的完整字体源文件，绝不能移动到
`public/`，否则 Astro 会把完整字体直接发布到 `dist/`。

默认目标映射在 [`scripts/font-subset/config.ts`](../scripts/font-subset/config.ts)：

```text
NotoSansSC-VariableFont_wght.ttf
NotoSansTC-VariableFont_wght.ttf
NotoSansJP-VariableFont_wght.ttf
NotoSansDisplay-VariableFont_wdth,wght.ttf
NotoSansDisplay-Italic-VariableFont_wdth,wght.ttf
```

放入已获网页分发授权的 TTF 后运行：

```sh
npm run font:subset
```

若字体文件名、格式或轴范围不同，只修改 `fontTargets`
配置；不要在页面、CSS 或构建命令中硬编码路径。生成的浏览器字体会写到 `src/assets/fonts/`，再由 Astro
Fonts API 和全局字体栈引用。
