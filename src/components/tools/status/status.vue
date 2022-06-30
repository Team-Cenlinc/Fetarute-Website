<template>
  <div id="status-app">
    <div id="desktop" v-if="!this.isMobile">
      <header-viewer-tools :title="this.title" @colorThemeChange="syncColorTheme"/>
      <body-data-output />
      <body-dynmap-viewer />
      <footer-viewer-tools ref="footer"/>
    </div>

    <div id="mobile" v-if="this.isMobile">
      <mobile-header-viewer :title="this.title" @colorThemeChange="syncColorTheme"/>
      <mobile-data-output />
      <mobile-dynmap-viewer />
      <mobile-footer ref="footer"/>
    </div>

  </div>
</template>

<script>
import FooterViewerTools from "@/components/tools/status/footer";
import HeaderViewerTools from "@/components/tools/status/header";
import BodyDataOutput from "@/components/tools/status/bodyDataOutput";
import BodyDynmapViewer from "@/components/tools/status/bodyDynmapViewer";
import MobileHeaderViewer from "@/components/mobile/tools/status/mobileHeader";
import MobileFooter from "@/components/mobile/mobileFooter";
import MobileDataOutput from "@/components/mobile/tools/status/mobileDataOutput";
import MobileDynmapViewer from "@/components/mobile/tools/status/mobileDynmapViewer";
export default {
  name: "serverStatus",
  components: {
    MobileDynmapViewer,
    MobileDataOutput,
    MobileFooter, MobileHeaderViewer, BodyDynmapViewer, BodyDataOutput, HeaderViewerTools, FooterViewerTools},
  data: () => ({
    title: "Fetarute",
    isMobile: false
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
    },
    syncColorTheme(colorThemeStatus) {
      sessionStorage.setItem("darkModeOption", colorThemeStatus.toString())
      this.$refs.footer.updateColorTheme(colorThemeStatus)
    }
  }
}
</script>

<style scoped>

</style>