<template>
  <div class="content-viewer">
    <div class="down-navigator">
      <div id="rectangle-station"></div>
      <div id="line-nav-expand">
        <p>{{ $t("bodyContent.promptScroll") }}️</p>
      </div>
      <div id="line-nav-expand-merge"></div>
    </div>
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
  name: "mobileBodyContentViewer"
}
</script>

<style scoped>
.content-viewer{
  background-color: var(--body-content-bg);
}

#rectangle-station{
  height: 16px;
  width: 40px;
  margin-left: 20px;
  background-color: var(--body-content-span-line-creative);
  transform: translateY(-400px);
}

#line-nav-expand{
  height: 330px;
  width: 16px;
  margin-left: 30px;
  background-color: var(--body-content-span-line-creative);
  transform: translateY(-400px);
  writing-mode: vertical-lr;
  font-size: 0.5rem;
  font-weight: bold;
  align-content: center;
  color: var(--body-nav-expand-text-color);
  text-align: start;
  font-family: "Noto Sans SC", sans-serif;
  text-space: 0.5rem;
}

#line-nav-expand-merge{
  width:50px;
  height:35px;
  margin-left: 30px;
  background-color: transparent;
  border-bottom-left-radius: 90px;/*增加了边框，圆角半径也要变化*/
  border-left: 16px solid var(--body-content-span-line-creative);/*边框左边线*/
  border-bottom: 16px solid var(--body-content-span-line-creative);/*边框左边线*/
  transform: translateY(-400px);
}

.span-railway-line{
  height: 16px;
  background-color: var(--body-content-span-line-creative);
  transform: skewY(3deg) translateY(-535px);
  z-index: 2;
}

.span-expand{
  height: 130px;
  background-color: var(--body-content-bg);
  transform: skewY(3deg) translateY(-405px);
  box-shadow: 0 -20px 20px 8px var(--body-content-bg);
  z-index: 1;
}

.content-container-creative{
  height: 1500px;
  background-color: var(--body-content-bg);
  z-index: 2;
}
</style>