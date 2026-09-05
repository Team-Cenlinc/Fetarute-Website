import assert from "node:assert/strict";
import test from "node:test";
import { rootLanguageEntry } from "../src/data/hosting.ts";
import { defaultLocale, locales } from "../src/i18n/config.ts";

test("GitHub Pages 根入口从已发布语言派生客户端静态回退", () => {
  assert.equal(rootLanguageEntry.hosting, "github-pages");
  assert.equal(rootLanguageEntry.negotiation, "client-static-fallback");
  assert.equal(rootLanguageEntry.defaultPath, `/${defaultLocale}/`);
  assert.deepEqual(
    Object.values(rootLanguageEntry.localizedPaths),
    locales.map((locale) => `/${locale}/`),
  );
});

test("根入口按语言代码提供固定的公开路径白名单", () => {
  for (const locale of locales) {
    assert.equal(rootLanguageEntry.localizedPaths[locale], `/${locale}/`);
  }
});
