<template>
  <div class="picture-carousel" id="pan-header-picture">
    <v-carousel hide-delimiters :show-arrows="false" height="600">
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
import KJH from "../assets/pictures/pan-header/KJH-Optimal.png"

export default {
  name: "bodyPictureViewer",
  data: () => ({
    panHeaderImages: [
      {
        src: KJH
      }
    ]
  }),
}
</script>

<style scoped>
div.picture-carousel{
  z-index: -1;
}

</style>