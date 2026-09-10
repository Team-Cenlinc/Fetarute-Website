import assert from "node:assert/strict";
import { after, test } from "node:test";
import {
  createFetaruteWebMcpTools,
  parseWebMcpArticleCatalogue,
  webMcpArticleCatalogueElementId,
} from "../src/lib/webmcp.ts";

// 绝对路径的 Playwright 只暴露 CJS default，包名解析则给出命名导出；两种入口都要能启动同一套回归。
const playwrightModule = await import(process.env.FETARUTE_PLAYWRIGHT_MODULE ?? "playwright");
const { chromium } = playwrightModule.default ?? playwrightModule;

/**
 * Chrome 152 把 `chrome://flags/#enable-webmcp-testing` 映射到 `WebMCPTesting` feature。
 * 用命令行开启同一实现，回归就能在无人值守下拿到原生 `document.modelContext`，而不是注入替身。
 */
const webMcpFeatureArgs = ["--enable-features=WebMCPTesting"];
const baseUrl = process.env.FETARUTE_WEBMCP_TEST_URL ?? "http://127.0.0.1:4330";

/**
 * 用页面实际内嵌的目录重建本次应注册的工具契约。
 * 期望值因此与构建产物同源：文章目录为空的页面只应注册三个工具，有内容时才多出文章检索。
 */
async function readDeclaredTools(page) {
  const embedded = await page.evaluate(
    (elementId) => document.getElementById(elementId)?.textContent ?? null,
    webMcpArticleCatalogueElementId,
  );

  assert.ok(embedded, "构建产物应内嵌 WebMCP 文章目录");
  return createFetaruteWebMcpTools(parseWebMcpArticleCatalogue(JSON.parse(embedded)));
}

const nativeBrowser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: webMcpFeatureArgs,
});
// 不带 feature 的同版本 Chrome 用来验证真实的能力缺失路径，而不是靠删除全局对象模拟。
const plainBrowser = await chromium.launch({ channel: "chrome", headless: true });
after(() => Promise.all([nativeBrowser.close(), plainBrowser.close()]));

/** 打开一个记录页面异常的新标签页，使注册失败或脚本报错不会被断言静默吞掉。 */
async function openPage(browser, path) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${baseUrl}${path}`);
  return { page, errors };
}

/** 读取原生 `getTools()` 的可序列化摘要；RegisteredTool 持有 window 引用，不能整体跨进程传回。 */
function readNativeTools(page) {
  return page.evaluate(async () => {
    if (typeof document.modelContext !== "object" || document.modelContext === null) return null;
    return (await document.modelContext.getTools()).map((tool) => ({
      name: tool.name,
      title: tool.title,
      description: tool.description,
      // Chrome 以 JSON 字符串回传 inputSchema，与站点注册时提供的对象形式不同。
      inputSchema:
        typeof tool.inputSchema === "string" ? JSON.parse(tool.inputSchema) : tool.inputSchema,
      annotations: { ...tool.annotations },
    }));
  });
}

/**
 * 按 Chrome 实际要求调用工具：第一个参数必须是 `getTools()` 返回的 RegisteredTool，第二个参数是 JSON 字符串。
 * 返回值同样是 JSON 字符串，因此在这里解析，便于断言站点 execute 回调真正产出的对象。
 */
function executeNativeTool(page, name, input, { encodeInput = true } = {}) {
  return page.evaluate(
    async ([name, input, encodeInput]) => {
      const tool = (await document.modelContext.getTools()).find((tool) => tool.name === name);
      if (!tool) return { thrown: `missing tool: ${name}` };
      try {
        const raw = await document.modelContext.executeTool(
          tool,
          encodeInput ? JSON.stringify(input) : input,
        );
        return { raw };
      } catch (error) {
        return { thrown: String(error) };
      }
    },
    [name, input, encodeInput],
  );
}

/** 断言一次原生调用成功并返回站点约定的 JSON 结果。 */
async function executeNativeToolOk(page, name, input) {
  const result = await executeNativeTool(page, name, input);
  assert.equal(result.thrown, undefined, `${name} 不应在原生调用中抛出：${result.thrown}`);
  assert.equal(typeof result.raw, "string", `${name} 的原生返回值应为 JSON 字符串`);
  return JSON.parse(result.raw);
}

test("原生 Chrome 能发现站点注册的全部只读工具及其 schema", async () => {
  const { page, errors } = await openPage(nativeBrowser, "/zh-Hans/");
  const declaredTools = await readDeclaredTools(page);
  const tools = await readNativeTools(page);

  assert.ok(tools, "开启 WebMCPTesting 的 Chrome 应暴露 document.modelContext");
  assert.deepEqual(
    [...tools.map((tool) => tool.name)].sort(),
    [...declaredTools.map((tool) => tool.name)].sort(),
  );
  assert.ok(
    tools.some((tool) => tool.name === "find-fetarute-articles"),
    "已有公告与指南的站点应向原生实现暴露文章检索",
  );
  for (const declared of declaredTools) {
    const registered = tools.find((tool) => tool.name === declared.name);
    assert.ok(registered, `原生实现应保留 ${declared.name}`);
    assert.equal(registered.title, declared.title);
    assert.equal(registered.description, declared.description);
    assert.deepEqual(registered.inputSchema, declared.inputSchema);
    // Chrome 152 只回传它已实现的标注字段；站点声明的 consequentialHint 目前不会出现在发现结果中。
    assert.equal(registered.annotations.readOnlyHint, true);
    assert.equal(registered.annotations.untrustedContentHint, false);
  }
  assert.deepEqual(errors, []);
  await page.close();
});

test("原生调用返回官方事实，且不泄露占位服务器地址", async () => {
  const { page, errors } = await openPage(nativeBrowser, "/zh-Hans/");

  const overview = await executeNativeToolOk(page, "get-fetarute-overview", {});
  assert.equal(overview.ok, true);
  assert.equal(overview.website, "https://fetarute.org");
  assert.deepEqual(overview.languages, ["zh-Hans", "zh-Hant", "en"]);
  assert.match(overview.serverAccess, /application and review process/);
  assert.doesNotMatch(JSON.stringify(overview), /play\.fetarute\.example/);

  const resource = await executeNativeToolOk(page, "find-fetarute-resource", { resource: "wiki" });
  assert.equal(resource.ok, true);
  assert.equal(resource.resource.url, "https://wiki.fetarute.org");

  const info = await executeNativeToolOk(page, "find-fetarute-page", {
    page: "info",
    locale: "zh-Hans",
  });
  assert.equal(info.ok, true);
  assert.equal(info.url, "https://fetarute.org/zh-Hans/info/");

  assert.deepEqual(errors, []);
  await page.close();
});

test("原生调用的非法参数由站点回调拒绝，而调用侧编码错误由浏览器拒绝", async () => {
  const { page, errors } = await openPage(nativeBrowser, "/zh-Hans/");

  const unknownResource = await executeNativeToolOk(page, "find-fetarute-resource", {
    resource: "https://untrusted.example",
  });
  assert.equal(unknownResource.ok, false);
  assert.match(unknownResource.error, /^Invalid resource\. Choose one of: wiki,/);

  const extraField = await executeNativeToolOk(page, "find-fetarute-resource", {
    resource: "wiki",
    visitorEmail: "agent@example.test",
  });
  assert.equal(extraField.ok, false);

  const unknownPage = await executeNativeToolOk(page, "find-fetarute-page", {
    page: "join",
    locale: "en",
  });
  assert.equal(unknownPage.ok, false);

  // 直接传入对象是调用侧的编码错误：浏览器在进入站点回调前就失败，因此站点不应改成接收字符串。
  const objectInput = await executeNativeTool(
    page,
    "find-fetarute-resource",
    { resource: "wiki" },
    { encodeInput: false },
  );
  assert.match(String(objectInput.thrown), /Failed to parse input arguments/);

  assert.deepEqual(errors, []);
  await page.close();
});

test("原生调用文章检索能按读者语言找到加入指南，并拒绝未发布语言", async () => {
  const { page, errors } = await openPage(nativeBrowser, "/zh-Hans/");

  const guides = await executeNativeToolOk(page, "find-fetarute-articles", {
    locale: "zh-Hans",
    collection: "guides",
    query: "加入",
  });
  assert.equal(guides.ok, true);
  assert.deepEqual(
    guides.articles.map((article) => article.url),
    ["https://fetarute.org/zh-Hans/guides/join/"],
  );
  // 目录只提供标题、摘要与 URL；正文仍留给读者在页面上阅读。
  assert.equal(guides.articles[0].body, undefined);

  const english = await executeNativeToolOk(page, "find-fetarute-articles", { locale: "en" });
  assert.ok(english.articles.every((article) => article.locale === "en"));

  const unpublishedLocale = await executeNativeToolOk(page, "find-fetarute-articles", {
    locale: "ja",
  });
  assert.equal(unpublishedLocale.ok, false);

  assert.deepEqual(errors, []);
  await page.close();
});

test("原生调用实时状态经预览转发读到真实状态服务，且不返回玩家数据", async () => {
  const { page, errors } = await openPage(nativeBrowser, "/zh-Hans/info/");

  // 先确认页面自己能读到同源转发；能读到却仍返回 unknown，说明工具的取数路径坏了，而不是服务不可用。
  const proxyReachable = await page.evaluate(async () => {
    try {
      const response = await fetch("/__minecraft-status", { credentials: "omit" });
      return response.ok && typeof (await response.json()).checkedAt === "string";
    } catch {
      return false;
    }
  });

  const status = await executeNativeToolOk(page, "get-fetarute-service-status", {});

  assert.equal(status.ok, true);
  if (proxyReachable) {
    assert.notEqual(
      status.availability,
      "unknown",
      "预览转发可读时工具必须给出真实结论；unknown 说明取数路径本身失败",
    );
  }
  assert.ok(
    ["online", "offline", "unknown"].includes(status.availability),
    `availability 应为三种明确取值之一，实际为 ${status.availability}`,
  );
  assert.deepEqual(Object.keys(status.worlds).sort(), ["creative", "lobby", "survival"]);
  assert.equal(status.dashboard, "https://status.fetarute.info/");

  if (status.availability === "unknown") {
    // 状态服务不可读时仍必须给出「未知」而不是离线；此时不能声称已验证过在线分支。
    assert.equal(status.checkedAt, null);
    assert.equal(status.freshness, "unknown");
    assert.ok(Object.values(status.worlds).every((health) => health === "unknown"));
  } else {
    assert.ok(
      Number.isFinite(Date.parse(status.checkedAt)),
      "在线或离线结论必须带可解析的采样时间",
    );
    assert.ok(["fresh", "stale"].includes(status.freshness));
    assert.equal(typeof status.ageSeconds, "number");
  }

  // 无论走哪个分支，玩家人数与名单都不得出现在代理可见的结果里。
  assert.doesNotMatch(JSON.stringify(status), /"players"|"names"|"motd"|"version"/);

  assert.deepEqual(errors, []);
  await page.close();
});

test("Chrome 只向 execute 传入参时全部工具仍返回正常结果", async () => {
  const { page, errors } = await openPage(nativeBrowser, "/zh-Hans/");

  // Chrome 152 不提供草案里的执行上下文；任何依赖第二个参数的工具都会在这里退化成错误结果。
  const argumentCount = await page.evaluate(async () => {
    const probe = {
      name: "probe-execute-arity",
      title: "probe",
      description: "Reports how many arguments the browser passes to a tool callback.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: (...args) => ({ argumentCount: args.length }),
    };
    await document.modelContext.registerTool(probe, { signal: new AbortController().signal });
    const tools = await document.modelContext.getTools();
    const raw = await document.modelContext.executeTool(
      tools.find((tool) => tool.name === "probe-execute-arity"),
      "{}",
    );
    return JSON.parse(raw).argumentCount;
  });

  assert.equal(argumentCount, 1, "Chrome 152 只传入参；本回归的前提失效时应立即暴露");

  for (const [name, input] of [
    ["get-fetarute-overview", {}],
    ["find-fetarute-resource", { resource: "wiki" }],
    ["find-fetarute-page", { page: "info", locale: "zh-Hans" }],
    ["find-fetarute-articles", { locale: "zh-Hans" }],
    ["get-fetarute-service-status", {}],
  ]) {
    const result = await executeNativeToolOk(page, name, input);
    assert.equal(result.ok, true, `${name} 在只有入参时应返回正常结果`);
  }

  assert.deepEqual(errors, []);
  await page.close();
});

test("跨页面导航、重载与返回后工具只保留一份注册且仍可调用", async () => {
  const { page, errors } = await openPage(nativeBrowser, "/zh-Hans/");

  const expectedToolCount = (await readDeclaredTools(page)).length;

  for (const path of ["/zh-Hans/info/", "/zh-Hans/guides/join/", "/en/community/"]) {
    await page.goto(`${baseUrl}${path}`);
    const tools = await readNativeTools(page);
    assert.ok(tools, `${path} 应在导航后重新注册工具`);
    assert.equal(tools.length, expectedToolCount, `${path} 不应出现重复注册`);
  }

  await page.reload();
  assert.equal((await readNativeTools(page)).length, expectedToolCount);
  const afterReload = await executeNativeToolOk(page, "find-fetarute-page", {
    page: "community",
    locale: "en",
  });
  assert.equal(afterReload.url, "https://fetarute.org/en/community/");

  await page.goBack();
  const restored = await readNativeTools(page);
  assert.ok(restored, "返回上一页后仍应有可用的工具注册");
  assert.equal(restored.length, expectedToolCount, "返回缓存页面不应叠加第二份注册");
  const afterBack = await executeNativeToolOk(page, "get-fetarute-overview", {});
  assert.equal(afterBack.ok, true);

  assert.deepEqual(errors, []);
  await page.close();
});

test("未启用 WebMCP 的同版本 Chrome 静默回退，不影响静态页面", async () => {
  const { page, errors } = await openPage(plainBrowser, "/zh-Hans/info/");

  assert.equal(
    await page.evaluate(() => typeof document.modelContext),
    "undefined",
    "未开启 feature 的 Chrome 不应有 modelContext；否则本回归的对照组失效",
  );
  assert.equal(await page.locator("h1").count(), 1);
  assert.ok(await page.locator('a[href="/zh-Hans/guides/join/"]').first().isVisible());
  assert.deepEqual(errors, []);
  await page.close();
});
