/** 同步两页共用的当前站名、线路色与路线图选中态；未知章节不改变已显示的站牌。 */
export function selectTrainJourneySection(picker: HTMLElement, sectionId: string): boolean {
  const links = [...picker.querySelectorAll<HTMLElement>("[data-home-journey-target]")];
  const selected = links.find((link) => link.dataset.homeJourneySectionId === sectionId);
  if (!selected) return false;
  const color = selected.closest<HTMLElement>("[data-home-journey-stop]")?.dataset
    .homeJourneyLineColor;
  if (color) picker.style.setProperty("--home-journey-current-line-color", color);
  for (const link of links) {
    const current = link === selected;
    if (current) link.setAttribute("aria-current", "step");
    else link.removeAttribute("aria-current");
    link
      .closest("[data-home-journey-stop]")
      ?.classList.toggle("home-journey-quick-pick__stop--current", current);
  }
  const name = picker.querySelector<HTMLElement>("[data-home-journey-current-name]");
  if (name) name.textContent = selected.dataset.homeJourneySectionName ?? "";
  return true;
}

/** 页面提供章节选择和浮层关闭；站牌确认反馈、焦点、滚动与历史路径由两页共用。 */
export interface TrainJourneyNavigationOptions {
  picker: HTMLElement;
  selectSection: (id: string) => void;
  beforeNavigate: () => void;
  close: () => void;
  getHash?: (id: string) => string;
  signal?: AbortSignal;
}

/** 先显示 260ms 站牌选中反馈再跳站；减少动态时立即完成，卸载后不执行迟到的跳转。 */
export function bindTrainJourneyNavigation(options: TrainJourneyNavigationOptions) {
  const lifecycle = new AbortController();
  const { signal } = lifecycle;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer = 0;
  options.picker.addEventListener(
    "click",
    (event) => {
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-home-journey-target]")
          : null;
      if (!link || !options.picker.contains(link)) return;
      const sectionId = link.dataset.homeJourneySectionId;
      const targetId = link.dataset.homeJourneyTargetId;
      const target = targetId ? document.getElementById(targetId) : null;
      if (!sectionId || !target) return;
      event.preventDefault();
      window.clearTimeout(timer);
      options.beforeNavigate();
      options.selectSection(sectionId);
      timer = window.setTimeout(
        () => {
          timer = 0;
          if (signal.aborted || !options.picker.isConnected) return;
          options.close();
          target.focus({ preventScroll: true });
          target.scrollIntoView({
            behavior: reducedMotion.matches ? "auto" : "smooth",
            block: "start",
          });
          history.pushState(history.state, "", options.getHash?.(sectionId) ?? `#${targetId}`);
        },
        reducedMotion.matches ? 0 : 260,
      );
    },
    { signal },
  );
  /** BFCache 离开也取消延迟导航，但只在真正卸载时移除事件监听。 */
  function dispose() {
    window.clearTimeout(timer);
    lifecycle.abort();
  }
  window.addEventListener(
    "pagehide",
    (event) => {
      window.clearTimeout(timer);
      if (!event.persisted) dispose();
    },
    { signal },
  );
  options.signal?.addEventListener("abort", dispose, { once: true, signal });
  return dispose;
}
