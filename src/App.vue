<template>
  <div id="app">
    <div id="desktop">
      <HeaderNav :title="this.title"/>
      <div>

      </div>
      <BodyPictureViewer/>
      <BodyContentViewer />
      <footer-viewer />
    </div>

  </div>
</template>

<script>
import HeaderNav from "@/components/header";
import BodyPictureViewer from "@/components/bodyPictureViewer";
import BodyContentViewer from "@/components/bodyContentViewer";
import FooterViewer from "@/components/footer";

export default {
  name: 'App',
  components: {FooterViewer, BodyContentViewer, HeaderNav, BodyPictureViewer},
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
  }
};
</script>
