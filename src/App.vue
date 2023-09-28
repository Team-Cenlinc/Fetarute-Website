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
import FooterViewer from "@/components/footer";

import MobileHeader from "@/components/mobile/mobileHeader";
import MobileFooter from "@/components/mobile/mobileFooter";
import MobileBodyPictureViewer from "@/components/mobile/mobileBodyPictureViewer";
import MobileBodyContentViewer from "@/components/mobile/mobileBodyContentViewer";
import MobileBodyContentViewerCreative from "@/components/mobile/mobileBodyContentViewerCreative.vue";
import MobileBodyContentViewerSurvival from "@/components/mobile/mobileBodyContentViewerSurvival.vue";

export default {
  name: 'App',
  components: {
    MobileBodyContentViewer,
    MobileBodyPictureViewer,
    MobileBodyContentViewerCreative,
    MobileBodyContentViewerSurvival,
    MobileFooter, FooterViewer, BodyContentViewer, BodyContentViewerCreative, BodyContentViewerSurvival, HeaderNav, BodyPictureViewer, MobileHeader},
  data: () => ({
    title: "Fetarute",
    isMobile: false,
    isSmallScreen: false,
  }),
  beforeDestroy () {
    if (typeof window === 'undefined') return
    window.removeEventListener('resize', this.onResize)
  },
  mounted () {
    this.onResize()
    window.addEventListener('resize', this.onResize, { passive: true })
  },
  methods: {
    onResize () {
      this.isMobile = window.innerWidth < 600
      if (window.innerWidth < 1100){
        this.isSmallScreen = true
        this.$refs.content.isSmallScreen = true
        this.$refs.contentC.isSmallScreen = true
        this.$refs.contentS.isSmallScreen = true
      } else {
        this.isSmallScreen = false
        this.$refs.content.isSmallScreen = false
        this.$refs.contentC.isSmallScreen = false
        this.$refs.contentS.isSmallScreen = false
      }
    },
    syncColorTheme(colorThemeStatus) {
      sessionStorage.setItem("darkModeOption", colorThemeStatus.toString())
      this.$refs.footer.updateColorTheme(colorThemeStatus)
    }
  }
};
</script>
