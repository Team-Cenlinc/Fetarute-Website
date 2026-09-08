import type { HexColor } from "./railway.ts";

/** 非首页页面交给共享列车快选的已解析章节，不要求虚构真实铁路线路或站序。 */
export interface JourneyQuickPickStop {
  id: string;
  name: string;
  color: HexColor;
  /** 同线继续行驶时也可停靠换乘站；站标语义与线路换色独立。 */
  isTransfer?: boolean;
}
