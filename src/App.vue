<template>
  <div id="app">
    <div v-if="!isMobile" id="desktop">
      <HeaderNav :title="this.title" @colorThemeChange="syncColorTheme"/>
      <div>

      </div>
      <BodyPictureViewer/>
      <BodyContentViewer ref="content"/>
      <FooterViewer ref="footer"/>
    </div>
    <div v-if="isMobile" id="mobile">
      <MobileHeader :title="this.title" @colorThemeChange="syncColorTheme"/>
      <div>

      </div>
      <MobileBodyPictureViewer/>
      <MobileBodyContentViewer ref="content"/>
      <MobileFooter ref="footer"/>
    </div>
  </div>
</template>

<script>
import HeaderNav from "@/components/header";
import BodyPictureViewer from "@/components/bodyPictureViewer";
import BodyContentViewer from "@/components/bodyContentViewer";
import FooterViewer from "@/components/footer";

import MobileHeader from "@/components/mobile/mobileHeader";
import MobileFooter from "@/components/mobile/mobileFooter";
import MobileBodyPictureViewer from "@/components/mobile/mobileBodyPictureViewer";
import MobileBodyContentViewer from "@/components/mobile/mobileBodyContentViewer";

export default {
  name: 'App',
  components: {
    MobileBodyContentViewer,
    MobileBodyPictureViewer,
    MobileFooter, FooterViewer, BodyContentViewer, HeaderNav, BodyPictureViewer, MobileHeader},
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
      } else {
        this.isSmallScreen = false
        this.$refs.content.isSmallScreen = false
      }
    },
    syncColorTheme(colorThemeStatus) {
      sessionStorage.setItem("darkModeOption", colorThemeStatus.toString())
      this.$refs.footer.updateColorTheme(colorThemeStatus)
    }
  }
};
</script>
