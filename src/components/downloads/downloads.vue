<template>
  <div id="error">
    <div v-if="!isMobile" id="desktop">
      <DownloadHeader :title="this.title" @colorThemeChange="syncColorTheme"/>
      <DownloadPictureViewer/>
      <div>

      </div>
      <FooterViewer ref="footer"/>
    </div>
    <div v-if="isMobile" id="mobile">
      <MobileDownloadHeader :title="this.title" @colorThemeChange="syncColorTheme"/>
      <MobileDownloadPictureViewer/>
      <div>

      </div>
      <MobileFooter ref="footer"/>
    </div>
  </div>
</template>

<script>
import FooterViewer from "@/components/footer";
import MobileFooter from "@/components/mobile/mobileFooter";
import DownloadHeader from "@/components/header";
import MobileDownloadHeader from "@/components/mobile/mobileHeader";

import DownloadPictureViewer from "@/components/downloads/downloadPictureViewer.vue";
import MobileDownloadPictureViewer from "@/components/mobile/downloads/mobileDownloadPictureViewer.vue";

export default {
  name: "ErrorViewer",
  components: {
    MobileDownloadHeader, DownloadHeader, FooterViewer, MobileFooter,
    DownloadPictureViewer, MobileDownloadPictureViewer

  },
  data: () => ({
    title: "Fetarute",
    isMobile: false,
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