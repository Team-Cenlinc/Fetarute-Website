/** Keep Info's reading position shareable without adding history entries on scroll. */
export function initInfoNavigation(root: HTMLElement) {
  const sections = [...root.querySelectorAll<HTMLElement>(".info-section[id]")];
  const links = [...root.querySelectorAll<HTMLAnchorElement>(".info-directory__link")];
  let settleTimer: ReturnType<typeof setTimeout>;
  let navigating = Boolean(window.location.hash);

  function sync() {
    const readingLine = window.innerHeight / 2;
    const active = sections.findLast(
      (section) => section.getBoundingClientRect().top <= readingLine,
    );
    for (const link of links) {
      if (link.hash === `#${active?.id}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
    // Native anchor navigation owns its fragment and history, including subserver links.
    if (navigating) {
      navigating = false;
      return;
    }
    const currentTarget = sections
      .flatMap((section) => [section, ...section.querySelectorAll<HTMLElement>("[id]")])
      .find((target) => `#${target.id}` === window.location.hash);
    const keepSpecificAnchor = active && currentTarget && active.contains(currentTarget);
    const nextHash = keepSpecificAnchor ? window.location.hash : active ? `#${active.id}` : "";
    if (nextHash !== window.location.hash) {
      history.replaceState(history.state, "", `${location.pathname}${location.search}${nextHash}`);
    }
  }

  // Wait for smooth scrolling to settle so intermediate sections cannot overwrite
  // a clicked destination, a deep link, or a restored history entry.
  function schedule() {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(sync, 180);
  }
  function anchorNavigation() {
    navigating = true;
    schedule();
  }
  // Once the user takes over scrolling, the settled viewport owns the fragment.
  function interruptNavigation() {
    if (!navigating) return;
    navigating = false;
    schedule();
  }
  const scrollKeys = new Set(["Home", "End", "PageUp", "PageDown", "ArrowUp", "ArrowDown", " "]);
  window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || !scrollKeys.has(event.key)) return;
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])")
    )
      return;
    interruptNavigation();
  });
  window.addEventListener("wheel", interruptNavigation, { passive: true });
  window.addEventListener("touchmove", interruptNavigation, { passive: true });
  window.addEventListener("pointerdown", interruptNavigation, { passive: true });
  root.addEventListener("click", (event) => {
    const link =
      event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const url = new URL(link.href);
    if (
      url.origin === location.origin &&
      url.pathname === location.pathname &&
      url.search === location.search &&
      url.hash
    )
      anchorNavigation();
  });
  window.addEventListener("hashchange", anchorNavigation);
  window.addEventListener("popstate", anchorNavigation);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("pageshow", anchorNavigation);
}
