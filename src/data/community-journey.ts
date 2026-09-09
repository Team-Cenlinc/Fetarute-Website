import { communityMapPalette } from "./palette.ts";
import type { JourneyQuickPickStop } from "./journey.ts";
import type { Locale } from "../i18n/config.ts";
import { communityMessages } from "../i18n/community.ts";

/** 社区沿浦蓝线连续行驶；探索线与 PN 只在社区中心、世界与社群交会，不改变主线。 */
export function getCommunityJourneyStops(locale: Locale): readonly JourneyQuickPickStop[] {
  const copy = communityMessages[locale];
  const color = communityMapPalette.route;
  return [
    { id: "community-center", name: copy.title, color, isTransfer: true },
    { id: "community-district", name: copy.districtStop, color },
    { id: "community-connections", name: copy.connectionsTitle, color, isTransfer: true },
    { id: "community-contact", name: copy.contactStop, color },
  ];
}
