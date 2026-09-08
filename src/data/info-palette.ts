import { getRailwayLineCssVariableName, getRailwayLineTextColor } from "./palette";
import { getRailwayLineKey, railwayLineByKey } from "./railway";

/** Info borrows existing line colors; categories do not represent live server health. */
const categoryLines = {
  info: { operatorCode: "FTA", code: "SL" },
  status: { operatorCode: "SURN", code: "BS" },
  news: { operatorCode: "SURC", code: "WS" },
  game: { operatorCode: "SURN", code: "PN" },
  other: { operatorCode: "SURN", code: "FRn" },
} as const;

export type InfoCategory = keyof typeof categoryLines;

export function getInfoMarkerStyle(category: InfoCategory): string {
  const { operatorCode, code } = categoryLines[category];
  const line = railwayLineByKey.get(getRailwayLineKey(operatorCode, code));
  if (!line) throw new Error(`Missing Info palette line: ${category}`);
  return `background: var(${getRailwayLineCssVariableName(line)}); color: ${getRailwayLineTextColor(line.color)};`;
}
