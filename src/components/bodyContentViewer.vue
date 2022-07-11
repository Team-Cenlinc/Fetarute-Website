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
        <h1 style="border-bottom: 1.75rem solid var(--body-span-line-syapole);" class="subtitle">{{ $t("bodyContent.creativeWorld") }}</h1>
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

            <h3 style="border-bottom: 0.5rem solid var(--body-span-line-kitajuku);" class="subtitle">01 - {{ $t("bodyContent.journeyBegin") }}</h3>
            <p>
              <br>{{ $t("bodyContent.introFirstLine") }}
              <br>{{ $t("bodyContent.introSecondLine") }}
            </p>
      </div>
      <span>
        <v-img
            v-if="!isSmallScreen"
            id="content-sec2-pic"
            src="../assets/content/Cesynlinc-Optimal.png"
            lazy-src="../assets/content/lazy/Cesynlinc-Optimal-modified.png"
            max-width="30%"
            max-height="300px"
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
    </section>

    <div class="content-span-body">
      <div id="span-line-sec2"></div>
    </div>

    <div class="span-container-sec2-BL">
      <h1 style="border-bottom: 1.75rem solid var(--body-span-line-chikai);" class="subtitle" id="gallery">{{ $t("bodyContent.gallery") }}</h1>
      <v-carousel cycle interval=6000 :show-arrows="false" delimiter-icon="mdi-minus" id="span-sec2-BL-carousel">
        <v-carousel-item
            v-for="(item,i) in contentImagesSec2"
            :key="i"
            :src="item.src"
        >
        </v-carousel-item>
      </v-carousel>
    </div>

    <div class="content-span-body">
      <div id="span-line-sec3-UP"></div>
    </div>

  </div>
</template>

<script>
import Cesynlinc from "../assets/content/Cesynlinc-Optimal.png"
import Syapole from "../assets/content/Syapole-20th-North-Optimal.png"
import Southpark from "../assets/content/Southpark-Optimal.png"
import Central from "../assets/content/Morning-Central-Optimal.png"

export default {
  name: "bodyContentViewer",
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
}

.down-navigator{
  z-index: 2;
  position: relative;
}

#rectangle-station{
  height: 20px;
  width: 60px;
  margin-left: 42px;
  background-color: var(--body-content-span-line-creative);
  transform: translateY(-595px);
}

#line-nav-expand{
  height: 450px;
  width: 25px;
  margin-left: 60px;
  background-color: var(--body-content-span-line-creative);
  transform: translateY(-595px);
  writing-mode: vertical-lr;
  font-size: 0.8rem;
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
  border-left: 25px solid var(--body-content-span-line-creative);
  border-bottom: 25px solid var(--body-content-span-line-creative);
  transform: translateY(-595px);
}

.span-railway-line{
  height: 22px;
  background-color: var(--body-content-span-line-creative);
  transform: skewY(3deg) translateY(-720px);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  z-index: 3;
  position: relative;
}

.span-expand{
  height: 150px;
  background-color: var(--body-content-bg);
  transform: skewY(3deg) translateY(-600px);
  box-shadow: 0 -20px 20px 5px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

/* Section 1 Start */

.content-container-section-1{
  height: 500px;
  z-index: 2;
  position: relative;
  margin-bottom: -900px;
  transform: translateY(-1000px);
}

#line-cross-in-L-1{
  float: right;
  width: 90px;
  height: 90px;
  background-color: transparent;
  border-top-left-radius: 90px;
  border-left: 22px solid var(--body-span-line-syapole);
  border-top: 22px solid var(--body-span-line-syapole);
  transform: translateY(5px);
}

#content-container-line-1{
  float: right;
  height: 100%;
  width: 22px;
  background-color: var(--body-span-line-syapole);
  transform: translate(22px, 90px);
}

#content-station-1{
  height: 20px;
  width: 50px;
  background-color: var(--body-span-line-syapole);
  transform: translate(-30px, 16.5rem);
}

#content-container-1{
  background-color: transparent;
  transform: translateY(300px);
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
  transform: translate(112px, 500px); /*Section 1 Original Calc Point*/
}

#span-line{
  height: 22px;
  background-color: var(--body-span-line-southpark);
  transform: skewY(-5deg) translateY(-50px);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

/* Section 2 Start */

.content-container-section-2{
  height: 500px;
  z-index: 1;
  position: relative;
  transform: translateY(-600px)
}

#line-cross-in-R-1{
  float: left;
  width: 90px;
  height: 90px;
  background-color: transparent;
  border-top-right-radius: 90px;
  border-right: 22px solid var(--body-span-line-kitajuku);
  border-top: 22px solid var(--body-span-line-kitajuku); /*Section 1 Original Calc Point*/
}

#content-container-line-2{
  float: left;
  height: 100%;
  width: 22px;
  background-color: var(--body-span-line-kitajuku);
  transform: translate(-22px, 90px);
}

#content-station-2{
  height: 20px;
  width: 50px;
  background-color: var(--body-span-line-kitajuku);
  transform: translate(5px, 16.5rem);
}

#content-container-2{
  max-width: 50%;
  height: 200px;
  background-color: transparent;
  transform: translateY(500px);
  margin: 220px 0 0 145px;
  line-height: 1.8rem;
}

#content-container-2 p{
  padding-right: 50px;
}

#content-sec2-pic {
  float: right;
  transform: translate(80px, 275px);
  box-shadow: 10px 20px var(--body-span-line-southpark);
}

#line-cross-out-R-1{
  float: left;
  width: 90px;
  height: 90px;
  background-color: transparent;
  border-bottom-right-radius: 90px;
  border-right: 22px solid var(--body-span-line-kitajuku);
  border-bottom: 22px solid var(--body-span-line-kitajuku);
  transform: translate(-112px, 590px); /*Section 2 Original Calc Point*/
}

#span-line-sec2{
  height: 22px;
  background-color: var(--body-span-line-hokuriku);
  transform: skewY(2deg) translateY(-250px);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

/* Span Sec.2 Below(BL) Start */

.span-container-sec2-BL{
  height: 900px;
}

#span-sec2-BL-carousel{
  width: 60%;
  height: 30%;
  margin: 0 auto;
  alignment: center;
}

#gallery{
  transform: translateY(-100px);
  margin: 0 auto;
}

.span-container-sec2-BL{
  z-index: 3;
  position: relative;
}

#span-line-sec3-UP{
  height: 22px;
  background-color: var(--body-span-line-chikai);
  transform: skewY(-5deg) translateY(-150px);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

/* Section 3 Start */


/* Scooped Start */

h1.subtitle{
  color: var(--body-content-span-text-color);
  font-size: 4rem;
  width: fit-content;
  height: 5rem;
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