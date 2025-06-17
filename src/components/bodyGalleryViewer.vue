<template>
  <div class="content-viewer">
    <div class="span-container-sec1">
      <h1 style="border-bottom: 1.75rem solid var(--body-span-line-chikai);" class="subtitle" id="gallery">{{ $t("bodyContent.gallery") }}</h1>
      <v-carousel cycle interval=6000 :show-arrows="false" delimiter-icon="mdi-minus" id="span-sec2-BL-carousel">
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
  name: "bodyGalleryViewer",
  data() {
    return {
      contentImages: this.importAllImages()
    };
  },
  methods: {
    importAllImages() {
      const images = [];
      const context = require.context(
          "../assets/pictures/pan-header", // 修改为当前相对路径
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

/* Span Sec.2 Below(BL) Start */

.span-container-sec1{
  height: 45rem;
}

#span-sec2-BL-carousel{
  width: 70%;
  height: 30%;
  margin: 0 auto;
  align-self: center;
}

#gallery{
  transform: translateY(-100px);
  margin: 0 auto;
}

h1.subtitle{
  color: var(--body-content-span-text-color);
  font-size: 4rem;
  width: fit-content;
  height: 5rem;
}

h3.subtitle{
  color: var(--body-content-span-text-color);
  font-size: 1.2rem;
  width: fit-content;
  height: 1.8rem;
}

v-progress-circular{
  align-self: center;
  justify-self: center;
}

p{
  color: var(--body-content-span-text-color);
  font-size: 1.2rem;
}

</style>