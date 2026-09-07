import { createCommunityMaps, type CommunityMapPoint } from "../../data/community-map.ts";
import { communityGeometryStyle, createCommunityLayout } from "./layout.ts";
import { communityPlaces } from "../../data/community-places.ts";

/** 首次进入时选择访问种子；显式 mapSeed 可复现设计，不持久化访客身份。 */
export function initializeCommunityMap(root: HTMLElement): void {
  const query = new URL(window.location.href).searchParams.get("mapSeed");
  const seed =
    query && /^\d{1,10}$/.test(query) && Number(query) <= 0xffffffff
      ? Number(query)
      : crypto.getRandomValues(new Uint32Array(1))[0];
  root.dataset.communitySeed = String(seed);
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
        const plots = createCommunityLayout(
          details.map((element) => element.id),
          blockSeed,
          maps,
        );
        const occupied = new Set(plots.map((plot) => plot.slot));
        const landmarks = new Map<number, { kind: number; name: string }>();
        for (let index = 0; index < maps.desktop.lots.length; index++) {
          if (occupied.has(index)) continue;
          const candidates = communityPlaces
            .flatMap((place, kind) => place.names.map((name) => ({ kind, name })))
            .filter((place) => !usedPlaces.has(place.name));
          if (!candidates.length) continue;
          const place = candidates[(blockSeed + index) % candidates.length];
          landmarks.set(index, place);
          usedPlaces.add(place.name);
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
          const detail = details.find((element) => element.id === plot.id)!;
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
  const map = root.querySelector<HTMLElement>(".community-map-block");
  const inlet = root.querySelector<SVGPolygonElement>("[data-community-river-in]");
  const outlet = root.querySelector<SVGPolygonElement>("[data-community-river-out]");
  if (map && inlet && outlet) {
    const mapBounds = map.getBoundingClientRect();
    const right = mapBounds.right - bounds.left;
    const left = right - mapBounds.width * 0.1;
    const inHeight = inlet.ownerSVGElement!.getBoundingClientRect().height;
    const outHeight = outlet.ownerSVGElement!.getBoundingClientRect().height;
    inlet.setAttribute(
      "points",
      `${bounds.width + 80},-30 ${bounds.width + 80},${inHeight * 0.4} ${right},${inHeight} ${left},${inHeight} ${left},${inHeight * 0.7}`,
    );
    outlet.setAttribute(
      "points",
      `${left},0 ${right},0 ${right},${outHeight * 0.25} ${right - outHeight * 0.55},${outHeight * 0.85} -80,${outHeight * 0.85} -80,${outHeight * 0.4} ${left - outHeight * 0.2},${outHeight * 0.4} ${left},${outHeight * 0.18}`,
    );
  }
}
