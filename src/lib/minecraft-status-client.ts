import {
  instanceIds,
  getMinecraftStatusUrl,
  minecraftRefreshInterval,
  parseMinecraftSnapshot,
} from "./minecraft-status";

export function initMinecraftStatus(root: HTMLElement) {
  const copy = JSON.parse(root.dataset.copy!) as Record<string, string>;
  const get = (selector: string) => root.querySelector<HTMLElement>(selector)!;
  const feedback = get("[data-status-feedback]");
  const entry = get("[data-entry-state]");
  const count = get("[data-player-count]");
  const names = get("[data-player-names]");
  let pending = false;
  let nextRefreshAt = 0;
  let timer: ReturnType<typeof setTimeout>;
  const setState = (element: HTMLElement, state: string, label: string) => {
    element.dataset.state = state;
    element.textContent = label;
  };
  const refresh = async () => {
    if (pending || document.hidden) return;
    clearTimeout(timer);
    const remaining = nextRefreshAt - Date.now();
    if (remaining > 0) {
      timer = setTimeout(refresh, remaining);
      return;
    }
    pending = true;
    try {
      const response = await fetch(getMinecraftStatusUrl(window.location.hostname), {
        signal: AbortSignal.timeout(8000),
        credentials: "omit",
      });
      if (!response.ok) throw new Error("Status request failed");
      const snapshot = parseMinecraftSnapshot(await response.json());
      setState(entry, snapshot.status, copy[snapshot.status]);
      count.textContent = snapshot.server.players ? String(snapshot.server.players.online) : "—";
      names.textContent = snapshot.server.players
        ? snapshot.server.players.online === 0
          ? copy.noPlayers
          : snapshot.server.players.names.join(" · ") || copy.emptySample
        : copy.playersUnavailable;
      for (const id of instanceIds) {
        const health = snapshot.subservers[id].health;
        setState(get(`[data-instance-state="${id}"]`), health, copy[health]);
      }
      feedback.textContent = `${copy.checked}: ${new Intl.DateTimeFormat(root.dataset.locale, {
        dateStyle: "short",
        timeStyle: "medium",
      }).format(new Date(snapshot.checkedAt))}`;
    } catch {
      // A failed fetch must never turn into a claim that Minecraft is offline.
      setState(entry, "unknown", copy.unavailable);
      count.textContent = "—";
      names.textContent = copy.playersUnavailable;
      for (const id of instanceIds)
        setState(get(`[data-instance-state="${id}"]`), "unknown", copy.unavailable);
      feedback.textContent = copy.failed;
    } finally {
      pending = false;
      nextRefreshAt = Date.now() + minecraftRefreshInterval;
      if (!document.hidden) timer = setTimeout(refresh, minecraftRefreshInterval);
    }
  };
  feedback.textContent = copy.loading;
  document.addEventListener("visibilitychange", () => {
    clearTimeout(timer);
    if (!document.hidden) void refresh();
  });
  void refresh();
}
