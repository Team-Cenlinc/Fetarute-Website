import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homeShellStylesSource = readFileSync(
  new URL("../src/styles/home-shell.css", import.meta.url),
  "utf8",
);
const departureGateSource = readFileSync(
  new URL("../src/components/DepartureGate.astro", import.meta.url),
  "utf8",
);

test("移动 Safari 的拍卡 Gate 以最大视口高度覆盖正文，不会在地址栏伸缩时露底", () => {
  const gateRule = homeShellStylesSource.match(/\.departure-gate \{(?<body>[\s\S]*?)\n\}/)?.groups
    ?.body;
  const gateSceneRule = homeShellStylesSource.match(
    /\.departure-gate__scene \{(?<body>[\s\S]*?)\n\}/,
  )?.groups?.body;

  assert.ok(gateRule);
  assert.ok(gateSceneRule);
  assert.match(gateRule, /--departure-gate-coverage-height:\s*100lvh/);
  assert.match(gateRule, /min-height:\s*var\(--departure-gate-coverage-height\)/);
  assert.match(gateSceneRule, /min-height:\s*var\(--departure-gate-coverage-height\)/);
});

test("拍卡提示沿纯数值路径移动，不在动画帧同步查询 SVG 几何", () => {
  assert.doesNotMatch(departureGateSource, /\.get(?:TotalLength|PointAtLength)\(/);
  assert.match(departureGateSource, /getHomeTrainPathPointAtLength\(/);
});
