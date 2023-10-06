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
import FooterViewer from "@/components/footer";

import MobileHeader from "@/components/mobile/mobileHeader";
import MobileFooter from "@/components/mobile/mobileFooter";
import MobileBodyPictureViewer from "@/components/mobile/mobileBodyPictureViewer";
import MobileBodyContentViewer from "@/components/mobile/mobileBodyContentViewer";
import MobileBodyContentViewerCreative from "@/components/mobile/mobileBodyContentViewerCreative.vue";
import MobileBodyContentViewerSurvival from "@/components/mobile/mobileBodyContentViewerSurvival.vue";
import MobileBodyContentViewerLobby from "@/components/mobile/mobileBodyContentViewerLobby.vue";

import lax from 'lax.js'

export default {
  name: 'App',
  components: {
    MobileBodyContentViewer,
    MobileBodyPictureViewer,
    MobileBodyContentViewerCreative,
    MobileBodyContentViewerSurvival,
    MobileBodyContentViewerLobby,
    MobileFooter, FooterViewer, BodyContentViewer, BodyContentViewerCreative, BodyContentViewerSurvival, BodyContentViewerLobby, HeaderNav, BodyPictureViewer, MobileHeader},
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
      this.isMobile = window.innerWidth < 700
      if (window.innerWidth < 1100){
        this.isSmallScreen = true
        this.$refs.content.isSmallScreen = true
        this.$refs.contentC.isSmallScreen = true
        this.$refs.contentS.isSmallScreen = true
        this.$refs.contentL.isSmallScreen = true
      } else {
        this.isSmallScreen = false
        this.$refs.content.isSmallScreen = false
        this.$refs.contentC.isSmallScreen = false
        this.$refs.contentS.isSmallScreen = false
        this.$refs.contentL.isSmallScreen = false
      }
    },
    syncColorTheme(colorThemeStatus) {
      sessionStorage.setItem("darkModeOption", colorThemeStatus.toString())
      this.$refs.footer.updateColorTheme(colorThemeStatus)
    },
    loadLax(){
      console.log("Lax Loaded")
      lax.addElements(
          '.content-image',
          {
            scrollY: {
              opacity: [
                ["elInY", "elCenterY", "elOutY"],
                [0,1,1],
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
