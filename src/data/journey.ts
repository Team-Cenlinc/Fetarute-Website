import type { HexColor } from "./railway.ts";

/** 非首页页面交给共享列车快选的已解析章节，不要求虚构真实铁路线路或站序。 */
export interface JourneyQuickPickStop {
  id: string;
  name: string;
  color: HexColor;
}
