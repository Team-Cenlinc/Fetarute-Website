<template>
  <div class="content-viewer">
    <div class="content-span">
      <div class="span-expand"></div>
      <div class="span-railway-line"></div>
      <div class="guide-creative">
        <p>开往  创造服务器</p>
      </div>
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
div.content-viewer{
  transform: translateY(-65px);
}

.span-railway-line{
  height: 20px;
  background-color: var(--body-content-span-line-creative);
  transform: skewY(3deg) translateY(-75px);
  z-index: 2;
}

.span-expand{
  height: 130px;
  background-color: var(--body-content-bg);
  transform: skewY(3deg) translateY(40px);
  box-shadow: 0 -8px 8px 8px var(--body-content-bg);
  z-index: 1;
}

.guide-creative{
  margin: 30px 0 0 30px;
  font-weight: bold;
  font-size: 1.5rem;
  color: var(--body-content-span-text-color);
  background-color: var(--body-content-bg);
  z-index: 2;
  transform: skewY(3deg) translateY(-75px);
}

.content-container-creative{
  height: 1500px;
  background-color: var(--body-content-bg);
  transform: translateY(-85px);
  z-index: 1;
}
</style>