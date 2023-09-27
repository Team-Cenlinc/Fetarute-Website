<template>
  <div class="content-viewer">

    <section class="content-container-section-1">
      <div id="line-cross-in-L-1"></div>
      <div id="content-container-line-1">
        <div id="content-station-1"></div>
      </div>
      <div id="content-container-1">
        <h1 style="border-bottom: 1rem solid var(--body-span-line-chikai);" class="subtitle">{{ $t("bodyContent.creativeWorld") }}</h1>
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
        <h3 style="border-bottom: 0.5rem solid var(--body-span-line-hokuriku);" class="subtitle">02 - {{ $t("bodyContent.creativeBegin") }}<span class="material-symbols-outlined">palette</span></h3>
        <p>
          <br>{{ $t("bodyContent.introFirstLineCreative") }}
          <br>{{ $t("bodyContent.introSecondLineCreative") }}
        </p>
      </div>
      <div id="line-cross-out-R-1"></div>
    </section>

    <div class="content-span-body">
      <div id="span-line-sec2"></div>
    </div>

  </div>
</template>

<script>
import Cesynlinc from "../../assets/content/Cesynlinc-Optimal.png"
import Syapole from "../../assets/content/Syapole-20th-North-Optimal.png"
import Southpark from "../../assets/content/Southpark-Optimal.png"
import Central from "../../assets/content/Morning-Central-Optimal.png"

export default {
  name: "mobileBodyContentViewerCreative",
  data: () => ({
    isSmallScreen: false,
    contentImagesSec2: [
      {
        src: Cesynlinc
      },
      {
        src: Syapole
      },
      {
        src: Southpark
      },
      {
        src: Central
      }
    ]
  }),
}
</script>

<style scoped>
.content-viewer{
  background-color: var(--body-content-bg);
  background: var(--body-content-bg);
  height: 40rem;
}
/* Section 1 Start */

.content-container-section-1{
  height: 18rem;
  z-index: 0;
  position: relative;
  background-color: var(--body-content-bg);
  transform: translateY(5rem);
}

#line-cross-in-L-1{
  float: right;
  width: 4rem;
  height: 4rem;
  background-color: transparent;
  border-top-left-radius: 5rem;
  border-left: 1rem solid var(--body-span-line-chikai);
  border-top: 1rem solid var(--body-span-line-chikai);
  transform: translateY(-13.75rem);/*Section 1 Original Calc Point*/
}

#content-container-line-1{
  float: right;
  height: 100%;
  width: 1rem;
  background-color: var(--body-span-line-chikai);
  transform: translate(1rem, -10rem);
}

#content-station-1{
  height: 1rem;
  width: 2rem;
  background-color: var(--body-span-line-chikai);
  transform: translate(-1.5rem, 10rem);
}

#content-container-1{
  background-color: transparent;
  transform: translateY(-1rem);
  text-align: center;
  margin: 0 0 0 32%;
}

#line-cross-out-L-1{
  float: right;
  width: 4rem;
  height: 4rem;
  background-color: transparent;
  border-bottom-left-radius: 5rem;
  border-left: 1rem solid var(--body-span-line-chikai);
  border-bottom: 1rem solid var(--body-span-line-chikai);
  transform: translate(5rem, 5rem); /*Section 1 Original Calc Point*/
}

#span-line{
  height: 1rem;
  background-color: var(--body-span-line-kitajuku);
  transform: skewY(-5deg) translateY(-5rem);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

/* Section 2 Start */

.content-container-section-2{
  height: 18rem;
  z-index: 0;
  position: relative;
  background-color: var(--body-content-bg);
  transform: translateY(5rem);
}

#line-cross-in-R-1{
  float: left;
  width: 4rem;
  height: 4rem;
  background-color: transparent;
  border-top-right-radius: 5rem;
  border-right: 1rem solid var(--body-span-line-southpark);
  border-top: 1rem solid var(--body-span-line-southpark);
  transform: translateY(-10rem); /*Section 2 Original Calc Point*/

}

#content-container-line-2{
  float: left;
  height: 100%;
  width: 1rem;
  background-color: var(--body-span-line-southpark);
  transform: translate(-1rem, -6rem);
}

#content-station-2{
  height: 1rem;
  width: 2rem;
  background-color: var(--body-span-line-southpark);
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
  border-right: 1rem solid var(--body-span-line-southpark);
  border-bottom: 1rem solid var(--body-span-line-southpark);
  transform: translate(-5rem, 9.325rem); /*Section 2 Original Calc Point*/
}

#span-line-sec2{
  height: 1rem;
  background-color: var(--body-span-line-pyutocor);
  transform: skewY(2deg) translateY(0);
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

/* Icon */
.material-symbols-outlined {
  font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 12
}
</style>