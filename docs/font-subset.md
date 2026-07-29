# 字体子集化

## 目标

完整 CJK 字体通常很大。Fetarute 将 Noto Sans Display 作为英文、数字与导视符号的默认字族，并由 Noto
Sans
SC 承担当前简体中文界面。繁中、日文与英文斜体则保留独立子集。当前页面预加载 Display 与 SC；其他面孔只有相应语言或斜体样式实际出现时才会请求。

本项目使用 Portal 已验证的 Node-only `subset-font` 工作流。它通过 HarfBuzz
WASM 输出 woff2，不需要 Python、fonttools 或额外脚本运行时。

## 目录

```text
fonts-source/                         完整 TTF 源字体，只作为本地生成输入
scripts/font-subset/                  扫描和 subset 脚本
  manual-chars.txt                    品牌名、拉丁字母与未来短文案兜底
  chars.txt                           自动抽取后的可审阅字符清单
src/assets/fonts/                     生成的浏览器 woff2 子集
```

源字体不得放入
`public/`。如字体许可不允许提交源文件，应保留本地源文件并提交生成后的 woff2，使普通构建不依赖完整字体。

## 放入字体后

1. 将已获网页分发授权的字体放到 `fonts-source/`。
2. 核对 [`scripts/font-subset/config.ts`](../scripts/font-subset/config.ts) 的 `fontTargets`
   文件名与字重映射。
3. 如有还未出现在源码中的品牌词或活动词，补到 `scripts/font-subset/manual-chars.txt`。
4. 运行：

   ```sh
   npm run font:subset
   ```

该命令先扫描 `src/` 和 `docs/` 的 Astro、TS、JS 与 Markdown 文件，生成
`chars.txt`，再为 SC、TC、JP、Display 与 Display Italic 生成 woff2。各面孔使用同一份
`chars.txt`，避免同一行文字切换语言或字重时出现缺字或 fallback 跳变。

单独验证某个面孔：

```sh
npm run font:subset:sc
npm run font:subset:tc
npm run font:subset:jp
npm run font:subset:display
npm run font:subset:display-italic
```

## 构建入口

`npm run build` 不执行 subset，因此不要求本地存在完整字体。放入字体并希望同步刷新子集时使用：

```sh
npm run build:with-fonts
```

生成后的 woff2 已在 `astro.config.ts` 注册至 Astro Fonts API；页面布局通过 `<Font />` 输出
`@font-face`，全局字体栈则在 `src/styles/global.css`
以 Display 优先、并按页面语言回退到对应 CJK 字族。
