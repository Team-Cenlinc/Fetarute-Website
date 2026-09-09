import assert from "node:assert/strict";
import { test } from "node:test";
import { parseMinecraftSnapshot } from "../src/lib/minecraft-status.ts";

const snapshot = () => ({
  schemaVersion: 1,
  status: "online",
  checkedAt: "2026-09-09T17:13:26.693Z",
  server: { online: true, players: { online: 3, max: 50, names: ["Alex"] } },
  subservers: {
    creative: { health: "healthy" },
    lobby: { health: "unhealthy" },
    survival: { health: "healthy" },
  },
});

test("sample names need not account for every player; instance health is independent", () => {
  const result = parseMinecraftSnapshot(snapshot());
  assert.equal(result.server.players?.online, 3);
  assert.deepEqual(result.server.players?.names, ["Alex"]);
  assert.equal(result.subservers.lobby.health, "unhealthy");
});

test("an empty sample is valid even when players are online", () => {
  const value = snapshot();
  value.server.players.names = [];
  assert.deepEqual(parseMinecraftSnapshot(value).server.players?.names, []);
});

test("offline entry can coexist with healthy instances", () => {
  const result = parseMinecraftSnapshot({
    ...snapshot(),
    status: "offline",
    server: { online: false, players: null },
  });
  assert.equal(result.server.players, null);
  assert.equal(result.subservers.creative.health, "healthy");
});

test("reject malformed, contradictory and unsupported snapshots", () => {
  for (const value of [
    null,
    {},
    { ...snapshot(), schemaVersion: 2 },
    { ...snapshot(), checkedAt: "invalid" },
    { ...snapshot(), subservers: {} },
    { ...snapshot(), status: "offline" },
    { ...snapshot(), server: { online: true, players: null } },
    { ...snapshot(), server: { online: true, players: { online: -1, max: 50, names: [] } } },
    { ...snapshot(), server: { online: true, players: { online: 3, max: 50, names: [42] } } },
  ])
    assert.throws(() => parseMinecraftSnapshot(value));
});

test("reject coerced status and health enums instead of displaying invalid snapshots", () => {
  for (const status of [["online"], ["offline"], null, 0, {}, true]) {
    assert.throws(() =>
      parseMinecraftSnapshot({
        ...snapshot(),
        status,
        server: { online: false, players: null },
      }),
    );
  }
  for (const health of [["healthy"], ["unhealthy"], null, 0, {}, true]) {
    assert.throws(() =>
      parseMinecraftSnapshot({
        ...snapshot(),
        subservers: { ...snapshot().subservers, creative: { health } },
      }),
    );
  }
});
