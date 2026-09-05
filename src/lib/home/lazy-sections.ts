type SectionRegistration = {
  selector: string;
  load: () => Promise<() => void>;
};

const registrations: SectionRegistration[] = [
  {
    selector: "[data-home-gallery]",
    load: async () => (await import("./gallery-controller")).setupHomeGallery(),
  },
  {
    selector: "[data-home-tri-server]",
    load: async () => (await import("./tri-server-controller")).setupHomeTriServer(),
  },
  {
    selector: "[data-home-community]",
    load: async () => (await import("./community-controller")).setupHomeCommunity(),
  },
  {
    selector: "[data-home-onward]",
    load: async () => (await import("./onward-controller")).setupHomeOnward(),
  },
];

let cleanup: (() => void) | undefined;

/**
 * A single observer owns all below-the-fold controller downloads. Keeping this
 * bootstrap deliberately small avoids loading section implementation code on
 * the initial route while still giving it a full viewport of lead time.
 */
export function setupLazyHomeSections() {
  if (cleanup) return cleanup;

  const cleanups = new Set<() => void>();
  const pending = new WeakSet<Element>();
  const registrationByElement = new Map<Element, SectionRegistration>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || pending.has(entry.target)) continue;

        const registration = registrationByElement.get(entry.target);
        if (!registration) continue;

        pending.add(entry.target);
        observer.unobserve(entry.target);
        void registration.load().then((dispose) => cleanups.add(dispose));
      }
    },
    { rootMargin: "100% 0px" },
  );

  for (const registration of registrations) {
    const element = document.querySelector(registration.selector);
    if (!element) continue;
    registrationByElement.set(element, registration);
    observer.observe(element);
  }

  const dispose = () => {
    observer.disconnect();
    cleanups.forEach((sectionCleanup) => sectionCleanup());
    cleanups.clear();
    window.removeEventListener("pagehide", onPageHide);
    cleanup = undefined;
  };
  const onPageHide = (event: PageTransitionEvent) => {
    if (!event.persisted) dispose();
  };

  window.addEventListener("pagehide", onPageHide);
  cleanup = dispose;
  return dispose;
}
