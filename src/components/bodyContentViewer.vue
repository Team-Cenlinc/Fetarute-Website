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

    <div class="content-container-section-1-wrapper">
    <section class="content-container-section-1">
      <div id="line-cross-in-L-1"></div>
      <div id="content-container-line-1">
        <div id="content-station-1"></div>
      </div>
      <div id="content-container-1">
        <h1 style="border-bottom: 1.75rem solid var(--body-span-line-syapole);" class="subtitle">{{ $t("bodyContent.general") }}</h1>
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
      <span class="content-image">
        <v-img
            v-if="!isSmallScreen"
            id="content-sec2-pic"
            src="../assets/content/Morning-Central-Optimal.webp"
            lazy-src="../assets/content/lazy/Morning-Central-Modified.webp"
            max-width="30%"
            max-height="50%"
        >
          <template v-slot:placeholder>
              <v-progress-circular
                  indeterminate
                  color="grey lighten-2"
                  aria-label="Loading Picture"
              ></v-progress-circular>
          </template>
        </v-img>
      </span>
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
  name: "bodyContentViewer",
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

  background-image: url('../assets/background/abstract.webp');
  background-position: center;
  background-origin: content-box;
  background-repeat: repeat-x;
}

.down-navigator{
  z-index: 2;
  position: relative;
}

#rectangle-station{
  height: 1.5rem;
  width: 3.75rem;
  margin-left: 2.65rem;
  background-color: var(--body-content-span-line-creative);
  transform: translateY(-37rem);
}

#line-nav-expand{
  height: 28.25rem;
  width: 1.5rem;
  margin-left: 3.75rem;
  background-color: var(--body-content-span-line-creative);
  transform: translateY(-37rem);
  writing-mode: vertical-lr;
  font-size: 0.7rem;
  font-weight: bold;
  align-content: space-evenly;
  color: var(--body-nav-expand-text-color);
  text-align: start;
  font-family: "Noto Sans SC", sans-serif;
}

#line-nav-expand-merge-1{
  width:6.25rem;
  height:5rem;
  margin-left: 3.75rem;
  background-color: transparent;
  border-bottom-left-radius: 5.7rem;
  border-left: 1.5rem solid var(--body-content-span-line-creative);
  border-bottom: 1.5rem solid var(--body-content-span-line-creative);
  transform: translateY(-37rem);
}

.span-railway-line{
  height: 1.375rem;
  background-color: var(--body-content-span-line-creative);
  transform: skewY(3deg) translateY(-45rem);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  z-index: 3;
  position: relative;
}

.span-expand{
  height: 7rem;
  background-color: var(--body-content-bg);
  transform: skewY(3deg) translateY(-37.5rem);
  z-index: 2;
  position: relative;
}

/* Section 1 Start */

.content-container-section-1{
  height: 32rem;
  z-index: 2;
  position: relative;
  margin-bottom: -900px;
  transform: translateY(-1000px);
}

.content-container-section-1-wrapper{
  position: relative;
  z-index: 2;
}

#line-cross-in-L-1{
  float: right;
  width: 5rem;
  height: 5rem;
  background-color: transparent;
  border-top-left-radius: 5rem;
  border-left: 1.375rem solid var(--body-span-line-syapole);
  border-top: 1.375rem solid var(--body-span-line-syapole);
  transform: translateY(0);
}

#content-container-line-1{
  float: right;
  height: 100%;
  width: 1.375rem;
  background-color: var(--body-span-line-syapole);
  transform: translate(1.375rem, 5rem);
}

#content-station-1{
  height: 1.5rem;
  width: 3rem;
  background-color: var(--body-span-line-syapole);
  transform: translate(-2rem, 16.5rem);
}

#content-container-1{
  background-color: transparent;
  transform: translateY(18.75rem);
  align-self: center;
  margin: 200px 0 0 32.5%;
}

#line-cross-out-L-1{
  float: right;
  width: 5rem;
  height: 5rem;
  background-color: transparent;
  border-bottom-left-radius: 5rem;
  border-left: 1.375rem solid var(--body-span-line-syapole);
  border-bottom: 1.375rem solid var(--body-span-line-syapole);
  transform: translate(6.375rem, 32rem); /*Section 1 Original Calc Point*/
}

#span-line{
  height: 1.375rem;
  background-color: var(--body-span-line-southpark);
  transform: skewY(-5deg) translateY(-3.125rem);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

/* Section 2 Start */

.content-container-section-2{
  height: 32rem;
  z-index: 1;
  transform: translateY(-600px)
}

.content-container-section-2-wrapper{
  position: relative;
  z-index: 1;
}

#line-cross-in-R-1{
  float: left;
  width: 5rem;
  height: 5rem;
  background-color: transparent;
  border-top-right-radius: 5rem;
  border-right: 1.375rem solid var(--body-span-line-kitajuku);
  border-top: 1.375rem solid var(--body-span-line-kitajuku);
  transform: translateY(0); /*Section 2 Original Calc Point*/
}

#content-container-line-2{
  float: left;
  height: 110%;
  width: 1.375rem;
  background-color: var(--body-span-line-kitajuku);
  transform: translate(-1.375rem, 5rem);
}

#content-station-2{
  height: 1.5rem;
  width: 3rem;
  background-color: var(--body-span-line-kitajuku);
  transform: translate(0.665rem, 16.5rem);
}

#content-container-2{
  max-width: 50%;
  height: 12.5rem;
  background-color: transparent;
  transform: translateY(30rem);
  margin: 13.75rem 0 0 9rem;
  line-height: 1.8rem;
}

#content-container-2 p{
  padding-right: 3.2rem;
}

#content-sec2-pic {
  float: right;
  transform: translate(5rem, 17rem);
  box-shadow: 1rem 1.5rem var(--body-span-line-southpark);
}

#line-cross-out-R-1{
  float: left;
  width: 5rem;
  height: 5rem;
  background-color: transparent;
  border-bottom-right-radius: 5rem;
  border-right: 1.375rem solid var(--body-span-line-kitajuku);
  border-bottom: 1.375rem solid var(--body-span-line-kitajuku);
  transform: translate(-6.375rem, 40rem); /*Section 2 Original Calc Point*/
}

#span-line-sec2{
  height: 1.375rem;
  background-color: var(--body-span-line-hokuriku);
  transform: skewY(2deg) translateY(-16.625rem);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  z-index: 2;
  position: relative;
}


/* Scooped Start */

h1.subtitle{
  color: var(--body-content-span-text-color);
  font-size: 4rem;
  width: fit-content;
  height: 5rem;
  align-self: center;
}

h3.subtitle{
  color: var(--body-content-span-text-color);
  font-size: 1.2rem;
  width: fit-content;
  height: 1.8rem;
}

v-progress-circular{
  align-self: center;
  justify-self: center;
}

p{
  color: var(--body-content-span-text-color);
  font-size: 1.2rem;
}

/* Icons */

.material-symbols-outlined {
  font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 24
}
</style>