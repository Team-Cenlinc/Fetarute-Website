// @ts-nocheck -- serialized Astro image output is intentionally runtime data.

let cleanup: (() => void) | undefined;

export function setupHomeHero(landingSceneImages: readonly unknown[]) {
  if (cleanup) return cleanup;
  const sceneElement = document.querySelector("[data-landing-scene-id]");
  const heroSection = sceneElement?.closest(".hero-section");
  const heroTitle = heroSection?.querySelector("#hero-title");
  /** 同一标签页只记录上一张 Landing 实景，既保留随机性，又避免连续刷新恰好重复时误以为没有生效。 */
  const landingSceneSessionKey = "fetarute.home.landing-scene-id";

  if (
    !(sceneElement instanceof HTMLElement) ||
    !(heroSection instanceof HTMLElement) ||
    !(heroTitle instanceof HTMLElement)
  ) {
    return;
  }

  /** 使用密码学随机源避免刷新时固定落在同一张图；旧浏览器安全回退至 Math.random。 */
  const getRandomIndex = (length) => {
    if (length <= 1) {
      return 0;
    }

    if (window.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return Math.floor((values[0] / 2 ** 32) * length);
    }

    return Math.floor(Math.random() * length);
  };

  const getPreviousSceneId = () => {
    try {
      return window.sessionStorage.getItem(landingSceneSessionKey);
    } catch {
      // 隐私模式或受限嵌入上下文不能访问 storage 时，退回普通随机即可。
      return null;
    }
  };
  const previousSceneId = getPreviousSceneId();
  const selectableScenes = landingSceneImages.filter((scene) => scene.id !== previousSceneId);
  const selectedScene = selectableScenes[getRandomIndex(selectableScenes.length)];

  if (!selectedScene) {
    return;
  }

  const selectedSource = document.createElement("source");
  selectedSource.type = "image/avif";

  const sceneImage = document.createElement("img");
  sceneImage.dataset.landingSceneImage = "";
  sceneImage.width = selectedScene.width;
  sceneImage.height = selectedScene.height;
  sceneImage.alt = selectedScene.alt;
  sceneImage.loading = "eager";
  sceneImage.fetchPriority = "high";
  sceneImage.decoding = "async";
  sceneImage.style.objectPosition = selectedScene.focalPoint;

  sceneElement.dataset.landingSceneId = selectedScene.id;
  sceneElement.replaceChildren(selectedSource, sceneImage);
  // 先把无地址节点挂入 picture，再登记 AVIF 与回退地址，避免游离 img 抢先发出 WebP 请求。
  selectedSource.srcset = selectedScene.avifSrcset;
  selectedSource.sizes = "100vw";
  sceneImage.src = selectedScene.webpSrc;
  sceneImage.srcset = selectedScene.webpSrcset;
  sceneImage.sizes = "100vw";
  heroSection.style.setProperty("--hero-copy-shadow-blur", selectedScene.copyShadow.blur);
  heroSection.style.setProperty("--hero-copy-shadow-opacity", selectedScene.copyShadow.opacity);

  try {
    window.sessionStorage.setItem(landingSceneSessionKey, selectedScene.id);
  } catch {
    // 读取失败时已经正常随机；写入失败只意味着下一次刷新可能再次抽到同一张。
  }

  /** 将 CSS object-position 的关键词或百分比统一为可参与 cover 裁切计算的 0-1 锚点。 */
  const getObjectPositionRatio = (value, startKeyword, endKeyword) => {
    if (value === startKeyword) {
      return 0;
    }

    if (value === endKeyword) {
      return 1;
    }

    if (value === "center") {
      return 0.5;
    }

    const percentage = Number.parseFloat(value);
    return Number.isFinite(percentage) ? Math.min(1, Math.max(0, percentage / 100)) : 0.5;
  };

  /** 将 RGB 像素转换为 HSL，供后续排除无色暗部并以圆形均值汇总色相。 */
  const getPixelHsl = (red, green, blue) => {
    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;
    const maximum = Math.max(r, g, b);
    const minimum = Math.min(r, g, b);
    const delta = maximum - minimum;
    const lightness = (maximum + minimum) / 2;

    if (delta === 0) {
      return { hue: 0, saturation: 0, lightness };
    }

    let hue =
      maximum === r
        ? ((g - b) / delta) % 6
        : maximum === g
          ? (b - r) / delta + 2
          : (r - g) / delta + 4;

    hue = (hue * 60 + 360) % 360;

    return {
      hue,
      saturation: delta / (1 - Math.abs(2 * lightness - 1)),
      lightness,
    };
  };

  /**
   * 从标题实际覆盖的可见图片区域取样。
   * 只保留有色相的中高亮像素，避开黑色遮罩和近白高光，再把加权色相收敛成适合反光层的一种颜色。
   */
  const getTitleReflectionColor = () => {
    if (sceneImage.naturalWidth === 0 || sceneImage.naturalHeight === 0) {
      return null;
    }

    const imageBox = sceneImage.getBoundingClientRect();
    const titleBox = heroTitle.getBoundingClientRect();

    if (
      imageBox.width === 0 ||
      imageBox.height === 0 ||
      titleBox.width === 0 ||
      titleBox.height === 0
    ) {
      return null;
    }

    const canvasScale = Math.min(192 / Math.max(imageBox.width, imageBox.height), 1);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(imageBox.width * canvasScale));
    canvas.height = Math.max(1, Math.round(imageBox.height * canvasScale));

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      return null;
    }

    const [horizontalPosition = "center", verticalPosition = "center"] =
      getComputedStyle(sceneImage).objectPosition.split(" ");
    const positionX = getObjectPositionRatio(horizontalPosition, "left", "right");
    const positionY = getObjectPositionRatio(verticalPosition, "top", "bottom");
    const coverScale = Math.max(
      imageBox.width / sceneImage.naturalWidth,
      imageBox.height / sceneImage.naturalHeight,
    );
    const renderedWidth = sceneImage.naturalWidth * coverScale;
    const renderedHeight = sceneImage.naturalHeight * coverScale;

    context.drawImage(
      sceneImage,
      (imageBox.width - renderedWidth) * positionX * canvasScale,
      (imageBox.height - renderedHeight) * positionY * canvasScale,
      renderedWidth * canvasScale,
      renderedHeight * canvasScale,
    );

    const sampleLeft = Math.max(0, Math.floor((titleBox.left - imageBox.left) * canvasScale));
    const sampleTop = Math.max(0, Math.floor((titleBox.top - imageBox.top) * canvasScale));
    const sampleRight = Math.min(
      canvas.width,
      Math.ceil((titleBox.right - imageBox.left) * canvasScale),
    );
    const sampleBottom = Math.min(
      canvas.height,
      Math.ceil((titleBox.bottom - imageBox.top) * canvasScale),
    );

    if (sampleRight <= sampleLeft || sampleBottom <= sampleTop) {
      return null;
    }

    const pixels = context.getImageData(
      sampleLeft,
      sampleTop,
      sampleRight - sampleLeft,
      sampleBottom - sampleTop,
    ).data;
    let hueX = 0;
    let hueY = 0;
    let saturationTotal = 0;
    let lightnessTotal = 0;
    let weightTotal = 0;

    for (let index = 0; index < pixels.length; index += 16) {
      const { hue, saturation, lightness } = getPixelHsl(
        pixels[index],
        pixels[index + 1],
        pixels[index + 2],
      );

      if (saturation < 0.14 || lightness < 0.12 || lightness > 0.92) {
        continue;
      }

      const weight = saturation * (0.35 + lightness * 0.65);
      const angle = (hue * Math.PI) / 180;
      hueX += Math.cos(angle) * weight;
      hueY += Math.sin(angle) * weight;
      saturationTotal += saturation * weight;
      lightnessTotal += lightness * weight;
      weightTotal += weight;
    }

    if (weightTotal === 0) {
      return null;
    }

    const hue = (Math.atan2(hueY, hueX) * 180) / Math.PI;
    const saturation = Math.min(0.6, Math.max(0.28, (saturationTotal / weightTotal) * 0.9));
    const lightness = Math.min(0.72, Math.max(0.5, lightnessTotal / weightTotal + 0.3));

    return `hsl(${(hue + 360) % 360}deg ${saturation * 100}% ${lightness * 100}%)`;
  };

  /** 图片解码后才替换首屏白色反光，避免把取色计算放进首帧渲染关键路径。 */
  const updateTitleReflectionColor = async () => {
    try {
      if (!sceneImage.complete) {
        await new Promise((resolve, reject) => {
          sceneImage.addEventListener("load", resolve, { once: true });
          sceneImage.addEventListener("error", reject, { once: true });
        });
      }

      await sceneImage.decode();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const reflectionColor = getTitleReflectionColor();

      if (reflectionColor) {
        heroSection.style.setProperty("--hero-copy-reflection-color", reflectionColor);
      }
    } catch {
      // CORS、图片解码或 Canvas 取样失败时维持 SSR 白色反光，不阻塞首屏可读性。
    }
  };

  /** 标题换行、设备旋转或字体完成加载后重取样，确保反光始终对应当前可见裁切，而非初次布局。 */
  let titleReflectionFrame = 0;
  const scheduleTitleReflectionColorUpdate = () => {
    window.cancelAnimationFrame(titleReflectionFrame);
    titleReflectionFrame = window.requestAnimationFrame(() => {
      void updateTitleReflectionColor();
    });
  };

  let titleReflectionResizeObserver;
  if ("ResizeObserver" in window) {
    titleReflectionResizeObserver = new ResizeObserver(scheduleTitleReflectionColorUpdate);
    titleReflectionResizeObserver.observe(heroSection);
    titleReflectionResizeObserver.observe(heroTitle);
  }

  if (document.fonts) {
    void document.fonts.ready.then(scheduleTitleReflectionColorUpdate).catch(() => {
      // 字体 API 不可用或加载失败时，图片 decode 后的首次取样仍是有效回退。
    });
  }

  window.addEventListener("pagehide", (event) => {
    window.cancelAnimationFrame(titleReflectionFrame);
    if (!event.persisted) {
      titleReflectionResizeObserver?.disconnect();
    }
  });

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      scheduleTitleReflectionColorUpdate();
    }
  });

  void updateTitleReflectionColor();

  cleanup = () => {
    cleanup = undefined;
  };
  return cleanup;
}
