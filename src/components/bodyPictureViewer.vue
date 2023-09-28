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
import KJH from "../assets/pictures/pan-header/KJH-Optimal.webp"
import KJH02 from "../assets/pictures/pan-header/KJH02-Optimal.webp"
import Monorail from "../assets/pictures/pan-header/Monorail-Optimal.webp"
import OldPTK from "../assets/pictures/pan-header/Old-Pyutocor-Optimal.webp"
import RRCrossing from "../assets/pictures/pan-header/RR-Crossing.webp"
import PyutocorOffices from "../assets/pictures/pan-header/Pyutocor-Offices.webp"
import SyapoleSta from "../assets/pictures/pan-header/Syapole-Sta.webp"

export default {
  name: "bodyPictureViewer",
  data: () => ({
    panHeaderImages: [
      {
        src: KJH
      },
      {
        src: KJH02
      },
      {
        src: Monorail
      },
      {
        src: OldPTK
      },
      {
        src: RRCrossing
      },
      {
        src: PyutocorOffices
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
  background-color: var(--body-content-bg);
  filter: var(--body-picture-viewer-filter-parameter);
}

</style>