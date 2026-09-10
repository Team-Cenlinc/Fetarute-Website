import assert from "node:assert/strict";
import test from "node:test";
import {
  createFetaruteWebMcpTools,
  setupFetaruteWebMcp,
  type WebMcpDocument,
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
    ["get-fetarute-overview", "find-fetarute-resource", "find-fetarute-page"],
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
  assert.equal(registrationSignals.length, 3);
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
  assert.equal(registeredTools.length, 3);
});
