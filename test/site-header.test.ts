import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const siteHeaderSource = readFileSync(
  new URL("../src/components/SiteHeader.astro", import.meta.url),
  "utf8",
);
const globalStylesSource = readFileSync(
  new URL("../src/styles/global.css", import.meta.url),
  "utf8",
);

test("手机 Header 保持统一尺寸，滚动时不再排队 compact 动画帧", () => {
  assert.match(
    siteHeaderSource,
    /const compactHeaderLayoutQuery = window\.matchMedia\("\(min-width: 761px\)"\)/,
  );
  assert.match(
    siteHeaderSource,
    /function scheduleCompactHeaderSync\(\) \{[\s\S]*?if \(!compactHeaderLayoutQuery\.matches\) \{[\s\S]*?return;[\s\S]*?requestAnimationFrame\(syncCompactHeader\)/,
  );
  assert.doesNotMatch(
    globalStylesSource,
    /@media \(max-width: 760px\) \{[\s\S]*?html\[data-header-compact\] \.site-header,[\s\S]*?min-height:\s*56px/,
  );
  const mobileStyles = globalStylesSource.slice(
    globalStylesSource.indexOf("@media (max-width: 760px)"),
  );
  assert.match(mobileStyles, /top:\s*calc\(12px \+ env\(safe-area-inset-top\)\)/);
  assert.match(mobileStyles, /right:\s*calc\(12px \+ env\(safe-area-inset-right\)\)/);
  assert.match(mobileStyles, /left:\s*calc\(12px \+ env\(safe-area-inset-left\)\)/);
  assert.match(mobileStyles, /width:\s*auto;[\s\S]*?transform:\s*none/);
});
