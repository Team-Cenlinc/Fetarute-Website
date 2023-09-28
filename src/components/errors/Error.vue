<template>
  <div id="error">
    <div v-if="!isMobile" id="desktop">
      <ErrorHeader :title="this.title" @colorThemeChange="syncColorTheme"/>
      <ErrorNotFoundViewer/>
      <div>

      </div>
      <FooterViewer ref="footer"/>
    </div>
    <div v-if="isMobile" id="mobile">
      <MobileErrorHeader :title="this.title" @colorThemeChange="syncColorTheme"/>
      <MobileErrorNotFoundViewer/>
      <div>

      </div>
      <MobileFooter ref="footer"/>
    </div>
  </div>
</template>

<script>
import FooterViewer from "@/components/footer";
import MobileFooter from "@/components/mobile/mobileFooter";
import ErrorHeader from "@/components/errors/errorHeader";
import MobileErrorHeader from "@/components/mobile/errors/mobileErrorHeader";
import ErrorNotFoundViewer from "@/components/errors/404";
import MobileErrorNotFoundViewer from "@/components/mobile/errors/mobile404";

export default {
  name: "ErrorViewer",
  components: {
    MobileErrorNotFoundViewer,
    ErrorNotFoundViewer, MobileErrorHeader, ErrorHeader, FooterViewer, MobileFooter},
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