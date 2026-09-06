/** 延迟章节完成初始化后交给首页统一释放的回收函数。 */
type HomeSectionCleanup = () => void;

/**
 * 每个低于首屏的首页章节与其独立 chunk 的映射。
 * selector 保持在静态 HTML 上，使基础内容在 JavaScript 未下载时仍可阅读。
 */
interface HomeLazySectionRegistration {
  selector: string;
  load: () => Promise<HomeSectionCleanup>;
}

const homeLazySectionRegistrations: readonly HomeLazySectionRegistration[] = [
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
    selector: "[data-home-onward-content]",
    load: async () => (await import("./onward-controller")).setupHomeOnward(),
  },
];

let disposeLazyHomeSections: (() => void) | undefined;

/**
 * 用一个 observer 为所有低于首屏的交互下载对应 chunk。
 * 导入在清理后才完成时会立即释放，避免页面导航后留下观察器、监听器或计时器。
 */
export function setupLazyHomeSections(): () => void {
  if (disposeLazyHomeSections) return disposeLazyHomeSections;

  const eventController = new AbortController();
  const cleanups = new Set<HomeSectionCleanup>();
  const registrationByElement = new Map<Element, HomeLazySectionRegistration>();
  const pendingElements = new WeakSet<Element>();
  const failedElements = new WeakSet<Element>();
  let disposed = false;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          // 下载失败的章节必须先离开预加载区，下一次进入才重试，避免离线时原地反复请求 chunk。
          failedElements.delete(entry.target);
          continue;
        }
        if (pendingElements.has(entry.target) || failedElements.has(entry.target)) continue;

        const registration = registrationByElement.get(entry.target);
        if (!registration) continue;

        pendingElements.add(entry.target);
        void registration
          .load()
          .then((cleanup) => {
            pendingElements.delete(entry.target);
            observer.unobserve(entry.target);
            if (disposed) {
              cleanup();
            } else {
              cleanups.add(cleanup);
            }
          })
          .catch(() => {
            // chunk 下载失败时静态内容仍可阅读；离开预加载区后再次进入才会重试。
            pendingElements.delete(entry.target);
            failedElements.add(entry.target);
          });
      }
    },
    { rootMargin: "100% 0px" },
  );

  for (const registration of homeLazySectionRegistrations) {
    const element = document.querySelector(registration.selector);
    if (!element) continue;
    registrationByElement.set(element, registration);
    observer.observe(element);
  }

  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    eventController.abort();
    observer.disconnect();
    cleanups.forEach((cleanup) => cleanup());
    cleanups.clear();
    disposeLazyHomeSections = undefined;
  };

  window.addEventListener(
    "pagehide",
    (event) => {
      if (!event.persisted) dispose();
    },
    { signal: eventController.signal },
  );

  disposeLazyHomeSections = dispose;
  return dispose;
}
