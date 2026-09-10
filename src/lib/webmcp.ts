import {
  webMcpPages,
  webMcpPublicOverview,
  webMcpResources,
  type WebMcpPage,
  type WebMcpResource,
} from "../data/webmcp.ts";
import { locales, type Locale } from "../i18n/config.ts";

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
  /** 浏览器或代理取消本次执行时触发；当前同步查询不持有异步操作，但保留草案要求的回调形状。 */
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
  /** 返回 JSON 可序列化结果的工具回调；浏览器负责把结果传回调用代理。 */
  execute: (
    input: Record<string, unknown>,
    options: WebMcpToolExecutionOptions,
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
}

/** 三个查询只返回本站维护的静态事实，因此共用只读标注；今后的写入或第三方内容工具必须另行判断标注。 */
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

/** 返回无输入工具的明确校验结果，避免把任意代理参数默默忽略。 */
function noInputExpectedResult() {
  return {
    ok: false,
    error: "This tool does not accept input.",
  };
}

/**
 * 创建 Fetarute 站点的 WebMCP 工具定义。
 * 三个工具全部只读：它们提供可靠的官方事实和 URL，不复制点击、剪贴板或网络状态查询等已有界面动作。
 */
export function createFetaruteWebMcpTools(): readonly WebMcpTool[] {
  const resourceKeys = webMcpResources.map((resource) => resource.key);
  const pageKeys = webMcpPages.map((page) => page.key);

  return [
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
      createFetaruteWebMcpTools().map((tool) =>
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
