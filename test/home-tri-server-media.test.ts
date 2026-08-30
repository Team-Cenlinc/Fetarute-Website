import assert from "node:assert/strict";
import test from "node:test";
import type { ImageMetadata } from "astro";
import {
  buildHomeTriServerImageSets,
  getHomeTriServerSceneLabel,
  prepareHomeTriServerImage,
  shuffleHomeTriServerItems,
} from "../src/data/home-tri-server-media.ts";

const stubImage = (src: string): ImageMetadata => ({
  src,
  width: 1600,
  height: 900,
  format: "webp",
});

test("三服图片按服务器目录归类，并按文件名稳定排序", () => {
  const imageSets = buildHomeTriServerImageSets({
    "../assets/pages/home/tri-server-joint/creative/02-city.webp": {
      default: stubImage("/creative-city.webp"),
    },
    "../assets/pages/home/tri-server-joint/survival/01-bridge.webp": {
      default: stubImage("/survival-bridge.webp"),
    },
    "../assets/pages/home/tri-server-joint/creative/01-station.webp": {
      default: stubImage("/creative-station.webp"),
    },
  });

  assert.deepEqual(
    imageSets.creative.map((image) => image.filename),
    ["01-station.webp", "02-city.webp"],
  );
  assert.deepEqual(
    imageSets.survival.map((image) => image.filename),
    ["01-bridge.webp"],
  );
  assert.deepEqual(imageSets.lobby, []);
});

test("三服图片在访问时生成随机副本，不改写构建期基序", () => {
  const stableImages = ["station", "town", "coast", "terminus"];
  const randomizedImages = shuffleHomeTriServerItems(stableImages, () => 0);

  assert.deepEqual(randomizedImages, ["town", "coast", "terminus", "station"]);
  assert.deepEqual(stableImages, ["station", "town", "coast", "terminus"]);
});

test("三服图片会把稳定文件名转成可读场景名", () => {
  assert.equal(getHomeTriServerSceneLabel("haixing-rd-br.jpg"), "Haixing Road Bridge");
  assert.equal(getHomeTriServerSceneLabel("spg-arena.png"), "SPG Arena");
});

test("Carousel 等待目标图片完成解码，并把延迟图片提升为 eager", async () => {
  let decodeStarted = false;
  const image = {
    complete: false,
    naturalWidth: 1600,
    loading: "lazy",
    async decode() {
      decodeStarted = true;
    },
  };

  assert.equal(await prepareHomeTriServerImage(image), true);
  assert.equal(decodeStarted, true);
  assert.equal(image.loading, "eager");
});

test("Carousel 不会把解码失败的目标图片当作可切换内容", async () => {
  const image = {
    complete: false,
    naturalWidth: 0,
    loading: "lazy",
    async decode() {
      throw new Error("decode failed");
    },
  };

  assert.equal(await prepareHomeTriServerImage(image), false);
});
