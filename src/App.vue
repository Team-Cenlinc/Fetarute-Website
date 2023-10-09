<template>
  <div id="app">
    <div v-if="!isMobile" id="desktop">
      <HeaderNav :title="this.title" @colorThemeChange="syncColorTheme"/>
      <div>

      </div>
      <BodyPictureViewer/>
      <BodyContentViewer ref="content"/>
      <BodyContentViewerCreative ref="contentC"/>
      <BodyContentViewerSurvival ref="contentS"/>
      <BodyContentViewerLobby ref="contentL"/>
      <BodyContentViewerConclusion ref="contentCon"/>
      <BodyContentViewerJoin ref="contentJ"/>
      <BodyContentViewerThanks ref="contentT"/>
      <BodyContentViewerPortal ref="contentP"/>
      <BodyGalleryViewer/>
      <FooterViewer ref="footer"/>
    </div>
    <div v-if="isMobile" id="mobile">
      <MobileHeader :title="this.title" @colorThemeChange="syncColorTheme"/>
      <div>

      </div>
      <MobileBodyPictureViewer/>
      <MobileBodyContentViewer ref="content"/>
      <MobileBodyContentViewerCreative ref="contentC"/>
      <MobileBodyContentViewerSurvival ref="contentS"/>
      <MobileBodyContentViewerLobby ref="contentL"/>
      <MobileBodyContentViewerConclusion ref="contentCon"/>
      <MobileBodyContentViewerJoin ref="contentJ"/>
      <MobileBodyContentViewerThanks ref="contentT"/>
      <MobileBodyContentViewerPortal ref="contentP"/>
      <MobileBodyGalleryViewer/>
      <MobileFooter ref="footer"/>
    </div>
  </div>
</template>

<script>
import HeaderNav from "@/components/header";
import BodyPictureViewer from "@/components/bodyPictureViewer";
import BodyContentViewer from "@/components/bodyContentViewer";
import BodyContentViewerCreative from "@/components/bodyContentViewerCreative.vue";
import BodyContentViewerSurvival from "@/components/bodyContentViewerSurvival.vue";
import BodyContentViewerLobby from "@/components/bodyContentViewerLobby.vue";
import BodyContentViewerConclusion from "@/components/bodyContentViewerConclusion.vue";
import BodyContentViewerJoin from "@/components/bodyContentViewerJoin.vue";
import BodyContentViewerThanks from "@/components/bodyContentViewerThanks.vue";
import BodyContentViewerPortal from "@/components/bodyContentViewerPortal.vue";
import BodyGalleryViewer from "@/components/bodyGalleryViewer.vue";
import FooterViewer from "@/components/footer";

import MobileHeader from "@/components/mobile/mobileHeader";
import MobileFooter from "@/components/mobile/mobileFooter";
import MobileBodyPictureViewer from "@/components/mobile/mobileBodyPictureViewer";
import MobileBodyContentViewer from "@/components/mobile/mobileBodyContentViewer";
import MobileBodyContentViewerCreative from "@/components/mobile/mobileBodyContentViewerCreative.vue";
import MobileBodyContentViewerSurvival from "@/components/mobile/mobileBodyContentViewerSurvival.vue";
import MobileBodyContentViewerLobby from "@/components/mobile/mobileBodyContentViewerLobby.vue";
import MobileBodyContentViewerConclusion from "@/components/mobile/mobileBodyContentViewerConclusion.vue";
import MobileBodyContentViewerJoin from "@/components/mobile/mobileBodyContentViewerJoin.vue";
import MobileBodyContentViewerThanks from "@/components/mobile/mobileBodyContentViewerThanks.vue";
import MobileBodyContentViewerPortal from "@/components/mobile/mobileBodyContentViewerPortal.vue";
import MobileBodyGalleryViewer from "@/components/mobile/mobileBodyGalleryViewer.vue";

import lax from 'lax.js'

export default {
  name: 'App',
  components: {
    MobileHeader,
    MobileBodyContentViewer,
    MobileBodyPictureViewer,
    MobileBodyContentViewerCreative,
    MobileBodyContentViewerSurvival,
    MobileBodyContentViewerLobby,
    MobileBodyContentViewerConclusion,
    MobileBodyContentViewerJoin,
    MobileBodyContentViewerThanks,
    MobileBodyContentViewerPortal,
    MobileBodyGalleryViewer,
    MobileFooter,

    HeaderNav,
    BodyPictureViewer,
    BodyContentViewer,
    BodyContentViewerCreative,
    BodyContentViewerSurvival,
    BodyContentViewerLobby,
    BodyContentViewerConclusion,
    BodyContentViewerJoin,
    BodyContentViewerThanks,
    BodyContentViewerPortal,
    BodyGalleryViewer,
    FooterViewer
    },
  data: () => ({
    title: "Fetarute",
    isMobile: false,
    isSmallScreen: false,
  }),
  beforeDestroy () {
    if (typeof window === 'undefined') return
    window.removeEventListener('resize', this.onResize)
    lax.destroy()
  },
  mounted () {
    this.onResize()
    window.addEventListener('resize', this.onResize, { passive: true })

    lax.init();
    lax.addDriver("scrollY", function () {
      return window.scrollY;
    },{ inertiaEnabled: true });

    this.loadLax()
  },
  methods: {
    onResize () {
      this.isMobile = window.innerWidth < 745
      if (window.innerWidth < 1100){
        this.isSmallScreen = true
        this.$refs.content.isSmallScreen = true
        this.$refs.contentC.isSmallScreen = true
        this.$refs.contentS.isSmallScreen = true
        this.$refs.contentL.isSmallScreen = true
        this.$refs.contentCon.isSmallScreen = true
        this.$refs.contentJ.isSmallScreen = true
        this.$refs.contentT.isSmallScreen = true
        this.$refs.contentP.isSmallScreen = true
      } else {
        this.isSmallScreen = false
        this.$refs.content.isSmallScreen = false
        this.$refs.contentC.isSmallScreen = false
        this.$refs.contentS.isSmallScreen = false
        this.$refs.contentL.isSmallScreen = false
        this.$refs.contentCon.isSmallScreen = false
        this.$refs.contentJ.isSmallScreen = false
        this.$refs.contentT.isSmallScreen = false
        this.$refs.contentP.isSmallScreen = false
      }
    },
    syncColorTheme(colorThemeStatus) {
      sessionStorage.setItem("darkModeOption", colorThemeStatus.toString())
      this.$refs.footer.updateColorTheme(colorThemeStatus)
    },
    loadLax(){

      // General Effects

      lax.addElements(
          '.content-image',
          {
            scrollY: {
              opacity: [
                ["elInY", "elCenterY", "elOutY"],
                [0,0.85,1],
              ],
            },
          },
          []
      )

      lax.addElements(
          '.content-container-section-1-wrapper',
          {
            scrollY: {
              translateX: [
                ["elInY", "elCenterY", "elOutY"],
                [100, 0, 0],
              ],
            },
          },
          []
      )

      lax.addElements(
          '.content-container-section-2-wrapper',
          {
            scrollY: {
              translateX: [
                ["elInY", "elCenterY", "elOutY"],
                [-100, 0, 0],
              ],
            },
          },
          []
      )

      // Mobile Specialized

      lax.addElements(
          '.content-image-mobile',
          {
            scrollY: {
              // moving from bottom to up
              translateY: [
                ["elInY", "elCenterY", "elOutY"],
                [0, -100, -200],
              ],
              opacity: [
                ["elInY", "elCenterY", "elOutY"],
                [0,1,1],
              ],
            },
          },
          []
      )

    }
  }
};
</script>

<style>
#app{
  background-color: var(--body-content-bg);
  overflow-x: hidden;
  overflow-y: hidden;
}
</style>
