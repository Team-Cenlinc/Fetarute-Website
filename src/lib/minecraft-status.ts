export const minecraftStatusUrl = "https://site-api.fetarute.info/v1/minecraft";
export const minecraftRefreshInterval = 5 * 60_000;
export const localMinecraftStatusPath = "/__minecraft-status";

export function getMinecraftStatusUrl(hostname: string): string {
  return ["localhost", "127.0.0.1", "[::1]"].includes(hostname)
    ? localMinecraftStatusPath
    : minecraftStatusUrl;
}

export const instanceIds = ["creative", "lobby", "survival"] as const;

export interface MinecraftSnapshot {
  schemaVersion: 1;
  status: "online" | "offline";
  checkedAt: string;
  server: {
    online: boolean;
    players: { online: number; max: number; names: string[] } | null;
  };
  subservers: Record<(typeof instanceIds)[number], { health: "healthy" | "unhealthy" }>;
}

/** Validate the fields the UI consumes before displaying a public snapshot. */
export function parseMinecraftSnapshot(value: unknown): MinecraftSnapshot {
  const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null && !Array.isArray(v);
  const isCount = (v: unknown) => typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    (value.status !== "online" && value.status !== "offline") ||
    typeof value.checkedAt !== "string" ||
    !Number.isFinite(Date.parse(value.checkedAt)) ||
    !isRecord(value.server) ||
    value.server.online !== (value.status === "online") ||
    !isRecord(value.subservers)
  )
    throw new Error("Invalid status snapshot");
  const players = value.server.players;
  if (value.status === "online") {
    if (
      !isRecord(players) ||
      !isCount(players.online) ||
      !isCount(players.max) ||
      !Array.isArray(players.names) ||
      !players.names.every((name) => typeof name === "string")
    ) {
      throw new Error("Invalid player snapshot");
    }
  } else if (players !== null) throw new Error("Invalid offline snapshot");
  for (const id of instanceIds) {
    const instance = value.subservers[id];
    if (!isRecord(instance) || (instance.health !== "healthy" && instance.health !== "unhealthy")) {
      throw new Error("Invalid instance health");
    }
  }
  return value as unknown as MinecraftSnapshot;
}
