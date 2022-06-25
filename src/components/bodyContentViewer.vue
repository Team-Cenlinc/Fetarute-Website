<template>
  <div class="content-viewer">
    <div class="content-span">
      <div class="span-expand"></div>
      <div class="span-railway-line"></div>
    </div>
    <div class="content-container-creative">

    </div>
  </div>
</template>

<script>
export default {
  name: "bodyContentViewer"
}
</script>

<style scoped>
.content-viewer{
  background-color: var(--body-content-bg);
}

.span-railway-line{
  height: 20px;
  background-color: var(--body-content-span-line-creative);
  transform: skewY(3deg) translateY(-175px);
  z-index: 2;
}

.span-expand{
  height: 130px;
  background-color: var(--body-content-bg);
  transform: skewY(3deg) translateY(-45px);
  box-shadow: 0 -20px 20px 8px var(--body-content-bg);
  z-index: 1;
}

.content-container-creative{
  height: 1500px;
  background-color: var(--body-content-bg);
  z-index: 2;
}
</style>