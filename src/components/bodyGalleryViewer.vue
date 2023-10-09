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
import KJH from "../assets/pictures/pan-header/KJH-Optimal.webp"
import KJH02 from "../assets/pictures/pan-header/KJH02-Optimal.webp"
import Monorail from "../assets/pictures/pan-header/Monorail-Optimal.webp"
import OldPTK from "../assets/pictures/pan-header/Old-Pyutocor-Optimal.webp"
import RRCrossing from "../assets/pictures/pan-header/RR-Crossing.webp"
import PyutocorOffices from "../assets/pictures/pan-header/Pyutocor-Offices.webp"
import SyapoleSta from "../assets/pictures/pan-header/Syapole-Sta.webp"
import PyutocorPort from "../assets/pictures/pan-header/Pyutocor-Port.webp"
import PyutocorSkylineDusk from "../assets/pictures/pan-header/Pyutocor-Skyline-Dusk.webp"
import NorthernlandSURnorth from "../assets/pictures/pan-header/Northernland-SURnorth.webp"

export default {
  name: "bodyGalleryViewer",
  data: () => ({
    contentImages: [
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
      },
      {
        src: PyutocorPort
      },
      {
        src: PyutocorSkylineDusk
      },
      {
        src: NorthernlandSURnorth
      }
    ]
  }),
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