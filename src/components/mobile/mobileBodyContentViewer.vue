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

    <div class="content-container-section-1-wrapper">
    <section class="content-container-section-1">
      <div id="line-cross-in-L-1"></div>
      <div id="content-container-line-1">
        <div id="content-station-1"></div>
      </div>
      <div id="content-container-1">
        <h1 style="border-bottom: 1rem solid var(--body-span-line-syapole);" class="subtitle">{{ $t("bodyContent.general") }}</h1>
      </div>
      <div id="line-cross-out-L-1"></div>
    </section>
    </div>

    <div class="content-span-body">
      <div id="span-line"></div>
    </div>

    <div class="content-container-section-2-wrapper">
    <section class="content-container-section-2">
      <div id="line-cross-in-R-1"></div>
      <div id="content-container-line-2">
        <div id="content-station-2"></div>
      </div>
      <div id="content-container-2">
        <h3 style="border-bottom: 0.5rem solid var(--body-span-line-kitajuku);" class="subtitle">01 - {{ $t("bodyContent.journeyBegin") }}<span class="material-symbols-outlined">train</span></h3>
        <p>
          <br>{{ $t("bodyContent.introFirstLine") }}
          <br>{{ $t("bodyContent.introSecondLine") }}
        </p>
      </div>
      <div id="line-cross-out-R-1"></div>
    </section>
    </div>

    <div class="content-span-body">
      <div id="span-line-sec2"></div>
    </div>

  </div>
</template>

<script>
export default {
  name: "mobileBodyContentViewer",
  data: () => ({
    isSmallScreen: false,
  }),
  mounted() {
    this.$parent.loadLax()
  }
}
</script>

<style scoped>
.content-viewer{
  background-color: var(--body-content-bg);
  height: 42.5rem;

  background-image: url('../../assets/background/abstract.webp');
  background-position: center;
  background-origin: content-box;
  background-size: cover;
  background-repeat: repeat-x;
}

.down-navigator{
  z-index: 2;
  position: relative;
  margin-bottom: -37.5rem;
}

#rectangle-station{
  height: 1rem;
  width: 2.5rem;
  margin-left: 1.325rem;
  background-color: var(--body-content-span-line-creative);
  transform: translateY(-25rem);
}

#line-nav-expand{
  height: 20rem;
  width: 1rem;
  margin-left: 2rem;
  background-color: var(--body-content-span-line-creative);
  transform: translateY(-25rem);
  writing-mode: vertical-lr;
  font-size: 0.5rem;
  font-weight: bold;
  color: var(--body-nav-expand-text-color);
  text-align: start;
  font-family: "Noto Sans SC", sans-serif;
  text-space: 0.5rem;
}

#line-nav-expand-merge{
  width:3.125rem;
  height:3rem;
  margin-left: 2rem;
  background-color: transparent;
  border-bottom-left-radius: 5.7rem;
  border-left: 1rem solid var(--body-content-span-line-creative);
  border-bottom: 1rem solid var(--body-content-span-line-creative);
  transform: translateY(-25rem);
}

.span-railway-line{
  height: 1rem;
  background-color: var(--body-content-span-line-creative);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  transform: skewY(3deg) translateY(65px);
  z-index: 3;
  position: relative;
}

.span-expand{
  height: 8rem;
  background-color: var(--body-content-bg);
  transform: skewY(3deg) translateY(12rem);
  box-shadow: 0 -20px 20px 8px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

/* Section 1 Start */

.content-container-section-1{
  height: 18rem;
  z-index: 2;
  position: relative;
}

.content-container-section-1-wrapper{
  z-index: 2;
  position: relative;
}

#line-cross-in-L-1{
  float: right;
  width: 4rem;
  height: 4rem;
  background-color: transparent;
  border-top-left-radius: 5rem;
  border-left: 1rem solid var(--body-span-line-syapole);
  border-top: 1rem solid var(--body-span-line-syapole);
  transform: translateY(-13.75rem);/*Section 1 Original Calc Point*/
}

#content-container-line-1{
  float: right;
  height: 100%;
  width: 1rem;
  background-color: var(--body-span-line-syapole);
  transform: translate(1rem, -10rem);
}

#content-station-1{
  height: 1rem;
  width: 2rem;
  background-color: var(--body-span-line-syapole);
  transform: translate(-1.5rem, 10rem);
}

#content-container-1{
  background-color: transparent;
  transform: translateY(-1rem);
  text-align: center;
  margin: 200px 0 0 40%;
}

#line-cross-out-L-1{
  float: right;
  width: 4rem;
  height: 4rem;
  background-color: transparent;
  border-bottom-left-radius: 5rem;
  border-left: 1rem solid var(--body-span-line-syapole);
  border-bottom: 1rem solid var(--body-span-line-syapole);
  transform: translate(5rem, 6rem); /*Section 1 Original Calc Point*/
}

#span-line{
  height: 1rem;
  background-color: var(--body-span-line-southpark);
  transform: skewY(-5deg) translateY(-9rem);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

/* Section 2 Start */

.content-container-section-2{
  height: 18rem;
  z-index: 1;
  position: relative;
}

.content-container-section-2-wrapper{
  z-index: 1;
  position: relative;
}

#line-cross-in-R-1{
  float: left;
  width: 4rem;
  height: 4rem;
  background-color: transparent;
  border-top-right-radius: 5rem;
  border-right: 1rem solid var(--body-span-line-kitajuku);
  border-top: 1rem solid var(--body-span-line-kitajuku);
  transform: translateY(-10rem); /*Section 2 Original Calc Point*/

}

#content-container-line-2{
  float: left;
  height: 100%;
  width: 1rem;
  background-color: var(--body-span-line-kitajuku);
  transform: translate(-1rem, -6rem);
}

#content-station-2{
  height: 1rem;
  width: 2rem;
  background-color: var(--body-span-line-kitajuku);
  transform: translate(0.5rem, 10rem);
}

#content-container-2{
  height: 2.5rem;
  background-color: transparent;
  margin: -60px 0 0 120px;
  transform: translate(-1rem, 0);
  line-height: 1rem;
  padding-right: 3rem;
}

#line-cross-out-R-1{
  float: left;
  width: 4rem;
  height: 4rem;
  background-color: transparent;
  border-bottom-right-radius: 5rem;
  border-right: 1rem solid var(--body-span-line-kitajuku);
  border-bottom: 1rem solid var(--body-span-line-kitajuku);
  transform: translate(-5rem, 9.325rem); /*Section 2 Original Calc Point*/
}

#span-line-sec2{
  height: 1rem;
  background-color: var(--body-span-line-hokuriku);
  transform: skewY(2deg) translateY(-5rem);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

/* Scooped Start */

h1.subtitle{
  color: var(--body-content-span-text-color);
  font-size: 2rem;
  width: fit-content;
  height: 3rem;
}

h3.subtitle{
  color: var(--body-content-span-text-color);
  font-size: 0.9rem;
  width: fit-content;
  height: fit-content;
}

p{
  color: var(--body-content-span-text-color);
  font-size: 0.8rem;
}

/* Icons */

.material-symbols-outlined {
  font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 12
}
</style>