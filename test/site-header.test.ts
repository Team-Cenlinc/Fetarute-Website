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

test("Header 关闭动画不抢回已经转入正文或社区列车的焦点", () => {
  assert.match(
    siteHeaderSource,
    /const shouldRestoreFocus = restoreFocus && menu\.contains\(document\.activeElement\)/,
  );
  assert.match(
    siteHeaderSource,
    /if \(shouldRestoreFocus\) \{\s*menu\.querySelector<HTMLElement>\("summary"\)\?\.focus\(\)/,
  );
});

test("手机与宽屏触控 Header 保持完整导航，滚动时不再排队 compact 动画帧", () => {
  assert.match(
    siteHeaderSource,
    /const compactHeaderLayoutQuery = window\.matchMedia\(\s*"\(min-width: 761px\) and \(hover: hover\) and \(pointer: fine\)",/,
  );
  assert.match(
    siteHeaderSource,
    /homePageFrameCoordinator\.register\(\{[\s\S]*?isActive: \(\) => compactHeaderLayoutQuery\.matches,[\s\S]*?read: readCompactHeaderFrame/,
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

test("紧凑 Header 用独立且不可交互的预览带展示连续色点", () => {
  const compactHeaderStyles = globalStylesSource.slice(
    globalStylesSource.indexOf(
      "html[data-header-compact]:not([data-header-hover-expanded]) .site-header",
    ),
  );

  assert.match(
    siteHeaderSource,
    /<span class="home-nav-compact-signal" aria-hidden="true">[\s\S]*?home-nav-compact-signal__route/,
  );
  assert.match(
    compactHeaderStyles,
    /\.home-nav-compact-signal\s*\{[\s\S]*?pointer-events:\s*none;/,
  );
  assert.match(compactHeaderStyles, /\.home-nav\s*\{\s*display:\s*none;/);
  assert.doesNotMatch(
    compactHeaderStyles,
    /home-nav-compact-dot-shift|home-nav-compact-cluster-offset/,
  );
});

test("键盘进入紧凑 Header 时先立即展开完整导航", () => {
  assert.match(
    siteHeaderSource,
    /function expandCompactHeaderOnFocus\(\) \{[\s\S]*?setHeaderLayoutState\(true, true, false\);/,
  );
  assert.match(
    siteHeaderSource,
    /siteHeader\?\.addEventListener\("focusin", expandCompactHeaderOnFocus\);/,
  );
});
