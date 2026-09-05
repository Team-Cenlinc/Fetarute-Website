import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getHomeJourneySectionHash, homeJourneySections } from "../src/data/home-journey.ts";
import { railwayLineByKey } from "../src/data/railway.ts";
import { onwardDestinations, onwardEntryPoints } from "../src/data/site.ts";

const homeOnwardComponentSource =
  readFileSync(new URL("../src/components/HomeOnwardSection.astro", import.meta.url), "utf8") +
  readFileSync(new URL("../src/lib/home/onward-controller.ts", import.meta.url), "utf8");
const homeJourneyQuickPickSource = readFileSync(
  new URL("../src/components/HomeJourneyQuickPick.astro", import.meta.url),
  "utf8",
);
const homeFooterSource = readFileSync(
  new URL("../src/components/HomeFooter.astro", import.meta.url),
  "utf8",
);
const homePageSource =
  readFileSync(new URL("../src/components/HomePage.astro", import.meta.url), "utf8") +
  readFileSync(new URL("../src/lib/home/route-controller.ts", import.meta.url), "utf8");
const homeStylesSource = readFileSync(new URL("../src/styles/home.css", import.meta.url), "utf8");

test("同岸站本身把服联快线 SL07 明确换乘到湾岸支线 BS05", () => {
  const triServerJoint = homeJourneySections.find((section) => section.id === "tri-server-joint");
  const sharedShore = homeJourneySections.find((section) => section.id === "shared-shore");

  assert.ok(triServerJoint);
  assert.ok(sharedShore);
  assert.equal(triServerJoint.breakAfter, undefined);
  assert.equal(sharedShore.transferFrom?.sequence, "07");
  assert.equal(sharedShore.sequence, "05");
  assert.equal(railwayLineByKey.get(sharedShore.transferFrom?.lineKey)?.code, "SL");
  assert.equal(railwayLineByKey.get(sharedShore.lineKey)?.code, "BS");
  assert.equal(railwayLineByKey.get(sharedShore.lineKey)?.color, "#17B292");
});

test("续行站使用自然的 Onward 站名，并把湾岸支线 BS11 换乘到探索线 DS01", () => {
  const onward = homeJourneySections.find((section) => section.id === "onward");

  assert.ok(onward);
  assert.equal(onward.name.englishName, "Onward");
  assert.equal(onward.transferFrom?.sequence, "11");
  assert.equal(onward.sequence, "01");
  assert.equal(railwayLineByKey.get(onward.transferFrom?.lineKey)?.code, "BS");
  assert.equal(railwayLineByKey.get(onward.lineKey)?.code, "DS");
  assert.equal(railwayLineByKey.get(onward.lineKey)?.color, "#F6A000");
});

test("续行首次到访帮助只公开已确认的 QQ 门户群号", () => {
  assert.equal(onwardEntryPoints.qqPortalGroupNumber, "517248890");
});

test("续行 PIDS 的蒲塘桥直接打开 BlueMap 已确认坐标", () => {
  assert.deepEqual(onwardDestinations[0], {
    key: "putangBridge",
    href: "https://map.survival.fetarute.org/#Towny:-620:41:823:390:0.84:0.83:0:0:perspective",
  });
});

test("续行 PIDS 只硬切内部页面，不为整张屏幕添加空间位移", () => {
  const boardRule = homeOnwardComponentSource.match(
    /\.home-onward__board \{(?<body>[\s\S]*?)\n  \}/,
  )?.groups?.body;

  assert.ok(boardRule);
  assert.doesNotMatch(boardRule, /transform:\s*translate/);
  assert.doesNotMatch(boardRule, /transition:/);
});

test("续行 PIDS 由原生滚动行程决定翻页，不把第一次向下输入改写成翻页命令", () => {
  assert.match(homeOnwardComponentSource, /getHomeOnwardDepartureBoardState\(progress\)/);
  assert.match(
    homeOnwardComponentSource,
    /frameCoordinator\.register\(\{[\s\S]*?read: readFrame,[\s\S]*?write: writeFrame/,
  );
  assert.doesNotMatch(homeOnwardComponentSource, /window\.addEventListener\(\s*"scroll"/);
  assert.match(
    homeOnwardComponentSource,
    /--home-onward-scroll-distance:\s*clamp\(1240px,\s*190svh,\s*1880px\)/,
  );
  assert.match(
    homeOnwardComponentSource,
    /--home-onward-scroll-distance:\s*clamp\(1180px,\s*190svh,\s*1600px\)/,
  );
  assert.doesNotMatch(homeOnwardComponentSource, /continuousScrollFallbackDelay/);
  assert.doesNotMatch(homeOnwardComponentSource, /event\.preventDefault\(\)/);
  assert.doesNotMatch(
    homeOnwardComponentSource,
    /addEventListener\("(?:wheel|touchstart|touchmove|touchend|touchcancel|keydown|keyup)"/,
  );
});

test("续行桌面 PIDS 保持原有列宽，并让外框四边使用同一厚度", () => {
  const desktopBoardScreenRule = [
    ...homeOnwardComponentSource.matchAll(/\.home-onward__board-screen \{(?<body>[^}]*)\}/g),
  ].at(0)?.groups?.body;

  assert.ok(desktopBoardScreenRule);
  assert.match(homeOnwardComponentSource, /data-home-onward-locale=\{locale\}/);
  assert.match(
    homeOnwardComponentSource,
    /--home-onward-board-screen-size:\s*clamp\(224px,\s*26svh,\s*246px\)/,
  );
  assert.match(
    homeOnwardComponentSource,
    /--home-onward-board-block-size:\s*calc\([\s\S]*?--home-onward-board-screen-size[\s\S]*?--home-onward-pids-inset\) \* 2/,
  );
  assert.doesNotMatch(homeOnwardComponentSource, /--home-onward-board-mount-space/);
  assert.match(desktopBoardScreenRule, /inset:\s*var\(--home-onward-pids-inset\);/);
  assert.match(homeOnwardComponentSource, /padding:\s*0\.16em 0\.58em/);
  assert.match(
    homeOnwardComponentSource,
    /\.home-onward tbody tr \{[\s\S]*?height:\s*clamp\(48px,\s*5\.6svh,\s*52px\)/,
  );
  assert.match(
    homeOnwardComponentSource,
    /@media \(min-width:\s*1024px\)[\s\S]*?data-home-onward-locale="en"[\s\S]*?--home-onward-board-screen-size:\s*clamp\(252px,\s*29\.2svh,\s*268px\)/,
  );
});

test("续行桌面邀请以探索线为右侧锚点，而不是固定左边缘", () => {
  const introductionRule = homeOnwardComponentSource.match(
    /\.home-onward__introduction-copy \{(?<body>[\s\S]*?)\n  \}/,
  )?.groups?.body;
  const markerRule = homeOnwardComponentSource.match(
    /\.home-onward__station-marker \{(?<body>[\s\S]*?)\n  \}/,
  )?.groups?.body;

  assert.ok(introductionRule);
  assert.ok(markerRule);
  assert.match(introductionRule, /margin-left:\s*auto/);
  assert.match(introductionRule, /text-align:\s*right/);
  assert.match(introductionRule, /margin-right:\s*calc\([\s\S]*?--home-onward-right-track-x/);
  assert.match(markerRule, /width:\s*var\(--home-onward-introduction-spur-width\)/);
  assert.match(
    homeOnwardComponentSource,
    /--home-onward-introduction-spur-width:\s*calc\([\s\S]*?--home-onward-track-width[\s\S]*?\+\s*1px[\s\S]*?\)/,
  );
  assert.match(
    homeOnwardComponentSource,
    /--home-onward-introduction-copy-clearance:\s*clamp\(48px,\s*3vw,\s*92px\)/,
  );
  assert.match(
    homeOnwardComponentSource,
    /--home-onward-introduction-copy-offset:\s*calc\([\s\S]*?--home-onward-track-width[\s\S]*?--home-onward-introduction-copy-clearance[\s\S]*?\)/,
  );
  assert.doesNotMatch(
    homeOnwardComponentSource,
    /@media \(min-width:\s*1024px\)[\s\S]*?\.home-onward__introduction-copy h2 \{[\s\S]*?text-wrap:\s*balance/,
  );
});

test("续行桌面末屏把 PIDS 与导视牌下沉，并在 Footer 交接时抵消 sticky 解锁上移", () => {
  assert.match(
    homeOnwardComponentSource,
    /--home-onward-footer-dock-offset:\s*clamp\(64px,\s*8svh,\s*96px\)/,
  );
  assert.match(homeOnwardComponentSource, /--home-onward-footer-transition-shift:\s*0px/);
  assert.match(homeOnwardComponentSource, /--home-onward-footer-reduced-shift:\s*96px/);
  assert.match(
    homeOnwardComponentSource,
    /@media \(min-width:\s*1024px\)[\s\S]*?\.home-onward__board-area,[\s\S]*?\.home-onward__guide \{[\s\S]*?transform:\s*translateY\([\s\S]*?--home-onward-footer-dock-offset[\s\S]*?--home-onward-footer-transition-shift/,
  );
  assert.match(homeOnwardComponentSource, /\.home-onward__pids-support \{[^}]*overflow:\s*clip/);
  assert.match(
    homeOnwardComponentSource,
    /@media \(min-width:\s*1024px\)[\s\S]*?\.home-onward__pids-support-fill \{[\s\S]*?transform:\s*translateY\([\s\S]*?--home-onward-footer-dock-offset[\s\S]*?--home-onward-footer-transition-shift/,
  );
  assert.match(homeOnwardComponentSource, /\.home-onward__journey \{[\s\S]*?overflow:\s*clip/);
  assert.match(
    homeOnwardComponentSource,
    /@media \(min-width:\s*1024px\)[\s\S]*?\.home-onward__stage \{[\s\S]*?overflow:\s*visible/,
  );
  assert.match(
    homeOnwardComponentSource,
    /@media \(prefers-reduced-motion:\s*reduce\) and \(min-width:\s*1024px\)[\s\S]*?\.home-onward__board-area,[\s\S]*?\.home-onward__guide \{[\s\S]*?--home-onward-footer-dock-offset[\s\S]*?--home-onward-footer-reduced-shift/,
  );
  assert.match(
    homeOnwardComponentSource,
    /@media \(prefers-reduced-motion:\s*reduce\) and \(min-width:\s*1024px\)[\s\S]*?\.home-onward__pids-support-fill \{[\s\S]*?transform:\s*translateY\([\s\S]*?--home-onward-footer-reduced-shift/,
  );
  assert.match(homePageSource, /getHomeFooterRevealProgress/);
  assert.match(homePageSource, /getHomeFooterStickyReleaseScrollY/);
  assert.match(homePageSource, /getHomeFooterTransitionShift/);
  assert.match(homePageSource, /const footerPreparationDistance =\s*Math\.min\(\s*420,/);
  assert.match(homePageSource, /const footerPreparationStart =/);
  assert.match(homePageSource, /const footerTravel = Math\.max\(/);
  assert.match(
    homePageSource,
    /--home-onward-footer-transition-shift[\s\S]*?--home-footer-content-offset[\s\S]*?--home-footer-content-opacity/,
  );
});

test("续行 Wiki 导视从左侧色块扫出背景，并使用足够醒目的固定箭头", () => {
  assert.doesNotMatch(homeOnwardComponentSource, /\.home-onward__service-link::after/);
  assert.doesNotMatch(homeOnwardComponentSource, /transition:\s*color/);
  assert.match(homeOnwardComponentSource, /home-onward__service-link--future/);
  assert.match(homeOnwardComponentSource, /--duration-home-onward-guide-sweep:\s*260ms/);
  assert.match(
    homeOnwardComponentSource,
    /a\.home-onward__service-link--wiki::before \{[\s\S]*?background:\s*var\(--palette-fetarute-info\);[\s\S]*?transform:\s*scaleX\(0\);[\s\S]*?transform-origin:\s*left center;/,
  );
  assert.match(
    homeOnwardComponentSource,
    /transition:\s*transform\s+var\(--duration-home-onward-guide-sweep\)\s+var\(--motion-header-standard-spatial\)/,
  );
  assert.match(
    homeOnwardComponentSource,
    /a\.home-onward__service-link--wiki:is\(:hover, :focus-visible\)::before \{[\s\S]*?transform:\s*scaleX\(1\);/,
  );
  assert.match(
    homeOnwardComponentSource,
    /--home-onward-guide-arrow-size:\s*clamp\(52px,\s*4vw,\s*76px\)/,
  );
  assert.match(
    homeOnwardComponentSource,
    /\.home-onward__service-arrow \{[\s\S]*?width:\s*var\(--home-onward-guide-arrow-size\);[\s\S]*?height:\s*var\(--home-onward-guide-arrow-size\);/,
  );
  assert.match(
    homeOnwardComponentSource,
    /padding:\s*clamp\(20px,[\s\S]*?clamp\(54px,[\s\S]*?\s0;/,
  );
  assert.match(
    homeOnwardComponentSource,
    /--home-onward-guide-content-right:\s*calc\([\s\S]*?--home-onward-active-train-thickness[\s\S]*?--home-onward-guide-train-gap/,
  );
});

test("续行小屏把 PIDS 与导视牌镜像挂载在探索线上，不再生成独立支柱", () => {
  const mobileBoardScreenRule = [
    ...homeOnwardComponentSource.matchAll(/\.home-onward__board-screen \{(?<body>[^}]*)\}/g),
  ].at(-1)?.groups?.body;

  assert.ok(mobileBoardScreenRule);
  assert.match(homeOnwardComponentSource, /--home-onward-mobile-mount-left:/);
  assert.match(homeOnwardComponentSource, /--home-onward-mobile-mount-depth:/);
  assert.match(homeOnwardComponentSource, /--home-onward-mobile-copy-left:/);
  assert.match(
    homeOnwardComponentSource,
    /@media \(max-width:\s*1023px\)[\s\S]*?\.home-onward__station-marker \{[\s\S]*?width:\s*var\(--home-onward-introduction-spur-width\)/,
  );
  assert.match(
    homeOnwardComponentSource,
    /--home-onward-mobile-mount-left:[\s\S]*?--home-onward-mobile-track-left\) - 8px/,
  );
  assert.match(
    homeOnwardComponentSource,
    /--home-onward-mobile-content-left:[\s\S]*?--home-onward-track-width\) \+\s*32px/,
  );
  assert.match(homeOnwardComponentSource, /\.home-onward__pids-support \{[\s\S]*?display:\s*none;/);
  assert.match(
    homeOnwardComponentSource,
    /\.home-onward__board-area \{[\s\S]*?margin-left:\s*calc\([\s\S]*?--home-onward-mobile-mount-left[\s\S]*?--home-onward-mobile-content-left/,
  );
  assert.match(
    homeOnwardComponentSource,
    /\.home-onward__board-screen \{[\s\S]*?--home-onward-mobile-mount-depth/,
  );
  assert.match(mobileBoardScreenRule, /var\(--home-onward-mobile-mount-depth\)/);
  assert.doesNotMatch(mobileBoardScreenRule, /mount-depth\) \+ var\(--home-onward-pids-inset/);
  assert.match(
    homeOnwardComponentSource,
    /\.home-onward__guide \{[\s\S]*?--home-onward-mobile-mount-depth/,
  );
});

test("续行小屏 PIDS 压缩每行留白但保留 44px 操作命中区", () => {
  assert.match(
    homeOnwardComponentSource,
    /--home-onward-board-screen-size:\s*clamp\(202px,\s*24svh,\s*210px\)/,
  );
  assert.match(homeOnwardComponentSource, /\.home-onward tbody tr \{[\s\S]*?height:\s*44px/);
  assert.match(homeOnwardComponentSource, /\.home-onward td a \{[\s\S]*?min-height:\s*44px/);
  assert.match(homeOnwardComponentSource, /\.home-onward__ticker \{[\s\S]*?min-height:\s*44px/);
  assert.match(
    homeOnwardComponentSource,
    /\.home-onward__help-copy p:not\(\.home-onward__help-title\)[\s\S]*?clip-path:\s*inset\(50%\)/,
  );
});

test("续行短屏压低固定舞台，使 PIDS 与导视牌完整落在同一视口", () => {
  assert.match(
    homeOnwardComponentSource,
    /@media \(max-width:\s*1023px\) and \(max-height:\s*639px\)/,
  );
  assert.match(
    homeOnwardComponentSource,
    /@media \(max-width:\s*1023px\) and \(max-height:\s*639px\)[\s\S]*?\.home-onward__stage \{[\s\S]*?min-height:\s*100svh;[\s\S]*?padding-top:\s*84px/,
  );
});

test("续行 QQ 复制在 Clipboard API 拒绝后仍尝试兼容回退", () => {
  assert.match(homeOnwardComponentSource, /const copyTextWithLegacyField = \(value: string\)/);
  assert.match(
    homeOnwardComponentSource,
    /navigator\.clipboard\?\.writeText[\s\S]*?catch[\s\S]*?return copyTextWithLegacyField\(value\)/,
  );
});

test("续行小屏列车与 Tooltip 都使用线路中心和完整车身长度", () => {
  const contentTrainRenderer = homePageSource.match(
    /const renderHomeOnwardContentTrain = \([\s\S]*?\n    \};/,
  )?.[0];
  const footerTrainRenderer = homePageSource.match(
    /const renderHomeFooterTrain = \([\s\S]*?\n    \};/,
  )?.[0];
  const verticalTrainRenderer = homePageSource.match(
    /const renderViewportVerticalTrain = \([\s\S]*?\n    \};/,
  )?.[0];

  assert.ok(contentTrainRenderer);
  assert.ok(footerTrainRenderer);
  assert.ok(verticalTrainRenderer);
  assert.doesNotMatch(contentTrainRenderer, /trackBounds\.right/);
  assert.doesNotMatch(footerTrainRenderer, /trackBounds\.right/);
  assert.match(contentTrainRenderer, /trackBounds\.left \+ trackBounds\.width \/ 2/);
  assert.match(footerTrainRenderer, /trackBounds\.left \+ trackBounds\.width \/ 2/);
  assert.match(
    verticalTrainRenderer,
    /routeTrainTooltipAnchorWidth = Math\.max\(44, trainHeight\)/,
  );
  assert.match(
    verticalTrainRenderer,
    /routeTrainTooltipAnchorHeight = Math\.max\(44, trainWidth\)/,
  );
});

test("列车快选让四个章节一次完整显示，不再嵌套滚动或伪造终点", () => {
  assert.doesNotMatch(homeJourneyQuickPickSource, /home-journey-quick-pick__terminus/);
  assert.doesNotMatch(homeJourneyQuickPickSource, /overflow-y:\s*auto/);
  assert.doesNotMatch(homePageSource, /containTrainTooltipWheel/);
  assert.match(homeJourneyQuickPickSource, /--home-journey-stop-gap:\s*10px/);
  assert.match(
    homeJourneyQuickPickSource,
    /bottom:\s*calc\(0px - var\(--home-journey-map-inset\)\)/,
  );
  assert.match(homeJourneyQuickPickSource, /@media \(max-height:\s*440px\)/);
  assert.match(homeJourneyQuickPickSource, /@media \(max-height:\s*600px\)/);
  assert.match(homeJourneyQuickPickSource, /home-journey-quick-pick__close:active/);
  assert.match(homeJourneyQuickPickSource, /home-journey-quick-pick__stop a:active/);
});

test("列车快选按语言与视口收紧面板宽度和列车间距", () => {
  assert.match(homePageSource, /data-home-arrival-tooltip-locale=\{locale\}/);
  assert.match(homeJourneyQuickPickSource, /data-home-journey-locale=\{locale\}/);
  assert.match(homePageSource, /--home-arrival-tooltip-preferred-inline-size/);
  assert.match(
    homePageSource,
    /Number\.parseFloat\([\s\S]*?tooltipStyle\.getPropertyValue\("--home-arrival-tooltip-preferred-inline-size"\)[\s\S]*?\)/,
  );
  assert.match(homePageSource, /--home-arrival-tooltip-anchor-gap/);
  assert.match(homeStylesSource, /--home-arrival-tooltip-preferred-inline-size:\s*232px/);
  assert.match(
    homeStylesSource,
    /data-home-arrival-tooltip-locale="en"\][\s\S]*?--home-arrival-tooltip-preferred-inline-size:\s*300px/,
  );
  assert.match(homeStylesSource, /--home-arrival-tooltip-anchor-gap:\s*8px/);
  assert.match(
    homeStylesSource,
    /@media \(min-width:\s*761px\)[\s\S]*?--home-arrival-tooltip-anchor-gap:\s*12px[\s\S]*?data-home-arrival-tooltip-locale="en"\][\s\S]*?--home-arrival-tooltip-preferred-inline-size:\s*328px/,
  );
  assert.match(
    homeJourneyQuickPickSource,
    /\[data-home-journey-locale="en"\][\s\S]*?font-weight:\s*650;[\s\S]*?letter-spacing:\s*-0\.02em;/,
  );
});

test("列车焦点恢复不保存抑制状态，首次键盘 focus 始终可以打开快选", () => {
  assert.doesNotMatch(
    homePageSource,
    /trainTooltipSuppressedFocusTarget|isTrainTooltipFocusRestoreSuppressed/,
  );
  assert.match(
    homePageSource,
    /const setTrainTooltipOpen = \(isOpen: boolean, allowDuringNavigation = false\)/,
  );
  assert.match(
    homePageSource,
    /trigger\.addEventListener\("focus", \(\) => \{[\s\S]*?setTrainTooltipOpen\(true, true\);[\s\S]*?\}\);/,
  );
  assert.match(
    homePageSource,
    /const closeTrainTooltipAndRestoreFocus = \(\) => \{[\s\S]*?activeTrainTooltipTrigger\.focus\(\{ preventScroll: true \}\);\s*setTrainTooltipOpen\(false\);/,
  );
});

test("压薄 Footer 仍让探索线贯穿页面底部，不添加终点站标", () => {
  const footerTrackRule = homeFooterSource.match(/\.home-footer__track \{(?<body>[\s\S]*?)\n  \}/)
    ?.groups?.body;

  assert.ok(footerTrackRule);
  assert.doesNotMatch(homeFooterSource, /home-footer__station-marker/);
  assert.match(homeFooterSource, /min-height:\s*232px/);
  assert.match(footerTrackRule, /top:\s*0;/);
  assert.match(footerTrackRule, /bottom:\s*0;/);
  assert.doesNotMatch(footerTrackRule, /height:\s*100%/);
});

test("Footer 内容随可见进度轻量进入，并在减少动态模式下保持静态可见", () => {
  const footerContentRule = homeFooterSource.match(
    /\.home-footer__content \{(?<body>[\s\S]*?)\n  \}/,
  )?.groups?.body;

  assert.ok(footerContentRule);
  assert.match(footerContentRule, /opacity:\s*var\(--home-footer-content-opacity\)/);
  assert.match(footerContentRule, /transform:\s*translateY\(var\(--home-footer-content-offset\)\)/);
  assert.match(
    homeFooterSource,
    /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.home-footer__content \{[\s\S]*?opacity:\s*1;[\s\S]*?transform:\s*none/,
  );
});

test("探索线进入 Footer 后仍保留可交互列车与章节快选", () => {
  assert.match(homePageSource, /\[data-home-footer\]/);
  assert.match(homePageSource, /\.home-footer__track/);
  assert.match(homePageSource, /const isFooterPhase\s*=/);
  assert.match(homePageSource, /isRouteActive\s*=\s*[\s\S]*?isFooterPhase/);
  assert.match(homePageSource, /"footer"/);
});

test("首页滚动章节沿用稳定 section id 生成 URL hash", () => {
  assert.deepEqual(
    homeJourneySections.map((section) => getHomeJourneySectionHash(section.id)),
    ["#beginning-bay", "#tri-server-joint", "#shared-shore", "#onward"],
  );
});
