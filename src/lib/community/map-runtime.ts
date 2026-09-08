import {
  createCommunityMaps,
  createCommunityRandom,
  type CommunityMapPoint,
} from "../../data/community-map.ts";
import { communityGeometryStyle, createCommunityLayout } from "./layout.ts";
import { communityPlaces } from "../../data/community-places.ts";
import {
  communityPlayerMapEntityLimit,
  createCommunityMosaicLayout,
} from "../../data/community.ts";

/** 从完整玩家名单中取出一片街区可容纳的样本；显式种子仍可复现同一批成员。 */
function pickSingleBlockDetails(
  details: readonly HTMLElement[],
  seed: number,
  capacity: number,
): HTMLElement[] {
  const shuffled = [...details];
  const random = createCommunityRandom(seed ^ 0x51f15e);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled.slice(0, capacity);
}

/** 首屏头像墙只随机变换斜向连通的格位；玩家身份顺序不变，锚点与无脚本后备也仍可用。 */
function initializeCommunityMosaic(root: HTMLElement, seed: number): void {
  const cells = [...root.querySelectorAll<HTMLElement>("[data-community-mosaic-cell]")];
  const layout = createCommunityMosaicLayout(cells.length, seed);
  cells.forEach((cell, index) => {
    cell.style.gridColumn = String(layout[index][0] + 1);
    cell.style.gridRow = String(layout[index][1] + 1);
  });
}

/** 首次进入时选择访问种子；显式 mapSeed 可复现设计，不持久化访客身份。 */
export function initializeCommunityMap(root: HTMLElement): void {
  const query = new URL(window.location.href).searchParams.get("mapSeed");
  const seed =
    query && /^\d{1,10}$/.test(query) && Number(query) <= 0xffffffff
      ? Number(query)
      : crypto.getRandomValues(new Uint32Array(1))[0];
  root.dataset.communitySeed = String(seed);
  initializeCommunityMosaic(root, seed);
  const points = (vertices: readonly CommunityMapPoint[]) =>
    vertices.map((point) => point.join(",")).join(" ");
  const usedPlaces = new Set<string>();
  root.querySelectorAll<HTMLElement>("[data-community-zone]").forEach((zone, zoneIndex) => {
    zone
      .querySelectorAll<HTMLElement>("[data-community-map-block]")
      .forEach((block, blockIndex) => {
        const blockSeed = (seed + Math.imul(zoneIndex + blockIndex, 2654435761)) >>> 0;
        const maps = createCommunityMaps(blockSeed);
        const details = [...block.querySelectorAll<HTMLElement>("[data-community-entity]")];
        const singleBlock = block.dataset.communitySingleBlock === "true";
        const visibleDetails = singleBlock
          ? pickSingleBlockDetails(
              details,
              blockSeed,
              Math.min(communityPlayerMapEntityLimit, maps.desktop.lots.length),
            )
          : details;
        const visibleSet = new Set(visibleDetails);
        for (const detail of details) detail.hidden = !visibleSet.has(detail);
        if (singleBlock)
          block.append(...visibleDetails, ...details.filter((detail) => !visibleSet.has(detail)));
        const plots = createCommunityLayout(
          visibleDetails.map((element) => element.id),
          blockSeed,
          maps,
        );
        const occupied = new Set(plots.map((plot) => plot.slot));
        const landmarks = new Map<number, { kind: number; name: string }>();
        const vacantSlots = Array.from(
          { length: maps.desktop.lots.length },
          (_, index) => index,
        ).filter((index) => !occupied.has(index));
        for (const [position, slot] of vacantSlots.entries()) {
          /* 同一片地图的空地按四种设施轮换，避免随机抽样后只剩同一种装饰。 */
          const kind = (blockSeed + position) % communityPlaces.length;
          const candidates = communityPlaces[kind].names.filter((name) => !usedPlaces.has(name));
          const names = candidates.length ? candidates : communityPlaces[kind].names;
          const name = names[(blockSeed + slot) % names.length];
          landmarks.set(slot, { kind, name });
          usedPlaces.add(name);
        }
        for (const key of ["desktop", "mobile"] as const) {
          const map = maps[key];
          const svg = block.querySelector<SVGElement>(".community-map-base--" + key)!;
          for (const terrain of ["river", "park", "plaza"] as const)
            svg
              .querySelector(".community-map-" + terrain)!
              .setAttribute("points", points(map[terrain]));
          svg
            .querySelectorAll(".community-map-vacant")
            .forEach((polygon, index) =>
              polygon.setAttribute("points", points(map.lots[index].points)),
            );
          svg.querySelectorAll<SVGElement>("[data-community-landmark]").forEach((group, index) => {
            const place = landmarks.get(index);
            group.dataset.landmark = place ? communityPlaces[place.kind].kind : "";
            const text = group.querySelector("text")!;
            text.textContent = place?.name ?? "";
            /* 按中西文字宽估计换行，不把 Fetarute 当成八个全角字，也不压扁文字。 */
            const labelX = map.lots[index].label[0];
            const labelY = map.lots[index].label[1] + 16;
            const value = text.textContent;
            text.replaceChildren();
            const lines: string[] = [];
            let line = "",
              lineWidth = 0;
            for (const character of value) {
              const characterWidth = character.charCodeAt(0) > 255 ? 26 : 16;
              if (line && lineWidth + characterWidth > map.lots[index].labelWidth) {
                lines.push(line);
                line = "";
                lineWidth = 0;
              }
              line += character;
              lineWidth += characterWidth;
            }
            if (line) lines.push(line);
            if (value === "Fetarute博物馆" && lines.length > 1)
              lines.splice(0, lines.length, "Fetarute", "博物馆");
            lines.forEach((line, lineIndex) => {
              const span = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
              span.setAttribute("x", String(labelX));
              span.setAttribute("dy", lineIndex === 0 ? "0" : "27");
              span.textContent = line;
              text.append(span);
            });
            text.setAttribute("x", String(map.lots[index].label[0]));
            text.setAttribute("y", String(labelY));
            group.querySelectorAll("[data-landmark-icon]").forEach((icon) => {
              icon.setAttribute("x", String(labelX - 22));
              icon.setAttribute("y", String(map.lots[index].label[1] - 42));
            });
          });
        }
        for (const plot of plots) {
          const detail = visibleDetails.find((element) => element.id === plot.id)!;
          detail.style.cssText =
            communityGeometryStyle(plot.desktop, maps.desktop) +
            communityGeometryStyle(plot.mobile, maps.mobile, "-mobile");
          for (const key of ["desktop", "mobile"] as const) {
            const geometry = plot[key];
            const svg = detail.querySelector(".community-plot__outline--" + key)!;
            svg.setAttribute("viewBox", `0 0 ${geometry.bounds.width} ${geometry.bounds.height}`);
            svg
              .querySelector("polygon")!
              .setAttribute(
                "points",
                points(
                  geometry.points.map(([x, y]) => [
                    x - geometry.bounds.left,
                    y - geometry.bounds.top,
                  ]),
                ),
              );
          }
        }
      });
  });
}

/** 按实际像素绘制连续 45° 探索线，始端超出画面，避免缩放 SVG 产生变粗或折角裂缝。 */
export function updateCommunityArrival(root: HTMLElement): void {
  const landing = root.querySelector<HTMLElement>(".community-landing");
  const marker = root.querySelector<HTMLElement>(".community-landing__arrival-end");
  const path = root.querySelector<SVGPathElement>("[data-community-arrival-path]");
  if (!landing || !marker || !path) return;
  const bounds = landing.getBoundingClientRect();
  const end = marker.getBoundingClientRect();
  const x = end.left - bounds.left + end.width / 2;
  /* 与社区地图的CSS切换点一致，避免761–767px仍使用桌面折点但已经换上手机线距。 */
  const preferredY = bounds.height * (window.innerWidth <= 767 ? 0.55 : 0.5954);
  const wall = landing.querySelector<HTMLElement>(".community-mosaic")?.getBoundingClientRect();
  const halfStroke = parseFloat(getComputedStyle(path).strokeWidth) / 2;
  /* 45°斜线的 x+y 恒定；按头像墙左上角和完整线宽退让16px，窄屏提前并线而不遮住头像。 */
  const y = wall?.width
    ? Math.min(
        preferredY,
        wall.left - bounds.left + wall.top - bounds.top - x - Math.SQRT2 * (halfStroke + 16),
      )
    : preferredY;
  const bottom = end.bottom - bounds.top + end.width * 0.55;
  const reach = Math.max(bounds.width, bounds.height) * 2;
  path.setAttribute("d", `M ${x + reach} ${y - reach} L ${x} ${y} L ${x} ${bottom}`);
  updateCommunityRiver(root);
}

/** 少量45°转折的河口用等宽折线描出两岸，转角取交点而不是叠放矩形留下缺口。 */
function riverRibbon(
  centerline: readonly CommunityMapPoint[],
  halfWidth: number,
): CommunityMapPoint[] {
  const normals = centerline.slice(1).map(([x, y], i) => {
    const [px, py] = centerline[i];
    const length = Math.hypot(x - px, y - py);
    return [-(y - py) / length, (x - px) / length] as const;
  });
  const bank = (side: number): CommunityMapPoint[] =>
    centerline.map(([x, y], i) => {
      const before = normals[Math.max(0, i - 1)];
      const after = normals[Math.min(i, normals.length - 1)];
      const scale = (side * halfWidth) / (1 + before[0] * after[0] + before[1] * after[1]);
      return [x + (before[0] + after[0]) * scale, y + (before[1] + after[1]) * scale];
    });
  return [...bank(1), ...bank(-1).reverse()];
}

/** 从当前响应式地图读取河口，按真实章节高度连接；窗口缩放和字体重排不重新生成土地。 */
function updateCommunityRiver(root: HTMLElement): void {
  const atlas = root.querySelector<HTMLElement>("[data-community-atlas]");
  const inlet = root.querySelector<SVGPolygonElement>("[data-community-river-in]");
  const outlet = root.querySelector<SVGPolygonElement>("[data-community-river-out]");
  const joins = root.querySelector<SVGPathElement>("[data-community-river-links]");
  if (!atlas || !inlet || !outlet || !joins) return;
  const bounds = atlas.getBoundingClientRect();
  const rivers = [...atlas.querySelectorAll<SVGPolygonElement>(".community-map-river")]
    .filter((river) => river.getBoundingClientRect().width > 0)
    .map((river) => {
      const matrix = river.getScreenCTM()!;
      return [...river.points].map((point) => {
        const screen = new DOMPoint(point.x, point.y).matrixTransform(matrix);
        return [screen.x - bounds.left, screen.y - bounds.top] as CommunityMapPoint;
      });
    });
  if (!rivers.length) return;
  const points = (vertices: readonly CommunityMapPoint[]) =>
    vertices.map((point) => point.join(",")).join(" ");
  joins.setAttribute(
    "d",
    rivers
      .slice(1)
      .map((river, i) => `M ${points([rivers[i][1], rivers[i][2], river[3], river[0]])} Z`)
      .join(" "),
  );

  const first = rivers[0],
    last = rivers[rivers.length - 1];
  const inHeight = first[0][1];
  inlet.ownerSVGElement!.style.height = `${inHeight}px`;
  const outHeight = outlet.ownerSVGElement!.getBoundingClientRect().height;
  const inX = (first[0][0] + first[3][0]) / 2;
  const outX = (last[1][0] + last[2][0]) / 2;
  const inTurn = Math.min(inHeight * 0.45, bounds.width - inX - 40);
  const outTurn = Math.min(outHeight * 0.45, outX - 40);
  inlet.setAttribute(
    "points",
    points(
      riverRibbon(
        [
          [bounds.width + 80, inHeight * 0.16],
          [inX + inTurn, inHeight * 0.16],
          [inX, inHeight * 0.16 + inTurn],
          [inX, inHeight],
        ],
        (first[3][0] - first[0][0]) / 2,
      ),
    ),
  );
  outlet.setAttribute(
    "points",
    points(
      riverRibbon(
        [
          [outX, 0],
          [outX, outHeight * 0.2],
          [outX - outTurn, outHeight * 0.2 + outTurn],
          [-80, outHeight * 0.2 + outTurn],
        ],
        (last[2][0] - last[1][0]) / 2,
      ),
    ),
  );
}
