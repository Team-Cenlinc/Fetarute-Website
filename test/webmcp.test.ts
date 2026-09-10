import assert from "node:assert/strict";
import test from "node:test";
import type { WebMcpArticle } from "../src/data/webmcp.ts";
import type { MinecraftSnapshot } from "../src/lib/minecraft-status.ts";
import {
  createFetaruteWebMcpTools,
  parseWebMcpArticleCatalogue,
  setupFetaruteWebMcp,
  webMcpArticleCatalogueElementId,
  type WebMcpDocument,
  type WebMcpStatusReader,
  type WebMcpTool,
} from "../src/lib/webmcp.ts";

function getTool(name: string): WebMcpTool {
  const tool = createFetaruteWebMcpTools().find((candidate) => candidate.name === name);

  assert.ok(tool, `应注册 ${name} 工具`);
  return tool;
}

test("WebMCP 仅暴露互不重叠的官方只读查询工具", () => {
  const tools = createFetaruteWebMcpTools();

  assert.deepEqual(
    tools.map((tool) => tool.name),
    [
      "get-fetarute-overview",
      "find-fetarute-resource",
      "find-fetarute-page",
      "get-fetarute-service-status",
    ],
  );

  for (const tool of tools) {
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.equal(tool.annotations.untrustedContentHint, false);
    assert.equal(tool.annotations.consequentialHint, false);
    assert.ok(tool.description.length <= 500);
  }
});

test("WebMCP 概览不把占位服务器地址误报为公开加入入口", () => {
  const overview = getTool("get-fetarute-overview").execute(
    {},
    { signal: new AbortController().signal },
  );

  assert.deepEqual(overview, {
    ok: true,
    name: "Fetarute",
    website: "https://fetarute.org",
    summary:
      "Fetarute is a Minecraft community built around railways, collaborative construction, and exploration.",
    worlds: ["Lobby", "Survival", "Creative"],
    serverAccess:
      "Fetarute is a private server with an application and review process. Submit the application form in the QQ portal group and wait for review; the group provides the next steps. Use find-fetarute-page with page=info and your preferred locale to reach the joining guide. This tool does not return a group number or game-server address, or guarantee availability or version compatibility.",
    languages: ["zh-Hans", "zh-Hant", "en"],
  });
  assert.doesNotMatch(JSON.stringify(overview), /play\.fetarute\.example/);
});

test("WebMCP 资源与页面查询只接受发布白名单并返回规范 URL", () => {
  const resource = getTool("find-fetarute-resource").execute(
    { resource: "survival-map" },
    { signal: new AbortController().signal },
  );
  const page = getTool("find-fetarute-page").execute(
    { page: "community", locale: "zh-Hant" },
    { signal: new AbortController().signal },
  );
  const invalidResource = getTool("find-fetarute-resource").execute(
    { resource: "https://untrusted.example" },
    { signal: new AbortController().signal },
  );
  const resourceWithUnexpectedField = getTool("find-fetarute-resource").execute(
    { resource: "wiki", visitorEmail: "agent@example.test" },
    { signal: new AbortController().signal },
  );
  const invalidPage = getTool("find-fetarute-page").execute(
    { page: "join", locale: "en" },
    { signal: new AbortController().signal },
  );

  assert.deepEqual(resource, {
    ok: true,
    resource: {
      key: "survival-map",
      title: "Fetarute Survival Map",
      url: "https://map.survival.fetarute.org",
      description: "Interactive map for the Survival world.",
    },
  });
  assert.deepEqual(page, {
    ok: true,
    page: "community",
    locale: "zh-Hant",
    title: "Fetarute Community",
    description: "People, servers, and community connections.",
    url: "https://fetarute.org/zh-Hant/community/",
  });
  assert.deepEqual(invalidResource, {
    ok: false,
    error:
      "Invalid resource. Choose one of: wiki, status-dashboard, survival-map, lobby-map, creative-map.",
  });
  assert.deepEqual(resourceWithUnexpectedField, {
    ok: false,
    error:
      "Invalid resource. Choose one of: wiki, status-dashboard, survival-map, lobby-map, creative-map.",
  });
  assert.deepEqual(invalidPage, {
    ok: false,
    error: "Invalid page-and-locale. Choose one of: home, community, info, zh-Hans, zh-Hant, en.",
  });
});

test("WebMCP 没有浏览器实现时不改变页面，注册失败也撤销部分成功工具", async () => {
  const unsupportedDocument: WebMcpDocument = {};
  assert.equal(await setupFetaruteWebMcp(unsupportedDocument), false);

  const registrationSignals: AbortSignal[] = [];
  const rejectedDocument: WebMcpDocument = {
    modelContext: {
      registerTool(_tool, options) {
        registrationSignals.push(options.signal);
        return registrationSignals.length === 2
          ? Promise.reject(new Error("registration failed"))
          : Promise.resolve();
      },
    },
  };

  assert.equal(await setupFetaruteWebMcp(rejectedDocument), false);
  assert.equal(registrationSignals.length, 4);
  assert.ok(registrationSignals.every((signal) => signal.aborted));
});

test("WebMCP 每个文档只注册一次，避免页面恢复时同名工具冲突", async () => {
  const registeredTools: WebMcpTool[] = [];
  const document: WebMcpDocument = {
    modelContext: {
      registerTool(tool) {
        registeredTools.push(tool);
        return Promise.resolve();
      },
    },
  };

  assert.equal(await setupFetaruteWebMcp(document), true);
  assert.equal(await setupFetaruteWebMcp(document), true);
  assert.equal(registeredTools.length, 4);
});

/**
 * 构建期目录的最小替身。
 * 覆盖三种情况：三语齐全的指南、只有部分语言的指南、以及带发布时间的公告，用来验证语言过滤与缺失翻译报告。
 */
const articleCatalogue: readonly WebMcpArticle[] = [
  {
    collection: "guides",
    translationKey: "join",
    locale: "zh-Hans",
    title: "申请加入 Fetarute",
    description: "从 QQ 门户群开始，完成申请后再一起出发。",
    url: "https://fetarute.org/zh-Hans/guides/join/",
    availableLocales: ["zh-Hans", "zh-Hant", "en"],
  },
  {
    collection: "guides",
    translationKey: "join",
    locale: "en",
    title: "Apply to join Fetarute",
    description: "Start with the QQ portal group.",
    url: "https://fetarute.org/en/guides/join/",
    availableLocales: ["zh-Hans", "zh-Hant", "en"],
  },
  {
    collection: "guides",
    translationKey: "railway-signals",
    locale: "zh-Hans",
    title: "铁路信号规范",
    description: "共线运行时的信号与闭塞约定。",
    url: "https://fetarute.org/zh-Hans/guides/railway-signals/",
    availableLocales: ["zh-Hans"],
  },
  {
    collection: "news",
    translationKey: "site-foundation",
    locale: "zh-Hans",
    title: "Fetarute 新官网仍在建设中",
    description: "内容正在陆续抵达；感谢你的耐心等候。",
    url: "https://fetarute.org/zh-Hans/news/site-foundation/",
    availableLocales: ["zh-Hans", "zh-Hant", "en"],
    publishedAt: "2026-07-10T00:00:00.000Z",
    pinned: true,
  },
];

function getArticleTool(): WebMcpTool {
  const tool = createFetaruteWebMcpTools(articleCatalogue).find(
    (candidate) => candidate.name === "find-fetarute-articles",
  );

  assert.ok(tool, "提供目录时应注册 find-fetarute-articles");
  return tool;
}

function executeArticleTool(input: Record<string, unknown>) {
  return getArticleTool().execute(input, { signal: new AbortController().signal });
}

test("目录为空时不注册文章检索工具，避免代理拿到查不到内容的入口", () => {
  assert.ok(
    !createFetaruteWebMcpTools().some((tool) => tool.name === "find-fetarute-articles"),
    "没有目录时不应出现文章检索工具",
  );
  assert.deepEqual(
    createFetaruteWebMcpTools(articleCatalogue).map((tool) => tool.name),
    [
      "get-fetarute-overview",
      "find-fetarute-resource",
      "find-fetarute-page",
      "get-fetarute-service-status",
      "find-fetarute-articles",
    ],
  );

  const articleTool = getArticleTool();
  assert.equal(articleTool.annotations.readOnlyHint, true);
  // 标题与摘要来自通过 schema 校验的站点内容，不是访客投稿，因此仍是可信内容。
  assert.equal(articleTool.annotations.untrustedContentHint, false);
  assert.equal(articleTool.annotations.consequentialHint, false);
});

test("文章检索按读者语言返回实际 URL，并如实报告缺失的翻译", () => {
  assert.deepEqual(executeArticleTool({ locale: "en" }), {
    ok: true,
    locale: "en",
    total: 1,
    articles: [articleCatalogue[1]],
    // 只有简体中文的指南不会被塞进英文结果，但也不能让代理以为这篇内容不存在。
    missingTranslations: [
      {
        collection: "guides",
        translationKey: "railway-signals",
        availableLocales: ["zh-Hans"],
      },
    ],
    missingTranslationsTotal: 1,
  });
  assert.deepEqual(executeArticleTool({ locale: "zh-Hans" }), {
    ok: true,
    locale: "zh-Hans",
    total: 3,
    articles: [articleCatalogue[0], articleCatalogue[2], articleCatalogue[3]],
    missingTranslations: [],
    missingTranslationsTotal: 0,
  });
});

test("文章检索支持集合、关键词与数量收窄，不返回正文", () => {
  const guidesOnly = executeArticleTool({ locale: "zh-Hans", collection: "guides" });
  assert.deepEqual(guidesOnly, {
    ok: true,
    locale: "zh-Hans",
    total: 2,
    articles: [articleCatalogue[0], articleCatalogue[2]],
    missingTranslations: [],
    missingTranslationsTotal: 0,
  });

  assert.deepEqual(executeArticleTool({ locale: "zh-Hans", query: "加入" }), {
    ok: true,
    locale: "zh-Hans",
    total: 1,
    articles: [articleCatalogue[0]],
    missingTranslations: [],
    missingTranslationsTotal: 0,
  });
  // 摘要命中同样算匹配，代理不必猜准标题用词。
  assert.equal(
    (executeArticleTool({ locale: "zh-Hans", query: "闭塞" }) as { total: number }).total,
    1,
  );
  // 大小写不影响英文关键词匹配。
  assert.equal(
    (executeArticleTool({ locale: "en", query: "APPLY" }) as { total: number }).total,
    1,
  );

  const limited = executeArticleTool({ locale: "zh-Hans", limit: 1 }) as {
    total: number;
    articles: WebMcpArticle[];
  };
  assert.equal(limited.total, 3, "total 应报告匹配总数，而不是被截断后的条数");
  assert.equal(limited.articles.length, 1);

  assert.doesNotMatch(JSON.stringify(guidesOnly), /body|content|rendered/i);
});

test("文章检索拒绝越界与多余参数，而不是回退到默认值", () => {
  const invalid = {
    ok: false,
    error:
      "Invalid article query. Provide locale as one of: zh-Hans, zh-Hant, en. Optional collection must be one of: guides, news. Optional query must be text, and optional limit must be an integer between 1 and 20.",
  };

  assert.deepEqual(executeArticleTool({}), invalid);
  assert.deepEqual(executeArticleTool({ locale: "ja" }), invalid);
  assert.deepEqual(executeArticleTool({ locale: "en", collection: "players" }), invalid);
  assert.deepEqual(executeArticleTool({ locale: "en", limit: 0 }), invalid);
  assert.deepEqual(executeArticleTool({ locale: "en", limit: 21 }), invalid);
  assert.deepEqual(executeArticleTool({ locale: "en", limit: 1.5 }), invalid);
  assert.deepEqual(
    executeArticleTool({ locale: "en", visitorEmail: "agent@example.test" }),
    invalid,
  );
});

test("内嵌目录被裁剪或指向站外时按条丢弃，注册层仍保留其余工具", async () => {
  assert.deepEqual(parseWebMcpArticleCatalogue("not-an-array"), []);
  assert.deepEqual(
    parseWebMcpArticleCatalogue([
      { ...articleCatalogue[0], url: "https://untrusted.example/zh-Hans/guides/join/" },
      { ...articleCatalogue[0], locale: "ja" },
      { ...articleCatalogue[0], collection: "players" },
      { collection: "guides", translationKey: "join" },
      articleCatalogue[0],
    ]),
    [articleCatalogue[0]],
  );

  const registeredTools: WebMcpTool[] = [];
  const brokenCatalogueDocument: WebMcpDocument = {
    getElementById: (elementId) =>
      elementId === webMcpArticleCatalogueElementId ? { textContent: "{ truncated" } : null,
    modelContext: {
      registerTool(tool) {
        registeredTools.push(tool);
        return Promise.resolve();
      },
    },
  };

  assert.equal(await setupFetaruteWebMcp(brokenCatalogueDocument), true);
  assert.deepEqual(
    registeredTools.map((tool) => tool.name),
    [
      "get-fetarute-overview",
      "find-fetarute-resource",
      "find-fetarute-page",
      "get-fetarute-service-status",
    ],
  );
});

/** 与状态服务实际返回结构一致的快照替身；玩家字段刻意保留，用来验证工具不会把它透传出去。 */
function statusSnapshot(overrides: Partial<MinecraftSnapshot> = {}): MinecraftSnapshot {
  return {
    schemaVersion: 1,
    status: "online",
    checkedAt: "2026-09-10T16:49:11.793Z",
    server: { online: true, players: { online: 3, max: 50, names: ["Alex"] } },
    subservers: {
      creative: { health: "healthy" },
      lobby: { health: "unhealthy" },
      survival: { health: "healthy" },
    },
    ...overrides,
  } as MinecraftSnapshot;
}

function executeStatusTool(reader: WebMcpStatusReader) {
  const tool = createFetaruteWebMcpTools([], reader).find(
    (candidate) => candidate.name === "get-fetarute-service-status",
  );

  assert.ok(tool);
  return tool.execute({}, { signal: new AbortController().signal });
}

test("实时状态返回采样时间与各世界健康度，但不返回玩家数据", async () => {
  const result = await executeStatusTool(() => Promise.resolve(statusSnapshot()));

  assert.deepEqual(result, {
    ok: true,
    availability: "online",
    checkedAt: "2026-09-10T16:49:11.793Z",
    ageSeconds: (result as { ageSeconds: number }).ageSeconds,
    freshness: (result as { freshness: string }).freshness,
    worlds: { creative: "healthy", lobby: "unhealthy", survival: "healthy" },
    dashboard: "https://status.fetarute.info/",
    note: (result as { note: string }).note,
  });
  // 入口在线不代表每个子服务器都健康，两者必须分别呈现。
  assert.equal((result as { worlds: Record<string, string> }).worlds.lobby, "unhealthy");
  assert.doesNotMatch(JSON.stringify(result), /Alex|players|"online":3|max/);
});

test("实时状态区分新鲜与过期采样，而不是把旧快照当作此刻的事实", async () => {
  const fresh = (await executeStatusTool(() =>
    Promise.resolve(statusSnapshot({ checkedAt: new Date().toISOString() })),
  )) as { freshness: string; ageSeconds: number };
  const stale = (await executeStatusTool(() =>
    Promise.resolve(
      statusSnapshot({ checkedAt: new Date(Date.now() - 30 * 60_000).toISOString() }),
    ),
  )) as { freshness: string; ageSeconds: number };

  assert.equal(fresh.freshness, "fresh");
  assert.ok(fresh.ageSeconds < 60);
  assert.equal(stale.freshness, "stale");
  assert.ok(stale.ageSeconds >= 1800);
});

test("实时状态把读取失败讲成未知，绝不讲成离线或零人", async () => {
  const unknown = {
    ok: true,
    availability: "unknown",
    checkedAt: null,
    ageSeconds: null,
    freshness: "unknown",
    worlds: { creative: "unknown", lobby: "unknown", survival: "unknown" },
    dashboard: "https://status.fetarute.info/",
    note: "unknown means this website could not read the status service; it does not mean the server is offline. This tool never returns player counts, player names, server addresses, or version details.",
  };

  // 网络失败、超时与不合法快照都只能得出未知；任何一条都不足以断言服务器已离线。
  assert.deepEqual(
    await executeStatusTool(() => Promise.reject(new Error("Status request failed"))),
    unknown,
  );
  assert.deepEqual(
    await executeStatusTool(() => Promise.reject(new DOMException("Aborted", "TimeoutError"))),
    unknown,
  );
  assert.deepEqual(
    await executeStatusTool(() =>
      Promise.resolve(statusSnapshot({ subservers: {} as MinecraftSnapshot["subservers"] })),
    ),
    unknown,
  );

  // 真正离线仍如实报告为 offline，未知不会把它掩盖掉。
  const offline = (await executeStatusTool(() =>
    Promise.resolve(
      statusSnapshot({ status: "offline", server: { online: false, players: null } }),
    ),
  )) as { availability: string };
  assert.equal(offline.availability, "offline");
});

test("实时状态拒绝多余入参，并把代理的取消信号传给取数实现", async () => {
  // 浏览器提供取消信号时必须一路传到取数实现；Chrome 152 不提供，此时 signal 为 undefined。
  const statusTool = createFetaruteWebMcpTools([], (signal) =>
    signal?.aborted
      ? Promise.reject(new Error("aborted before request"))
      : Promise.resolve(statusSnapshot()),
  ).find((candidate) => candidate.name === "get-fetarute-service-status");
  assert.ok(statusTool);

  assert.deepEqual(
    await statusTool.execute({ world: "lobby" }, { signal: new AbortController().signal }),
    { ok: false, error: "This tool does not accept input." },
  );

  const controller = new AbortController();
  controller.abort();
  assert.equal(
    ((await statusTool.execute({}, { signal: controller.signal })) as { availability: string })
      .availability,
    "unknown",
  );
});

test("浏览器只传入参时每个工具仍返回结果，不依赖草案里的执行上下文", async () => {
  // Chrome 152 调用 execute 时只传第一个参数；读取 options.signal 会抛错并把结果退化成失败分支。
  for (const tool of createFetaruteWebMcpTools(articleCatalogue, () =>
    Promise.resolve(statusSnapshot()),
  )) {
    const input: Record<string, unknown> =
      {
        "find-fetarute-resource": { resource: "wiki" },
        "find-fetarute-page": { page: "info", locale: "zh-Hans" },
        "find-fetarute-articles": { locale: "zh-Hans" },
      }[tool.name] ?? {};

    assert.equal(
      ((await tool.execute(input)) as { ok: boolean }).ok,
      true,
      `${tool.name} 在缺少执行上下文时应返回正常结果`,
    );
  }
});

test("目录里的站外 URL 即使与官网同前缀也必须被丢弃", () => {
  // 前缀匹配会放过 fetarute.org.<attacker> 这类域名，因此校验必须按 origin 比较。
  for (const url of [
    "https://fetarute.org.attacker.example/zh-Hans/guides/join/",
    "https://fetarute.orgx/zh-Hans/guides/join/",
    "http://fetarute.org/zh-Hans/guides/join/",
    "not-a-url",
  ]) {
    assert.deepEqual(parseWebMcpArticleCatalogue([{ ...articleCatalogue[0], url }]), []);
  }

  assert.deepEqual(parseWebMcpArticleCatalogue([articleCatalogue[0]]), [articleCatalogue[0]]);
});

test("缺失翻译清单同样受 limit 约束，并单独报告总数", () => {
  /** 多篇只有简体中文的指南，用来验证 limit 在缺失翻译这条路径上同样生效。 */
  const manyUntranslated: readonly WebMcpArticle[] = [
    ...articleCatalogue,
    ...["signals-b", "signals-c", "signals-d"].map((translationKey) => ({
      collection: "guides" as const,
      translationKey,
      locale: "zh-Hans" as const,
      title: `指南 ${translationKey}`,
      description: "仅简体中文。",
      url: `https://fetarute.org/zh-Hans/guides/${translationKey}/`,
      availableLocales: ["zh-Hans"] as const,
    })),
  ];

  const tool = createFetaruteWebMcpTools(manyUntranslated).find(
    (candidate) => candidate.name === "find-fetarute-articles",
  );
  assert.ok(tool);

  const limited = tool.execute({ locale: "en", limit: 1 }) as {
    articles: WebMcpArticle[];
    missingTranslations: unknown[];
    missingTranslationsTotal: number;
  };

  assert.equal(limited.articles.length, 1);
  assert.equal(limited.missingTranslations.length, 1, "limit 必须同时约束缺失翻译清单");
  assert.equal(limited.missingTranslationsTotal, 4, "总数仍需如实报告未列出的部分");
});
