const imageDragGuardSelector = "img:not([data-image-drag-allowed])";

declare global {
  interface Window {
    /** 全站图片拖拽保护是否已初始化，避免同一文档因脚本重复执行而叠加监听。 */
    __fetaruteImageDragGuardReady?: boolean;
  }
}

/**
 * 判断拖拽起点是否位于默认受保护的图片内。
 * `data-image-drag-allowed` 是少数素材确实需要原生拖拽时的显式逃生口。
 */
function isGuardedImageDragTarget(target: EventTarget | null): boolean {
  return (
    typeof Element !== "undefined" &&
    target instanceof Element &&
    target.closest(imageDragGuardSelector) !== null
  );
}

/**
 * 初始化全站图片拖拽保护。
 * 捕获阶段只取消图片的原生 dragstart，不改变图片链接点击、触摸滚动或页面其他拖拽语义。
 */
export function setupImageDragGuard(): void {
  if (typeof window === "undefined" || window.__fetaruteImageDragGuardReady) {
    return;
  }

  window.__fetaruteImageDragGuardReady = true;

  document.addEventListener(
    "dragstart",
    (event) => {
      if (isGuardedImageDragTarget(event.target)) {
        event.preventDefault();
      }
    },
    { capture: true },
  );
}
