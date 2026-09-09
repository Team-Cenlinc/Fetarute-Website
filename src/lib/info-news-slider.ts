/** 公告滑轨的元素集合；每个页面实例独立维护自己的可见进度与按钮状态。 */
interface NewsSliderElements {
  viewport: HTMLElement;
  previous: HTMLButtonElement;
  next: HTMLButtonElement;
  scrollbar: HTMLElement;
}

/** 读取容器尚可横向移动的最大距离，集中处理小数像素造成的边界误差。 */
function getMaxScrollLeft(viewport: HTMLElement) {
  return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
}

/**
 * 初始化公告横向滑轨。
 * 原生滚动与 scroll-snap 始终可用；脚本只补充按钮、可拖动进度轨与键盘翻页。
 */
export function initInfoNewsSlider(root: HTMLElement) {
  const viewport = root.querySelector<HTMLElement>("[data-news-slider-viewport]");
  const previous = root.querySelector<HTMLButtonElement>("[data-news-slider-previous]");
  const next = root.querySelector<HTMLButtonElement>("[data-news-slider-next]");
  const scrollbar = root.querySelector<HTMLElement>("[data-news-slider-scrollbar]");
  if (!viewport || !previous || !next || !scrollbar) return;

  const elements: NewsSliderElements = { viewport, previous, next, scrollbar };

  /** 将原生滚动位置映射到进度轨，并只在确有溢出时显示增强控件。 */
  function syncControls() {
    const maxScrollLeft = getMaxScrollLeft(elements.viewport);
    const isScrollable = maxScrollLeft > 1;
    const progress = isScrollable ? elements.viewport.scrollLeft / maxScrollLeft : 0;
    const thumbWidth = isScrollable
      ? Math.max(18, (elements.viewport.clientWidth / elements.viewport.scrollWidth) * 100)
      : 100;

    root.dataset.newsSliderEnhanced = "true";
    elements.previous.disabled = !isScrollable || elements.viewport.scrollLeft <= 1;
    elements.next.disabled = !isScrollable || elements.viewport.scrollLeft >= maxScrollLeft - 1;
    elements.scrollbar.hidden = !isScrollable;
    elements.scrollbar.style.setProperty("--info-news-slider-thumb-width", `${thumbWidth}%`);
    elements.scrollbar.style.setProperty(
      "--info-news-slider-thumb-offset",
      `${progress * (100 - thumbWidth)}%`,
    );
  }

  /** 以一张公告卡的可见宽度为步长，让鼠标、触摸和键盘共享同一种换页尺度。 */
  function scrollBySlide(direction: -1 | 1) {
    const firstSlide = elements.viewport.querySelector<HTMLElement>(".info-news-slider__item");
    const step = firstSlide ? firstSlide.offsetWidth : elements.viewport.clientWidth;
    elements.viewport.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  elements.previous.addEventListener("click", () => scrollBySlide(-1));
  elements.next.addEventListener("click", () => scrollBySlide(1));
  elements.viewport.addEventListener("scroll", syncControls, { passive: true });
  elements.viewport.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    scrollBySlide(event.key === "ArrowLeft" ? -1 : 1);
  });

  /** 进度轨点击或拖动都会直接对应到原生 scrollLeft，避免维护第二份活动 slide 状态。 */
  function moveToPointerPosition(event: PointerEvent) {
    const bounds = elements.scrollbar.getBoundingClientRect();
    const maxScrollLeft = getMaxScrollLeft(elements.viewport);
    if (bounds.width === 0 || maxScrollLeft === 0) return;
    const progress = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    elements.viewport.scrollLeft = progress * maxScrollLeft;
  }

  elements.scrollbar.addEventListener("pointerdown", (event) => {
    elements.scrollbar.setPointerCapture(event.pointerId);
    moveToPointerPosition(event);
  });
  elements.scrollbar.addEventListener("pointermove", (event) => {
    if (elements.scrollbar.hasPointerCapture(event.pointerId)) moveToPointerPosition(event);
  });

  const observer = new ResizeObserver(syncControls);
  observer.observe(elements.viewport);
  syncControls();
}
