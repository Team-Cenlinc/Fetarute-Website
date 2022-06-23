<template>
  <div id="app">
    <HeaderNav :title="this.title"/>
    <BodyPictureViewer/>
    <BodyContentViewer />
  </div>
</template>

<script>
import HeaderNav from "@/components/header";
import BodyPictureViewer from "@/components/bodyPictureViewer";
import BodyContentViewer from "@/components/bodyContentViewer";

export default {
  name: 'App',
  components: {BodyContentViewer, HeaderNav, BodyPictureViewer},
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
