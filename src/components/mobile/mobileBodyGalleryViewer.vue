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
import KJH from "../../assets/pictures/pan-header/KJH-Optimal.webp"
import KJH02 from "../../assets/pictures/pan-header/KJH02-Optimal.webp"
import Monorail from "../../assets/pictures/pan-header/Monorail-Optimal.webp"
import OldPTK from "../../assets/pictures/pan-header/Old-Pyutocor-Optimal.webp"
import RRCrossing from "../../assets/pictures/pan-header/RR-Crossing.webp"
import PyutocorOffices from "../../assets/pictures/pan-header/Pyutocor-Offices.webp"
import SyapoleSta from "../../assets/pictures/pan-header/Syapole-Sta.webp"
import PyutocorPort from "../../assets/pictures/pan-header/Pyutocor-Port.webp"
import LobbySubstation from "../../assets/pictures/pan-header/Lobby-Substation.webp"
import PyutocorSkylineDusk from "../../assets/pictures/pan-header/Pyutocor-Skyline-Dusk.webp"
import NorthernlandSURnorth from "../../assets/pictures/pan-header/Northernland-SURnorth.webp"

export default {
  name: "mobileBodyGalleryViewer",
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
      },
      {
        src: LobbySubstation
      }
    ]
  }),
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