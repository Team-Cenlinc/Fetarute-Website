<template>
  <div class="content-viewer">
    <section class="down-navigator">
      <div id="rectangle-station"></div>
      <div id="line-nav-expand">
        <p>{{ $t("bodyContent.promptScroll") }}️</p>
      </div>
      <div id="line-nav-expand-merge-1"></div>
    </section>

    <section class="content-span">
      <div class="span-expand"></div>
      <div class="span-railway-line">
        <div class="span-railway-background"></div>
      </div>
    </section>

    <section class="content-container-section-1">
      <div id="line-cross-in-L-1"></div>
      <div id="content-container-line-1">
        <div id="content-station-1"></div>
      </div>
      <div id="content-container-1">
        <h1 style="border-bottom: 2rem solid var(--body-span-line-syapole);" class="subtitle">{{ $t("bodyContent.creativeWorld") }}</h1>
      </div>
      <div id="line-cross-out-L-1"></div>
    </section>

    <div class="content-span-body">
      <div id="span-line"></div>
    </div>

    <section class="content-container-section-2">
      <div id="line-cross-in-R-1"></div>
      <div id="content-container-line-2">
        <div id="content-station-2"></div>
      </div>
      <div id="content-container-2">

      </div>
      <div id="line-cross-out-R-1"></div>
    </section>

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

.down-navigator{
  z-index: 2;
  position: relative;
}

#rectangle-station{
  height: 20px;
  width: 60px;
  margin-left: 40px;
  background-color: var(--body-content-span-line-creative);
  transform: translateY(-575px);
}

#line-nav-expand{
  height: 450px;
  width: 22px;
  margin-left: 60px;
  background-color: var(--body-content-span-line-creative);
  transform: translateY(-575px);
  writing-mode: vertical-lr;
  font-size: 0.9rem;
  font-weight: bold;
  align-content: center;
  color: var(--body-nav-expand-text-color);
  text-align: start;
  font-family: "Noto Sans SC", sans-serif;
  text-space: 0.5rem;
}

#line-nav-expand-merge-1{
  width:100px;
  height:70px;
  margin-left: 60px;
  background-color: transparent;
  border-bottom-left-radius: 90px;
  border-left: 22px solid var(--body-content-span-line-creative);
  border-bottom: 22px solid var(--body-content-span-line-creative);
  transform: translateY(-575px);
}

.span-railway-line{
  height: 22px;
  background-color: var(--body-content-span-line-creative);
  transform: skewY(3deg) translateY(-700px);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  z-index: 3;
  position: relative;
}

.span-expand{
  height: 130px;
  background-color: var(--body-content-bg);
  transform: skewY(3deg) translateY(-580px);
  box-shadow: 0 -20px 20px 5px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

/* Section 1 Start */

.content-container-section-1{
  height: 500px;
  z-index: 2;
  position: relative;
  margin-bottom: -500px;
}

#line-cross-in-L-1{
  float: right;
  width: 90px;
  height: 90px;
  background-color: transparent;
  border-top-left-radius: 90px;
  border-left: 22px solid var(--body-span-line-syapole);
  border-top: 22px solid var(--body-span-line-syapole);
  transform: translateY(-1000px); /*Section 1 Original Calc Point*/
}

#content-container-line-1{
  float: right;
  height: 100%;
  width: 22px;
  background-color: var(--body-span-line-syapole);
  transform: translate(22px, -910px);
}

#content-station-1{
  height: 20px;
  width: 50px;
  background-color: var(--body-span-line-syapole);
  transform: translate(-30px, 16.5rem);
}

#content-container-1{
  background-color: transparent;
  transform: translateY(-700px);
  text-align: center;
  margin: 200px 0 0 32%;
}

#line-cross-out-L-1{
  float: right;
  width: 90px;
  height: 90px;
  background-color: transparent;
  border-bottom-left-radius: 90px;
  border-left: 22px solid var(--body-span-line-syapole);
  border-bottom: 22px solid var(--body-span-line-syapole);
  transform: translate(112px, -500px); /*Section 1 Original Calc Point*/
}

#span-line{
  height: 22px;
  background-color: var(--body-span-line-southpark);
  transform: skewY(-3deg) translateY(-400px);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

/* Section 2 Start */

.content-container-section-2{
  height: 500px;
  z-index: 1;
  position: relative;
}

#line-cross-in-R-1{
  float: left;
  width: 90px;
  height: 90px;
  background-color: transparent;
  border-top-right-radius: 90px;
  border-right: 22px solid var(--body-span-line-syapole);
  border-top: 22px solid var(--body-span-line-syapole);
  transform: translateY(-800px); /*Section 1 Original Calc Point*/
}

#content-container-line-2{
  float: left;
  height: 100%;
  width: 22px;
  background-color: var(--body-span-line-syapole);
  transform: translate(-22px, -710px);
}

#content-station-2{
  height: 20px;
  width: 50px;
  background-color: var(--body-span-line-syapole);
  transform: translate(5px, 16.5rem);
}

#content-container-2{
  background-color: transparent;
  transform: translateY(-500px);
  text-align: center;
  margin: 200px 0 0 30%;
}

#line-cross-out-R-1{
  float: left;
  width: 90px;
  height: 90px;
  background-color: transparent;
  border-bottom-right-radius: 90px;
  border-right: 22px solid var(--body-span-line-syapole);
  border-bottom: 22px solid var(--body-span-line-syapole);
  transform: translate(-112px, -210px); /*Section 1 Original Calc Point*/
}

/* Scooped Start */

h1.subtitle{
  color: var(--body-content-span-text-color);
  font-size: 4rem;
  width: fit-content;
  height: 5rem;
}
</style>