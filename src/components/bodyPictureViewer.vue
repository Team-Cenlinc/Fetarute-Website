<template>
  <div class="picture-carousel" id="pan-header-picture">
    <v-carousel hide-delimiters cycle interval=6000 :show-arrows="false" height="800">
      <v-carousel-item
          v-for="(item,i) in panHeaderImages"
          :key="i"
          :src="item.src"
      >
      </v-carousel-item>
    </v-carousel>
  </div>
</template>

<script>

export default {
  name: "bodyPictureViewer",
  data() {
    return {
      panHeaderImages: this.importAllImages()
    };
  },
  methods: {
    importAllImages() {
      const images = [];
      const context = require.context(
          "../assets/pictures/pan-header", // 图片文件夹路径（相对当前文件）
          false, // 是否包括子文件夹
          /\.(png|jpe?g|webp)$/i // 匹配的文件类型
      );

      context.keys().forEach((key) => {
        images.push({ src: context(key) });
      });

      return images;
    }
  }
};
</script>

<style scoped>
div.picture-carousel{
  z-index: -1;
  background-color: var(--body-content-bg);
  filter: var(--body-picture-viewer-filter-parameter);
}

</style>