<template>
  <div id="status-app">
    <header-viewer-tools :title="this.title" @colorThemeChange="syncColorTheme"/>
    <body-data-output />
    <footer-viewer-tools ref="footer"/>
  </div>
</template>

<script>
import FooterViewerTools from "@/components/tools/status/footer";
import HeaderViewerTools from "@/components/tools/status/header";
import BodyDataOutput from "@/components/tools/status/bodyDataOutput";
export default {
  name: "serverStatus",
  components: {BodyDataOutput, HeaderViewerTools, FooterViewerTools},
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