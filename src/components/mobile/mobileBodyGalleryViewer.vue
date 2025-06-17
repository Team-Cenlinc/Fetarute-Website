<template>
  <div class="content-viewer">
    <div class="span-container-sec1">
      <h1 style="border-bottom: 1rem solid var(--body-span-line-chikai);" class="subtitle" id="gallery">{{ $t("bodyContent.gallery") }}</h1>
      <v-carousel cycle interval=6000 :show-arrows="false" hide-delimiters id="span-sec2-BL-carousel">
        <v-carousel-item
            v-for="(item,i) in contentImages"
            :key="i"
            :src="item.src"
        >
        </v-carousel-item>
      </v-carousel>
    </div>

  </div>
</template>

<script>
export default {
  name: "mobileBodyGalleryViewer",
  data() {
    return {
      contentImages: this.importAllImages()
    };
  },
  methods: {
    importAllImages() {
      const images = [];
      const context = require.context(
          "../../assets/pictures/pan-header", // 修改为当前相对路径
          false,                              // 不递归子文件夹
          /\.(png|jpe?g|webp)$/i              // 匹配图片文件类型
      );

      context.keys().forEach((key) => {
        images.push({ src: context(key) });
      });

      return images;
    }
  }
}
</script>

<style scoped>

.content-viewer{
  background-color: var(--body-content-bg);
  transform: translateY(-8rem);
}

/* Span Sec.2 Below(BL) Start */

.span-container-sec1{
  height: 30rem;
}

#span-sec2-BL-carousel{
  width: 60%;
  height: 20%;
  margin: 0 auto;
  align-self: center;
}

#gallery{
  margin: 0 auto;
  transform: translateY(-50px);
}

/* Scooped Start */

h1.subtitle{
  color: var(--body-content-span-text-color);
  font-size: 2rem;
  width: fit-content;
  height: 3rem;
}

h3.subtitle{
  color: var(--body-content-span-text-color);
  font-size: 0.9rem;
  width: fit-content;
  height: fit-content;
}

p{
  color: var(--body-content-span-text-color);
  font-size: 0.8rem;
}

</style>