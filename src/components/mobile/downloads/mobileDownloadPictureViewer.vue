<template>
  <div class="picture-carousel" id="pan-header-picture">
    <v-carousel hide-delimiters cycle interval=6000 :show-arrows="false" height="600">
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
import KJH from "../../../assets/pictures/pan-header/KJH-Optimal.webp"
import Monorail from "../../../assets/pictures/pan-header/Monorail-Optimal.webp"
import RRCrossing from "../../../assets/pictures/pan-header/RR-Crossing.webp"
import SyapoleSta from "../../../assets/pictures/pan-header/Syapole-Sta.webp"

export default {
  name: "mobileBodyPictureViewer",
  data: () => ({
    panHeaderImages: [
      {
        src: KJH
      },
      {
        src: Monorail
      },
      {
        src: RRCrossing
      },
      {
        src: SyapoleSta
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