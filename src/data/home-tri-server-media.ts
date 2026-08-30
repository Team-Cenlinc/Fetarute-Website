import type { ImageMetadata } from "astro";

/** 三服汇中可独立维护图片目录、文案与地图入口的三个服务器身份。 */
export type HomeTriServerId = "creative" | "lobby" | "survival";

/** Vite eager glob 为单张 Astro 图片生成的模块形状。 */
export interface HomeTriServerImageModule {
  /** Astro 在构建阶段读取到的图片尺寸、格式与生成地址。 */
  default: ImageMetadata;
}

/** 组件渲染 Carousel 时使用的一张服务器图片。 */
export interface HomeTriServerImage {
  /** 不含目录的文件名；仅作为构建产物中的稳定身份。 */
  filename: string;
  /** 从稳定文件名生成的可读场景名；完整署名后续由 credit 页面集中承接。 */
  sceneLabel: string;
  /** 交给 Astro Image 管线生成响应式图片的源元数据。 */
  source: ImageMetadata;
}

/** Carousel 在提交翻页前所需的最小图片解码能力，便于浏览器实现与确定性测试共享合同。 */
export interface HomeTriServerDecodableImage {
  /** 浏览器是否已经结束当前图片请求。 */
  complete: boolean;
  /** 大于零表示图片已有可展示的固有尺寸。 */
  naturalWidth: number;
  /** 延迟图片在用户明确请求后会提升为 eager。 */
  loading: string;
  /** 等待当前候选格式完成解码，避免 Carousel 先切到空白帧。 */
  decode(): Promise<void>;
}

/** 三个服务器图片目录经过归类后的稳定结果。 */
export type HomeTriServerImageSets = Readonly<
  Record<HomeTriServerId, readonly HomeTriServerImage[]>
>;

/** 允许图片归类器识别的固定子目录；未知目录会被忽略，避免素材误入错误服务器。 */
const homeTriServerIds: readonly HomeTriServerId[] = ["creative", "lobby", "survival"];

/** 场景文件名中的常用缩写映射，避免自动标题把交通设施缩写显示成普通单词。 */
const homeTriServerSceneTokenLabel: Readonly<Record<string, string>> = {
  br: "Bridge",
  rd: "Road",
  spg: "SPG",
};

/** 将图片文件名转成可读场景名，作为 Carousel 替代文本中的稳定地点线索。 */
export function getHomeTriServerSceneLabel(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .split(/[-_]+/)
    .filter(Boolean)
    .map(
      (token) =>
        homeTriServerSceneTokenLabel[token.toLowerCase()] ??
        `${token.charAt(0).toUpperCase()}${token.slice(1)}`,
    )
    .join(" ");
}

/**
 * 将 Vite 从三服图片目录读取到的模块归类并排序。
 * 调用方只需维护 creative、lobby、survival 子目录；文件名前缀决定同一服务器内的展示顺序。
 */
export function buildHomeTriServerImageSets(
  imageModules: Readonly<Record<string, HomeTriServerImageModule>>,
): HomeTriServerImageSets {
  const mutableImageSets: Record<HomeTriServerId, HomeTriServerImage[]> = {
    creative: [],
    lobby: [],
    survival: [],
  };

  for (const [path, imageModule] of Object.entries(imageModules)) {
    const serverId = homeTriServerIds.find((candidate) => path.includes(`/${candidate}/`));

    if (!serverId) {
      continue;
    }

    const filename = path.split("/").at(-1) ?? path;

    mutableImageSets[serverId].push({
      filename,
      sceneLabel: getHomeTriServerSceneLabel(filename),
      source: imageModule.default,
    });
  }

  for (const serverId of homeTriServerIds) {
    mutableImageSets[serverId].sort((left, right) =>
      left.filename.localeCompare(right.filename, "en"),
    );
  }

  return mutableImageSets;
}

/**
 * 返回一份 Fisher-Yates 随机副本，让每次访问都能从不同场景开始，同时不改写构建期共享数组。
 * random 参数只用于确定性测试；浏览器调用时沿用 Math.random。
 */
export function shuffleHomeTriServerItems<T>(
  items: readonly T[],
  random: () => number = Math.random,
): T[] {
  const shuffledItems = [...items];

  for (let currentIndex = shuffledItems.length - 1; currentIndex > 0; currentIndex -= 1) {
    const randomIndex = Math.floor(random() * (currentIndex + 1));
    [shuffledItems[currentIndex], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex] as T,
      shuffledItems[currentIndex] as T,
    ];
  }

  return shuffledItems;
}

/**
 * 等待 Carousel 目标图片具备可绘制像素；失败时返回 false，让调用方保留当前图片。
 * 已经完成的图片不会重复 decode，延迟图片则只在用户请求翻页时提升优先级。
 */
export async function prepareHomeTriServerImage(
  image: HomeTriServerDecodableImage,
): Promise<boolean> {
  if (image.complete) {
    return image.naturalWidth > 0;
  }

  image.loading = "eager";

  try {
    await image.decode();
    return image.naturalWidth > 0;
  } catch {
    return false;
  }
}
