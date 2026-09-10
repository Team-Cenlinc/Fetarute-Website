import {
  webMcpPages,
  webMcpPublicOverview,
  webMcpResources,
  type WebMcpArticle,
  type WebMcpArticleCollection,
  type WebMcpPage,
  type WebMcpResource,
} from "../data/webmcp.ts";
import { statusDashboardUrl } from "../data/site.ts";
import { locales, type Locale } from "../i18n/config.ts";
import {
  getMinecraftStatusUrl,
  instanceIds,
  minecraftRefreshInterval,
  minecraftStatusTimeout,
  parseMinecraftSnapshot,
  type MinecraftSnapshot,
} from "./minecraft-status.ts";

/** WebMCP 工具标注；只保留当前官网实际使用的安全提示字段，避免本地类型先于草案扩张。 */
export interface WebMcpToolAnnotations {
  /** 工具不会改变页面、账户或外部服务状态时设为 true，帮助代理免除不必要的确认。 */
  readOnlyHint: boolean;
  /** 工具是否可能返回用户生成或第三方来源的内容；Fetarute 的静态资料工具均为 false。 */
  untrustedContentHint: boolean;
  /** 工具是否会产生不可逆或高风险后果；Fetarute 的资料查询工具均为 false。 */
  consequentialHint: boolean;
}

/** WebMCP 对工具执行回调提供的最小上下文；目前仅需保留取消信号的类型边界。 */
export interface WebMcpToolExecutionOptions {
  /** 浏览器或代理取消本次执行时触发；Chrome 152 尚未提供该上下文，因此调用方必须允许它缺席。 */
  signal: AbortSignal;
}

/** WebMCP 工具在当前草案中使用的可序列化定义。 */
export interface WebMcpTool {
  /** 浏览器代理发现工具时使用的 ASCII 稳定标识，不能随界面语言改变。 */
  name: string;
  /** 供代理界面展示的简洁人类标题。 */
  title: string;
  /** 精确说明工具目的与适用场景，避免代理从页面文本推断副作用。 */
  description: string;
  /** JSON Schema 输入约束；所有接受枚举的工具都在执行时再次收窄，不能只信任 schema。 */
  inputSchema: Record<string, unknown>;
  /** 让代理按工具真实副作用处理执行确认与输出安全性。 */
  annotations: WebMcpToolAnnotations;
  /**
   * 返回 JSON 可序列化结果的工具回调；浏览器负责把结果传回调用代理。
   * options 必须可选：Chrome 152 只传入参，草案里的执行上下文尚未实现，读取 `options.signal` 会直接抛错。
   */
  execute: (
    input: Record<string, unknown>,
    options?: WebMcpToolExecutionOptions,
  ) => unknown | Promise<unknown>;
}

/** WebMCP 草案在 Document 上暴露的最小运行时接口，避免为实验标准增加生产依赖。 */
export interface WebMcpModelContext {
  /** 注册工具；AbortSignal 会在页面卸载或局部注册失败时撤销已注册的工具。 */
  registerTool: (tool: WebMcpTool, options: { signal: AbortSignal }) => Promise<void>;
}

/** 运行时需要的 Document 子集；普通浏览器没有 WebMCP 时 modelContext 为 undefined。 */
export interface WebMcpDocument {
  /** 与原生 Document 共享的只读字段，使浏览器文档可直接传入而测试替身仍保持最小。 */
  readonly URL?: string;
  /** WebMCP 的渐进增强入口；该接口仍处于标准草案阶段，因此必须先做能力检查。 */
  modelContext?: WebMcpModelContext;
  /** 读取构建期内嵌的文章目录节点；缺少该方法或节点时只会少注册文章检索工具，其余工具不受影响。 */
  getElementById?: (elementId: string) => { textContent: string | null } | null;
}

/** 构建期文章目录在页面中的节点 id；由 BaseLayout 以 `application/json` 脚本写入，不额外发起网络请求。 */
export const webMcpArticleCatalogueElementId = "fetarute-webmcp-articles";

/** 单次文章检索的返回上限；代理需要的是可判断的少量候选，不是整份目录。 */
const maxArticleResults = 20;

/** 文章检索默认返回的条目数，避免代理不指定 limit 时把全部内容塞进上下文。 */
const defaultArticleResults = 10;

/** 文章目录覆盖的集合白名单；与 `src/content.config.ts` 保持一致。 */
const articleCollections: readonly WebMcpArticleCollection[] = ["guides", "news"];

/**
 * 读取一次实时状态快照。
 * 由注册层或测试注入，使工具契约仍可由 Node 原生测试直接加载，而不必在单元测试里模拟浏览器网络栈。
 */
export type WebMcpStatusReader = (signal?: AbortSignal) => Promise<MinecraftSnapshot>;

/** 服务可用性的三种取值；`unknown` 表示官网没读到状态服务，与「服务器离线」是不同结论。 */
type WebMcpAvailability = "online" | "offline" | "unknown";

/** 单个子服务器的健康度；快照缺失时同样落到 `unknown` 而不是假定不健康。 */
type WebMcpWorldHealth = "healthy" | "unhealthy" | "unknown";

/**
 * 随实时状态一并返回的固定说明。
 * 代理容易把「读不到」讲成「已离线」、把「不返回玩家数据」讲成「没有人在线」，因此这两条边界必须写在结果里，而不是只写在文档里。
 */
const statusResultNote =
  "unknown means this website could not read the status service; it does not mean the server is offline. This tool never returns player counts, player names, server addresses, or version details.";

/**
 * 默认的实时状态取数实现。
 * 与 Info 页面的状态组件共用 `getMinecraftStatusUrl` 与 `parseMinecraftSnapshot`，因此代理拿到的判定与读者在页面上看到的同源；
 * 浏览器提供取消信号时与请求超时合并，避免工具在页面卸载后仍持有未完成的请求；Chrome 152 不提供该信号，此时只受超时约束。
 */
async function fetchMinecraftStatusSnapshot(signal?: AbortSignal): Promise<MinecraftSnapshot> {
  const hostname = typeof location === "undefined" ? "" : location.hostname;
  const timeout = AbortSignal.timeout(minecraftStatusTimeout);
  const response = await fetch(getMinecraftStatusUrl(hostname), {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    credentials: "omit",
  });

  if (!response.ok) throw new Error("Status request failed");

  return parseMinecraftSnapshot(await response.json());
}

/** 官网无法读到状态服务时的结果；每个字段都明确表达「未知」，不留下可被读成离线或零人的空位。 */
function unknownStatusResult() {
  return {
    ok: true,
    availability: "unknown" satisfies WebMcpAvailability,
    checkedAt: null,
    ageSeconds: null,
    freshness: "unknown",
    worlds: Object.fromEntries(instanceIds.map((id) => [id, "unknown" as WebMcpWorldHealth])),
    dashboard: statusDashboardUrl,
    note: statusResultNote,
  };
}

/**
 * 把已校验的快照转换为代理可用的结果。
 * 采样时间与新鲜度一起返回：超过一个刷新周期的快照仍是事实，但代理必须能看出它可能已经不代表此刻的服务状态。
 */
function describeStatusSnapshot(snapshot: MinecraftSnapshot, now: number) {
  const ageSeconds = Math.max(0, Math.round((now - Date.parse(snapshot.checkedAt)) / 1000));

  return {
    ok: true,
    availability: snapshot.status satisfies WebMcpAvailability,
    checkedAt: snapshot.checkedAt,
    ageSeconds,
    freshness: ageSeconds * 1000 > minecraftRefreshInterval ? "stale" : "fresh",
    worlds: Object.fromEntries(
      instanceIds.map((id) => [id, snapshot.subservers[id].health satisfies WebMcpWorldHealth]),
    ),
    dashboard: statusDashboardUrl,
    note: statusResultNote,
  };
}

/**
 * 当前所有工具共用的只读标注：都不改变页面、账户或外部服务状态。
 * 实时状态虽然读取上游服务，但只输出已校验的枚举与时间戳，不透传任何上游自由文本，因此 untrustedContentHint 仍为 false。
 * 今后的写入型工具，或会把用户生成内容原样返回的工具，必须另行判断标注。
 */
const readOnlyToolAnnotations: WebMcpToolAnnotations = {
  readOnlyHint: true,
  untrustedContentHint: false,
  consequentialHint: false,
};

const webMcpReadyDocuments = new WeakSet<WebMcpDocument>();

/** 检查未知输入是否是对象；工具入参来自代理，不能假定它满足 JSON Schema。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 运行时代码只接受 schema 声明过的字段，防止代理额外附带资料被静默接收或记录。 */
function hasOnlyAllowedKeys(input: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(input).every((key) => allowed.includes(key));
}

/** 将代理提供的资源键收窄为官方白名单，拒绝把任意 URL 变成一次页面跳转能力。 */
function findResource(input: Record<string, unknown>): WebMcpResource | undefined {
  const resource = input.resource;

  return hasOnlyAllowedKeys(input, ["resource"]) && typeof resource === "string"
    ? webMcpResources.find((candidate) => candidate.key === resource)
    : undefined;
}

/** 将代理提供的页面和语言收窄为 Astro 实际静态生成的路由白名单。 */
function findLocalizedPage(
  input: Record<string, unknown>,
): { page: WebMcpPage; locale: Locale } | undefined {
  const page = input.page;
  const locale = input.locale;

  if (
    !hasOnlyAllowedKeys(input, ["page", "locale"]) ||
    typeof page !== "string" ||
    typeof locale !== "string"
  ) {
    return undefined;
  }

  const matchedPage = webMcpPages.find((candidate) => candidate.key === page);

  return matchedPage && (locales as readonly string[]).includes(locale)
    ? { page: matchedPage, locale: locale as Locale }
    : undefined;
}

/**
 * 由受控 locale 与页面路径生成正式绝对 URL。
 * 这里不调用 astro:i18n helper，使同一份工具契约可由 Node 原生测试直接加载；输入已在 findLocalizedPage 中收窄。
 */
function getWebMcpPageUrl(locale: Locale, page: WebMcpPage): string {
  return new URL(`/${locale}/${page.path}`, webMcpPublicOverview.website).toString();
}

/** 构造统一的无效输入结果，使代理可以根据白名单自行修正而不泄露内部异常。 */
function invalidInputResult(parameter: "resource" | "page-and-locale", allowed: readonly string[]) {
  return {
    ok: false,
    error: `Invalid ${parameter}. Choose one of: ${allowed.join(", ")}.`,
  };
}

/** 目标语言尚未翻译、但在其他语言已发布的一篇文章。 */
interface WebMcpMissingTranslation {
  /** 文章所属集合，与检索结果里的条目使用同一组取值。 */
  collection: WebMcpArticleCollection;
  /** 跨语言共享的稳定文章标识，代理可据此换一种语言再查。 */
  translationKey: string;
  /** 该文章实际已发布的语言。 */
  availableLocales: Locale[];
}

/** 文章检索的合法入参；语言必填，其余条件缺省表示不过滤。 */
interface WebMcpArticleQuery {
  /** 读者语言；目录不做跨语言回退，因此这里决定返回哪一批条目。 */
  locale: Locale;
  /** 限定集合；缺省时同时返回指南与公告。 */
  collection?: WebMcpArticleCollection;
  /** 已转为小写的标题/摘要子串条件；缺省时返回该语言的全部条目。 */
  query?: string;
  /** 本次返回的条目上限。 */
  limit: number;
}

/** 构造文章检索的无效输入结果，把可用取值一次性说清楚，避免代理反复试探参数。 */
function invalidArticleQueryResult() {
  return {
    ok: false,
    error: `Invalid article query. Provide locale as one of: ${locales.join(", ")}. Optional collection must be one of: ${articleCollections.join(", ")}. Optional query must be text, and optional limit must be an integer between 1 and ${maxArticleResults}.`,
  };
}

/** 把代理入参收窄为受控的检索条件；任何越界值都整体拒绝，而不是悄悄取一个默认值继续。 */
function parseArticleQuery(input: Record<string, unknown>): WebMcpArticleQuery | undefined {
  const { locale, collection, query, limit } = input;

  if (
    !hasOnlyAllowedKeys(input, ["locale", "collection", "query", "limit"]) ||
    typeof locale !== "string" ||
    !(locales as readonly string[]).includes(locale) ||
    (collection !== undefined &&
      (typeof collection !== "string" ||
        !(articleCollections as readonly string[]).includes(collection))) ||
    (query !== undefined && typeof query !== "string") ||
    (limit !== undefined &&
      (typeof limit !== "number" ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > maxArticleResults))
  ) {
    return undefined;
  }

  const trimmedQuery = typeof query === "string" ? query.trim().toLowerCase() : "";

  return {
    locale: locale as Locale,
    ...(collection ? { collection: collection as WebMcpArticleCollection } : {}),
    ...(trimmedQuery ? { query: trimmedQuery } : {}),
    limit: typeof limit === "number" ? limit : defaultArticleResults,
  };
}

/** 标题或摘要命中即视为匹配；不检索正文，避免把未经审阅的长文塞进代理上下文。 */
function matchesArticleQuery(article: WebMcpArticle, query: string | undefined): boolean {
  return (
    query === undefined ||
    article.title.toLowerCase().includes(query) ||
    article.description.toLowerCase().includes(query)
  );
}

/**
 * 列出目标语言缺失、但在其他语言已发布的文章。
 * 这样代理既不会把另一种语言的条目当成本语言结果，也不会误以为内容不存在；不按 query 过滤，因为其他语言的标题无法用本语言关键词可靠匹配。
 * 同样受 limit 约束：否则代理指定 limit=1 时仍可能收到整站的缺翻译清单，limit 就挡不住上下文膨胀。
 */
function findMissingTranslations(
  catalogue: readonly WebMcpArticle[],
  parsed: WebMcpArticleQuery,
): {
  missingTranslations: WebMcpMissingTranslation[];
  missingTranslationsTotal: number;
} {
  const missing = new Map<string, WebMcpMissingTranslation>();

  for (const article of catalogue) {
    const identity = `${article.collection}/${article.translationKey}`;

    if (
      (parsed.collection && article.collection !== parsed.collection) ||
      article.availableLocales.includes(parsed.locale) ||
      missing.has(identity)
    ) {
      continue;
    }

    missing.set(identity, {
      collection: article.collection,
      translationKey: article.translationKey,
      availableLocales: [...article.availableLocales],
    });
  }

  // 与 articles/total 同一模式：数组按 limit 截断，总数单独报告，代理才能看出还有多少没列出来。
  return {
    missingTranslations: [...missing.values()].slice(0, parsed.limit),
    missingTranslationsTotal: missing.size,
  };
}

/**
 * 判断 URL 是否真的落在官网 origin 上。
 * 必须解析后比较 origin：前缀匹配会放过 `https://fetarute.org.example.com/...` 这类同前缀站外域名，
 * 而这个校验存在的意义正是不让被篡改的目录把代理引向站外。
 */
function isOfficialSiteUrl(url: string): boolean {
  try {
    return new URL(url).origin === new URL(webMcpPublicOverview.website).origin;
  } catch {
    return false;
  }
}

/**
 * 校验并收窄内嵌的文章目录。
 * 目录由本站构建期生成，但仍逐条校验：页面被裁剪或缓存到旧结构时，宁可少注册工具，也不要返回半截数据。
 */
export function parseWebMcpArticleCatalogue(value: unknown): readonly WebMcpArticle[] {
  if (!Array.isArray(value)) return [];

  return value.filter((entry): entry is WebMcpArticle => {
    if (!isRecord(entry)) return false;

    const { collection, translationKey, locale, title, description, url, availableLocales } = entry;

    return (
      typeof collection === "string" &&
      (articleCollections as readonly string[]).includes(collection) &&
      typeof translationKey === "string" &&
      typeof locale === "string" &&
      (locales as readonly string[]).includes(locale) &&
      typeof title === "string" &&
      typeof description === "string" &&
      typeof url === "string" &&
      isOfficialSiteUrl(url) &&
      Array.isArray(availableLocales) &&
      availableLocales.every((candidate) => (locales as readonly string[]).includes(candidate))
    );
  });
}

/**
 * 从页面内嵌的 JSON 读取构建期文章目录。
 * 走 DOM 而不是网络请求，静态站点因此不需要额外路由；节点缺失或 JSON 损坏都只让文章检索工具不注册。
 */
function readArticleCatalogue(document: WebMcpDocument): readonly WebMcpArticle[] {
  const element = document.getElementById?.(webMcpArticleCatalogueElementId);

  if (!element?.textContent) return [];

  try {
    return parseWebMcpArticleCatalogue(JSON.parse(element.textContent));
  } catch {
    return [];
  }
}

/** 返回无输入工具的明确校验结果，避免把任意代理参数默默忽略。 */
function noInputExpectedResult() {
  return {
    ok: false,
    error: "This tool does not accept input.",
  };
}

/**
 * 创建 Fetarute 站点的 WebMCP 工具定义。
 * 工具全部只读：它们提供可靠的官方事实和 URL，不复制点击、剪贴板或网络状态查询等已有界面动作。
 * `articles` 为构建期从 Astro Content Collections 派生的目录；为空时不注册文章检索工具，避免代理拿到一个永远查不到内容的入口。
 */
export function createFetaruteWebMcpTools(
  articles: readonly WebMcpArticle[] = [],
  readStatusSnapshot: WebMcpStatusReader = fetchMinecraftStatusSnapshot,
): readonly WebMcpTool[] {
  const resourceKeys = webMcpResources.map((resource) => resource.key);
  const pageKeys = webMcpPages.map((page) => page.key);

  const tools: WebMcpTool[] = [
    {
      name: "get-fetarute-overview",
      title: "Get Fetarute overview",
      description:
        "Returns the official Fetarute community summary, its three worlds, supported website languages, and the public server-access boundary.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: readOnlyToolAnnotations,
      execute(input) {
        if (!isRecord(input) || Object.keys(input).length > 0) {
          return noInputExpectedResult();
        }

        return {
          ok: true,
          ...webMcpPublicOverview,
          languages: locales,
        };
      },
    },
    {
      name: "find-fetarute-resource",
      title: "Find an official Fetarute resource",
      description:
        "Returns the direct official URL and purpose for one Fetarute Wiki, status dashboard, or world map resource.",
      inputSchema: {
        type: "object",
        properties: {
          resource: {
            type: "string",
            enum: resourceKeys,
            description: "Official resource to retrieve.",
          },
        },
        required: ["resource"],
        additionalProperties: false,
      },
      annotations: readOnlyToolAnnotations,
      execute(input) {
        if (!isRecord(input)) {
          return invalidInputResult("resource", resourceKeys);
        }

        const resource = findResource(input);

        return resource ? { ok: true, resource } : invalidInputResult("resource", resourceKeys);
      },
    },
    {
      name: "find-fetarute-page",
      title: "Find a localized Fetarute page",
      description:
        "Returns the official localized URL for Fetarute home, community, or information pages without navigating the user. Choose info to find news and the joining guide.",
      inputSchema: {
        type: "object",
        properties: {
          page: {
            type: "string",
            enum: pageKeys,
            description: "Published Fetarute page to retrieve.",
          },
          locale: {
            type: "string",
            enum: locales,
            description: "Language variant of the published page.",
          },
        },
        required: ["page", "locale"],
        additionalProperties: false,
      },
      annotations: readOnlyToolAnnotations,
      execute(input) {
        if (!isRecord(input)) {
          return invalidInputResult("page-and-locale", [...pageKeys, ...locales]);
        }

        const localizedPage = findLocalizedPage(input);

        return localizedPage
          ? {
              ok: true,
              page: localizedPage.page.key,
              locale: localizedPage.locale,
              title: localizedPage.page.title,
              description: localizedPage.page.description,
              url: getWebMcpPageUrl(localizedPage.locale, localizedPage.page),
            }
          : invalidInputResult("page-and-locale", [...pageKeys, ...locales]);
      },
    },
  ];

  tools.push({
    name: "get-fetarute-service-status",
    title: "Get Fetarute service status",
    description:
      "Reads the official Fetarute status service once and returns whether the entry server answered, the health of the Lobby, Survival, and Creative worlds, and when the sample was taken. It never returns player counts or player names.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    // 取数不改变任何状态，因此仍是只读；上游自由文本（MOTD、版本、玩家名）一律不透传，返回的只有已校验的枚举与时间戳。
    annotations: readOnlyToolAnnotations,
    async execute(input, options) {
      if (!isRecord(input) || Object.keys(input).length > 0) {
        return noInputExpectedResult();
      }

      try {
        return describeStatusSnapshot(await readStatusSnapshot(options?.signal), Date.now());
      } catch {
        // 请求失败、超时或快照不合法都只能得出「未知」；把它们讲成离线会让读者错过一次真实可用的服务。
        return unknownStatusResult();
      }
    },
  });

  if (articles.length > 0) {
    tools.push({
      name: "find-fetarute-articles",
      title: "Find Fetarute guides and announcements",
      description:
        "Searches the titles and summaries of published Fetarute guides and announcements in one website language and returns their official URLs. Use it for questions such as how to join. It returns catalogue entries only, never article text.",
      inputSchema: {
        type: "object",
        properties: {
          locale: {
            type: "string",
            enum: locales,
            description: "Language the reader wants the article in.",
          },
          collection: {
            type: "string",
            enum: articleCollections,
            description:
              "Optional filter: guides are long-lived how-to pages, news are dated announcements.",
          },
          query: {
            type: "string",
            description: "Optional text matched against article titles and summaries.",
          },
          limit: {
            type: "integer",
            minimum: 1,
            maximum: maxArticleResults,
            description: `Optional maximum number of articles to return (default ${defaultArticleResults}).`,
          },
        },
        required: ["locale"],
        additionalProperties: false,
      },
      annotations: readOnlyToolAnnotations,
      execute(input) {
        if (!isRecord(input)) {
          return invalidArticleQueryResult();
        }

        const parsed = parseArticleQuery(input);

        if (!parsed) {
          return invalidArticleQueryResult();
        }

        const matched = articles.filter(
          (article) =>
            article.locale === parsed.locale &&
            (!parsed.collection || article.collection === parsed.collection) &&
            matchesArticleQuery(article, parsed.query),
        );

        return {
          ok: true,
          locale: parsed.locale,
          total: matched.length,
          articles: matched.slice(0, parsed.limit),
          ...findMissingTranslations(articles, parsed),
        };
      },
    });
  }

  return tools;
}

/**
 * 在支持 WebMCP 的浏览器中注册 Fetarute 工具。
 * 无实现、权限策略拒绝或任何注册失败都只停用增强能力，不影响 Astro 静态页面、导航或已有脚本。
 */
export async function setupFetaruteWebMcp(document: WebMcpDocument): Promise<boolean> {
  const modelContext = document.modelContext;

  if (!modelContext || typeof modelContext.registerTool !== "function") {
    return false;
  }

  if (webMcpReadyDocuments.has(document)) {
    return true;
  }

  const registrationController = new AbortController();

  try {
    await Promise.all(
      createFetaruteWebMcpTools(readArticleCatalogue(document)).map((tool) =>
        modelContext.registerTool(tool, { signal: registrationController.signal }),
      ),
    );
    webMcpReadyDocuments.add(document);
    return true;
  } catch {
    // 部分工具先成功时同样撤销，避免再次初始化因同名工具而永久失败。
    registrationController.abort();
    return false;
  }
}
