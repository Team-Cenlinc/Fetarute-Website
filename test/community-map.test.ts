import assert from "node:assert/strict";
import test from "node:test";
import {
  communityDesktopMap,
  communityMobileMap,
  createCommunityMaps,
  type CommunityMapPoint,
} from "../src/data/community-map.ts";
import { createCommunityLayout, placeCommunityPanel } from "../src/lib/community/layout.ts";

test("街区布局覆盖每个成员，固定种子稳定且不会修改输入", () => {
  const ids = Array.from({ length: 23 }, (_, index) => "member-" + index);
  const original = [...ids];
  const plots = createCommunityLayout(ids, 17);
  assert.deepEqual(ids, original);
  assert.deepEqual(plots, createCommunityLayout(ids, 17));
  assert.notDeepEqual(plots, createCommunityLayout(ids, 18));
  assert.deepEqual(plots.map((plot) => plot.id).sort(), [...ids].sort());
  assert.throws(() => createCommunityLayout(["same", "same"], 0), /重复/);
});

/** 射线交叉检测按真实多边形验证邻接；外接矩形重叠不等于 L 形地块重叠。 */
function inside(x: number, y: number, points: readonly CommunityMapPoint[]): boolean {
  let result = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) result = !result;
  }
  return result;
}

test("异形地块与河岸、公园共同切分地图，标注位于各自地块内", () => {
  for (const map of [communityDesktopMap, communityMobileMap]) {
    assert.ok(
      map.lots.some((lot) => lot.points.length > 4),
      "保留围合公园的 L 形街块",
    );
    assert.ok(
      map.lots.some((lot) =>
        lot.points.some(([x, y], index) => {
          const next = lot.points[(index + 1) % lot.points.length];
          return x !== next[0] && y !== next[1];
        }),
      ),
      "河岸地块应保留斜边",
    );
    for (const lot of map.lots) {
      assert.ok(inside(...lot.label, lot.points), "姓名和头像必须落在地块内部");
      for (const [x, y] of lot.points)
        assert.ok(x >= 0 && y >= 0 && x <= map.width && y <= map.height);
    }
    const areas = [...map.lots.map((lot) => lot.points), map.park, map.plaza, map.river];
    for (let y = 0.3; y < map.height; y += 6) {
      for (let x = 0.3; x < map.width; x += 6) {
        assert.ok(
          areas.filter((points) => inside(x, y, points)).length <= 1,
          `地块或景观相互覆盖：${x},${y}`,
        );
      }
    }
  }
  const plots = createCommunityLayout(
    Array.from({ length: 40 }, (_, index) => String(index)),
    1,
  );
  assert.equal(new Set(plots.map((plot) => plot.block)).size, 5);
  for (const plot of plots) {
    assert.match(plot.desktop.clipPath, /^polygon\(/);
    assert.match(plot.mobile.clipPath, /^polygon\(/);
  }
});

test("展开面板在边缘翻转并限制于实际可用视口", () => {
  const viewport = { left: 0, top: 92, width: 390, height: 740 };
  for (const anchor of [
    { left: 12, top: 150, width: 72, height: 90 },
    { left: 300, top: 750, width: 64, height: 64 },
    { left: -400, top: -900, width: 72, height: 90 },
  ]) {
    const point = placeCommunityPanel(anchor, { width: 358, height: 320 }, viewport);
    assert.ok(point.x >= 8 && point.x + 358 <= 382);
    assert.ok(point.y >= 100 && point.y + 320 <= 824);
  }
  assert.equal(
    placeCommunityPanel(
      { left: 1000, top: 300, width: 100, height: 100 },
      { width: 360, height: 320 },
      { left: 0, top: 100, width: 1280, height: 800 },
    ).x,
    628,
  );
});

test("随机地图为最窄视口的整个身份标注盒保留空间", () => {
  for (let seed = 0; seed < 200; seed++) {
    const maps = createCommunityMaps(seed);
    for (const [key, map] of Object.entries(maps)) {
      /* 320px 手机和768px桌面的真实地图缩放；包含头像、间距及一行姓名，不只测试中心。 */
      const scale = key === "mobile" ? (320 - 64 - 20) / 600 : (768 * (1 - 0.161979 - 0.08)) / 1200;
      const halfHeight = (key === "mobile" ? 56 : 58) / scale / 2;
      for (const lot of map.lots) {
        const halfWidth = lot.labelWidth / 2;
        for (let dy = -halfHeight; dy <= halfHeight; dy += halfHeight / 4)
          for (const dx of [-halfWidth, 0, halfWidth])
            assert.ok(
              inside(lot.label[0] + dx, lot.label[1] + dy, lot.points),
              `seed ${seed} ${key}: 完整标注空间不足`,
            );
      }
    }
  }
});

test("随机几何可复现，100 个种子的两种布局保持无重叠", () => {
  assert.deepEqual(createCommunityMaps(7), createCommunityMaps(7));
  assert.notDeepEqual(createCommunityMaps(7), createCommunityMaps(8));
  for (let seed = 0; seed < 100; seed++) {
    for (const map of Object.values(createCommunityMaps(seed))) {
      for (const lot of map.lots) assert.ok(inside(...lot.label, lot.points));
      const areas = [...map.lots.map((lot) => lot.points), map.park, map.plaza, map.river];
      for (let y = 0.3; y < map.height; y += 20)
        for (let x = 0.3; x < map.width; x += 20)
          assert.ok(
            areas.filter((area) => inside(x, y, area)).length <= 1,
            `seed ${seed}: ${x},${y}`,
          );
    }
  }
});

test("穿城河道两岸平直等宽，收窄水面后两侧都有可用街区", () => {
  const routes = new Set<string>();
  for (let seed = 0; seed < 200; seed++) {
    for (const map of Object.values(createCommunityMaps(seed))) {
      const top = map.river
        .filter(([, y]) => y === 0)
        .map(([x]) => x)
        .sort((a, b) => a - b);
      const bottom = map.river
        .filter(([, y]) => y === map.height)
        .map(([x]) => x)
        .sort((a, b) => a - b);
      assert.equal(map.river.length, 4, "河岸各是一条长直线，不增加随机折点");
      assert.equal(top.length, 2);
      assert.equal(bottom.length, 2);
      assert.ok(top[0] > map.width * 0.25 && top[1] < map.width * 0.75);
      assert.ok(bottom[0] > map.width * 0.25 && bottom[1] < map.width * 0.75);
      assert.ok(Math.abs(top[1] - top[0] - (bottom[1] - bottom[0])) < 0.000001, "两岸必须平行");
      const slope = (bottom[0] - top[0]) / map.height;
      const riverWidth = (top[1] - top[0]) / Math.hypot(1, slope);
      assert.ok(
        riverWidth >= map.width * 0.05 && riverWidth <= map.width * 0.08,
        "河面应是较细的水道",
      );
      for (const side of [-1, 1]) {
        assert.ok(
          map.lots.filter(
            ({ label: [x, y] }) => side * (x - (top[0] + top[1]) / 2 - slope * y) > riverWidth / 2,
          ).length >= 2,
          "两岸都要有多块土地，不能只剩水边单侧的城镇",
        );
      }
      routes.add(JSON.stringify(map.river));
    }
  }
  assert.ok(routes.size > 100, "随机种子仍改变穿城位置与方向");
});
