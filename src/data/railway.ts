/**
 * 六位 RGB 十六进制颜色。
 * 品牌化类型禁止把未经校验的普通字符串赋给线路色；只能通过 createHexColor 创建，确保可安全传给 CSS。
 */
declare const hexColorBrand: unique symbol;

export type HexColor = `#${string}` & {
  readonly [hexColorBrand]: "HexColor";
};

/**
 * 校验并创建六位 RGB Hex 颜色。
 * 在模块初始化时拒绝错误色值，避免未来的线路配置将无效颜色导出到主题、导视图或启动动画。
 */
export function createHexColor(value: string): HexColor {
  if (!/^#[\da-f]{6}$/i.test(value)) {
    throw new Error(`线路颜色必须是六位 RGB Hex，收到 ${value}。`);
  }

  return value as HexColor;
}

/**
 * 铁路运营公司。
 * 公司代码是线路归属和未来运营方页面的稳定关联键，不依赖可能变化的中英文展示名称。
 */
export interface RailwayOperator {
  /** 运营方的稳定代码，例如 SURN。 */
  code: string;
  /** 导视和中文内容中优先呈现的运营方名称。 */
  primaryName: string;
  /** 站牌、地图或英语内容中呈现的运营方名称。 */
  secondaryName: string;
}

/**
 * 线路的复合身份键。
 * 线路展示代码只在运营方范围内保证稳定，因此所有关联、索引和 CSS 命名都必须同时携带运营方代码。
 */
declare const railwayLineKeyBrand: unique symbol;
export type RailwayLineKey = string & {
  readonly [railwayLineKeyBrand]: "RailwayLineKey";
};

/**
 * 一条铁路线路的共享身份。
 * 线路色只在这里定义一次，车站、动画和页面主题都通过线路复合键取得，避免复制颜色值。
 */
export interface RailwayLine {
  /** 运营方范围内稳定的展示代码；线路全局身份由 operatorCode 与 code 共同组成。 */
  code: string;
  /** 中文导视中的线路名称。 */
  primaryName: string;
  /** 英文导视中的线路名称。 */
  secondaryName: string;
  /** 线路的官方导视颜色，也是主题与动效的唯一基础色。 */
  color: HexColor;
  /** 所属运营公司的稳定代码。 */
  operatorCode: RailwayOperator["code"];
}

/**
 * 创建线路的复合身份键。
 * 使用可读的分隔符便于静态数据与构建错误定位，同时拒绝会破坏键边界的空值和分隔符。
 */
export function getRailwayLineKey(
  operatorCode: RailwayOperator["code"],
  lineCode: RailwayLine["code"],
): RailwayLineKey {
  if (!operatorCode || !lineCode || operatorCode.includes(":") || lineCode.includes(":")) {
    throw new Error(`线路身份无效：${operatorCode}:${lineCode}。`);
  }

  return `${operatorCode}:${lineCode}` as RailwayLineKey;
}

/**
 * 一座车站在单条线路内的服务记录。
 * 车站直接持有其 ListOf[Lines]，同时保留线路内站序；线路的名称、颜色与运营方通过 lineKey 关联唯一的线路记录。
 */
export interface RailwayStationLine {
  /** 服务该车站的线路复合身份键；线路展示代码从关联的 RailwayLine 读取。 */
  lineKey: RailwayLineKey;
  /** 车站在线路内的自然数序号，例如 MT-03 写为 3。 */
  stationIndex: number;
}

/**
 * 一座可被多条线路服务的实体车站。
 * 车站以稳定身份、名称、可选站码与 ListOf[Lines] 描述；每条服务记录都保留该线路内有效的站序以支持换乘。
 */
export interface RailwayStation {
  /** 不依赖展示名称或可选站码的永久车站标识。 */
  id: string;
  /** 中文导视中的车站名称。 */
  primaryName: string;
  /** 英文导视中的车站名称。 */
  secondaryName: string;
  /** 车站对外使用的导视代码；尚未编制代码的车站可以不提供。 */
  stationCode?: string;
  /** 经过本站的线路及其各自站序；换乘站会在此保留多条服务记录。 */
  lines: readonly RailwayStationLine[];
}

/**
 * 车站在线路内的服务与站序。
 * 换乘站会拥有多条记录，站序只在对应线路内有效，不能被误读为全网的车站编号。
 */
export interface RailwayLineStop {
  /** 服务该车站的线路复合身份键。 */
  lineKey: RailwayLineKey;
  /** 被该线路服务的车站标识。 */
  stationId: RailwayStation["id"];
  /** 车站在线路内的自然数序号，例如 MT-03 写为 3。 */
  stationIndex: number;
}

/**
 * Fetarute 已录入的铁路运营公司。
 * 线路归属不在这里重复维护，而是以每条线路的 operatorCode 为唯一事实来源。
 */
export const railwayOperators: readonly RailwayOperator[] = [
  {
    code: "SURN",
    primaryName: "Fetarute交通局生存北方铁路",
    secondaryName: "FTA SURnorth",
  },
  {
    code: "SURC",
    primaryName: "Fetarute交通局生存中部铁路",
    secondaryName: "FTA SURcentral",
  },
];

/**
 * Fetarute 已录入的铁路线路。
 * 未来车站站序、启动动画和页面视觉只能引用这里的线路身份，不应自行写入线路名称或色值。
 */
export const railwayLines: readonly RailwayLine[] = [
  {
    code: "Main",
    primaryName: "主线",
    secondaryName: "Main Line",
    color: createHexColor("#ADADAD"),
    operatorCode: "SURN",
  },
  {
    code: "BS",
    primaryName: "湾岸支线",
    secondaryName: "Bayside Branch",
    color: createHexColor("#17B292"),
    operatorCode: "SURN",
  },
  {
    code: "LT",
    primaryName: "列维希德支线",
    secondaryName: "Levitheed Branch",
    color: createHexColor("#06CCDD"),
    operatorCode: "SURN",
  },
  {
    code: "FRn",
    primaryName: "新远洛克威支线",
    secondaryName: "Neo Far Rockaway Branch",
    color: createHexColor("#FFCD2A"),
    operatorCode: "SURN",
  },
  {
    code: "PN",
    primaryName: "涅尼尔松港支线",
    secondaryName: "Port Nenilson Branch",
    color: createHexColor("#EE65A6"),
    operatorCode: "SURN",
  },
  {
    code: "WS",
    primaryName: "浦蓝线",
    secondaryName: "Waterside Line",
    color: createHexColor("#70DEEE"),
    operatorCode: "SURC",
  },
  {
    code: "DS",
    primaryName: "探索线",
    secondaryName: "Discover Line",
    color: createHexColor("#F6A000"),
    operatorCode: "SURC",
  },
  {
    code: "MT",
    primaryName: "大都会线",
    secondaryName: "Metropolitan Line",
    color: createHexColor("#D920D9"),
    operatorCode: "SURC",
  },
];

/**
 * 校验线路展示名称与官方导视色在全网唯一。
 * 这些字段直接参与导视识别，重复值会让不同线路无法被稳定区分，因此在 SSG 构建期立即中止。
 */
function assertUniqueRailwayLineField(
  field: "primaryName" | "secondaryName" | "color",
  fieldLabel: string,
): void {
  const seen = new Map<string, RailwayLine>();

  for (const line of railwayLines) {
    const normalizedValue = line[field].trim().toLowerCase();
    const previousLine = seen.get(normalizedValue);

    if (previousLine) {
      throw new Error(
        `线路${fieldLabel}重复：${previousLine.operatorCode}:${previousLine.code} 与 ${line.operatorCode}:${line.code} 都使用“${line[field]}”。`,
      );
    }

    seen.set(normalizedValue, line);
  }
}

assertUniqueRailwayLineField("primaryName", "中文名称");
assertUniqueRailwayLineField("secondaryName", "英文名称");
assertUniqueRailwayLineField("color", "官方导视颜色");

/**
 * Fetarute 已录入的实体车站。
 * 每座车站只录入一次，ListOf[Lines] 是线路站序的唯一事实来源；换乘站在同一车站记录内列出多条服务。
 */
export const railwayStations: readonly RailwayStation[] = [
  {
    id: "pyutocor",
    primaryName: "蒲塘桥",
    secondaryName: "Pyutocor",
    stationCode: "PTK",
    lines: [{ lineKey: getRailwayLineKey("SURC", "MT"), stationIndex: 3 }],
  },
  {
    id: "riverside",
    primaryName: "河滨道",
    secondaryName: "Riverside",
    stationCode: "RVS",
    lines: [{ lineKey: getRailwayLineKey("SURC", "MT"), stationIndex: 2 }],
  },
  {
    id: "westside",
    primaryName: "镇西",
    secondaryName: "Westside",
    stationCode: "WSD",
    lines: [
      { lineKey: getRailwayLineKey("SURC", "DS"), stationIndex: 4 },
      { lineKey: getRailwayLineKey("SURC", "MT"), stationIndex: 5 },
    ],
  },
  {
    id: "pyuu-hui",
    primaryName: "浦汇",
    secondaryName: "Pyuu Hui",
    stationCode: "PHI",
    lines: [{ lineKey: getRailwayLineKey("SURC", "WS"), stationIndex: 2 }],
  },
  {
    id: "chongchow-lym-kahn",
    primaryName: "中州·林间",
    secondaryName: "Chongchow - Lym Kahn",
    stationCode: "LYM",
    lines: [{ lineKey: getRailwayLineKey("SURC", "WS"), stationIndex: 3 }],
  },
  {
    id: "fueya-kein-po",
    primaryName: "笛矢·涧坡",
    secondaryName: "Fueya - Kein Po",
    stationCode: "KPO",
    lines: [{ lineKey: getRailwayLineKey("SURC", "WS"), stationIndex: 4 }],
  },
  {
    id: "hai-hsing",
    primaryName: "海兴",
    secondaryName: "Hai Hsing",
    stationCode: "HAS",
    lines: [{ lineKey: getRailwayLineKey("SURC", "DS"), stationIndex: 7 }],
  },
  {
    id: "neo-fueya-hor-huu",
    primaryName: "新笛矢·壑湖",
    secondaryName: "Neo Fueya - Hor Huu",
    stationCode: "HHU",
    lines: [
      { lineKey: getRailwayLineKey("SURC", "DS"), stationIndex: 1 },
      { lineKey: getRailwayLineKey("SURC", "MT"), stationIndex: 8 },
    ],
  },
  {
    id: "the-port-city",
    primaryName: "大港城",
    secondaryName: "The Port City",
    stationCode: "TPC",
    lines: [{ lineKey: getRailwayLineKey("SURC", "WS"), stationIndex: 13 }],
  },
  {
    id: "nam-toa",
    primaryName: "南渡",
    secondaryName: "Nam Toa",
    stationCode: "NTA",
    lines: [{ lineKey: getRailwayLineKey("SURC", "WS"), stationIndex: 14 }],
  },
  {
    id: "cape-jungle",
    primaryName: "丛林角",
    secondaryName: "Cape Jungle",
    stationCode: "CJG",
    lines: [{ lineKey: getRailwayLineKey("SURN", "PN"), stationIndex: 4 }],
  },
];

/**
 * 从车站 ListOf[Lines] 派生的线路站序视图。
 * 索引允许暂时不连续，因而可以先录入已确认车站，之后再补齐同一线路上的其他站点而不维护第二份关系数据。
 */
export const railwayLineStops: readonly RailwayLineStop[] = railwayStations.flatMap((station) =>
  station.lines.map((line) => ({
    lineKey: line.lineKey,
    stationId: station.id,
    stationIndex: line.stationIndex,
  })),
);

/**
 * 线路复合键与线路实体的构建期索引项。
 * 先集中生成并检查键，再导出 Map，避免重复线路身份静默覆盖前一条记录。
 */
const railwayLineEntries = railwayLines.map(
  (line) => [getRailwayLineKey(line.operatorCode, line.code), line] as const,
);

if (new Set(railwayLineEntries.map(([lineKey]) => lineKey)).size !== railwayLineEntries.length) {
  throw new Error("线路复合身份键重复，无法建立铁路线路索引。");
}

/** 按线路复合键提供常量时间查询，供组件和导出器复用同一条线路记录。 */
export const railwayLineByKey: ReadonlyMap<RailwayLineKey, RailwayLine> = new Map(
  railwayLineEntries,
);

/**
 * 按永久车站标识提供常量时间查询。
 * 启动动画和线路页面以 id 解析车站，避免把展示名称或可选站码当成关联键。
 */
export const railwayStationById: ReadonlyMap<string, RailwayStation> = new Map(
  railwayStations.map((station) => [station.id, station] as const),
);

/**
 * 按已编制的站码提供常量时间查询。
 * 这个索引只收录有站码的车站，未编制站码的车站仍应通过 railwayStationById 查询。
 */
export const railwayStationByCode: ReadonlyMap<string, RailwayStation> = new Map(
  railwayStations.flatMap((station) =>
    station.stationCode ? [[station.stationCode, station] as const] : [],
  ),
);

/**
 * 面向页面和动画的车站线路服务。
 * 将本站站序与完整线路信息组合，调用方无需扫描全量站序记录或自行解析线路代码。
 */
export interface RailwayStationLineService {
  /** 经过本站的完整线路记录，包含官方名称、颜色与运营方。 */
  line: RailwayLine;
  /** 本站在该线路内的自然数序号。 */
  stationIndex: number;
}

/**
 * 返回一座车站的 ListOf[Lines] 完整视图。
 * 未录入车站时返回空数组；若静态数据引用了未知线路则抛出错误，避免导视页面静默漏掉线路服务。
 */
export function getRailwayStationLineServices(
  stationId: RailwayStation["id"],
): readonly RailwayStationLineService[] {
  const station = railwayStationById.get(stationId);

  if (!station) {
    return [];
  }

  return station.lines.map((stationLine) => {
    const line = railwayLineByKey.get(stationLine.lineKey);

    if (!line) {
      throw new Error(`车站 ${station.id} 引用了未录入的线路 ${stationLine.lineKey}。`);
    }

    return {
      line,
      stationIndex: stationLine.stationIndex,
    };
  });
}

/**
 * 返回指定运营公司名下的全部线路。
 * 线路所有权由 RailwayLine.operatorCode 单向声明，这个函数只负责派生展示所需的反向关系。
 */
export function getRailwayLinesForOperator(
  operatorCode: RailwayOperator["code"],
): readonly RailwayLine[] {
  return railwayLines.filter((line) => line.operatorCode === operatorCode);
}

/**
 * 按站序返回一条线路的已录入车站服务记录。
 * 返回副本再排序，既提供动画所需的行进顺序，也不改变源数据中按录入批次保留的记录顺序。
 */
export function getRailwayLineStops(lineKey: RailwayLineKey): readonly RailwayLineStop[] {
  return railwayLineStops
    .filter((lineStop) => lineStop.lineKey === lineKey)
    .sort((left, right) => left.stationIndex - right.stationIndex);
}
