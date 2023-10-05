<template>
  <div class="content-viewer">


    <div class="content-container-section-1-wrapper">
      <section class="content-container-section-1">
        <div id="line-cross-in-L-1"></div>
        <div id="content-container-line-1">
          <div id="content-station-1"></div>
        </div>
        <div id="content-container-1">
          <h1 style="border-bottom: 1.75rem solid var(--body-span-line-chikai);" class="subtitle">{{ $t("bodyContent.creativeWorld") }}</h1>
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

            <h3 style="border-bottom: 0.5rem solid var(--body-span-line-hokuriku);" class="subtitle">02 - {{ $t("bodyContent.creativeBegin") }}<span class="material-symbols-outlined">palette</span></h3>
            <p>
              <br>{{ $t("bodyContent.introFirstLineCreative") }}
              <br>{{ $t("bodyContent.introSecondLineCreative") }}
            </p>
      </div>
      <span class="content-image">
        <v-img
            v-if="!isSmallScreen"
            id="content-sec2-pic"
            src="../assets/content/Cesynlinc-Optimal.webp"
            lazy-src="../assets/content/lazy/Cesynlinc-Optimal-modified.webp"
            max-width="30%"
            max-height="50%"
        >
          <template v-slot:placeholder>
              <v-progress-circular
                  indeterminate
                  color="grey lighten-2"
              ></v-progress-circular>
          </template>
        </v-img>
      </span>
      <div id="line-cross-out-R-1"></div>

    </section></div>


    <div class="content-span-body">
      <div id="span-line-sec2"></div>
    </div>

  </div>
</template>

<script>

export default {
  name: "bodyContentViewerCreative",
  data: () => ({
    isSmallScreen: false,
  }),
}
</script>

<style scoped>
.content-viewer{
  background-color: var(--body-content-bg);
  height: 50rem;
  background-image: url('../assets/background/abstract-small.webp');
  background-position: center;
  background-origin: content-box;
  background-repeat: repeat-x;
}

/* Section 1 Start */

.content-container-section-1{
  height: 32rem;
  z-index: 1;
  position: relative;
  margin-bottom: -900px;
  transform: translateY(-35rem);
}

.content-container-section-1-wrapper{
  z-index: 1;
  position: relative;
}

#line-cross-in-L-1{
  float: right;
  width: 5rem;
  height: 5rem;
  background-color: transparent;
  border-top-left-radius: 5rem;
  border-left: 1.375rem solid var(--body-span-line-chikai);
  border-top: 1.375rem solid var(--body-span-line-chikai);
  transform: translateY(0);
}

#content-container-line-1{
  float: right;
  height: 100%;
  width: 1.375rem;
  background-color: var(--body-span-line-chikai);
  transform: translate(1.375rem, 5rem);
}

#content-station-1{
  height: 1.5rem;
  width: 3rem;
  background-color: var(--body-span-line-chikai);
  transform: translate(-2rem, 16.5rem);
}

#content-container-1{
  background-color: transparent;
  transform: translateY(18.75rem);
  text-align: center;
  margin: 200px 0 0 30%;
}

#line-cross-out-L-1{
  float: right;
  width: 5rem;
  height: 5rem;
  background-color: transparent;
  border-bottom-left-radius: 5rem;
  border-left: 1.375rem solid var(--body-span-line-chikai);
  border-bottom: 1.375rem solid var(--body-span-line-chikai);
  transform: translate(6.375rem, 32rem); /*Section 1 Original Calc Point*/
}

#span-line{
  height: 1.375rem;
  background-color: var(--body-span-line-kitajuku);
  transform: skewY(-5deg) translateY(23.5rem);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

/* Section 2 Start */

.content-container-section-2{
  height: 32rem;
  z-index: 0;
  position: relative;
  background-color: var(--body-content-bg);
  transform: translateY(-10rem);
  background-image: url('../assets/background/abstract-small-2.webp');
  background-position: center;
  background-origin: content-box;
  background-repeat: repeat-x;
}

#line-cross-in-R-1{
  float: left;
  width: 5rem;
  height: 5rem;
  background-color: transparent;
  border-top-right-radius: 5rem;
  border-right: 1.375rem solid var(--body-span-line-southpark);
  border-top: 1.375rem solid var(--body-span-line-southpark);
  transform: translateY(0); /*Section 2 Original Calc Point*/
}

#content-container-line-2{
  float: left;
  height: 110%;
  width: 1.375rem;
  z-index: 2;
  background-color: var(--body-span-line-southpark);
  transform: translate(-1.375rem, 5rem);
}

#content-station-2{
  height: 1.5rem;
  width: 3rem;
  background-color: var(--body-span-line-southpark);
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
  box-shadow: 1rem 1.5rem var(--body-span-line-syapole);
}

#line-cross-out-R-1{
  float: left;
  width: 5rem;
  height: 5rem;
  background-color: transparent;
  border-bottom-right-radius: 5rem;
  border-right: 1.375rem solid var(--body-span-line-southpark);
  border-bottom: 1.375rem solid var(--body-span-line-southpark);
  transform: translate(-6.375rem, 40rem); /*Section 2 Original Calc Point*/
}

#span-line-sec2{
  height: 1.375rem;
  background-color: var(--body-span-line-pyutocor);
  transform: skewY(2deg) translateY(10.5rem);
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
  alignment: center;
  justify-self: center;
}

p{
  color: var(--body-content-span-text-color);
  font-size: 1.2rem;
}
</style>