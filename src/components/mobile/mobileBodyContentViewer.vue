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

    <section class="content-container-section-1">
      <div id="line-cross-in-L-1"></div>
      <div id="content-container-line-1">
        <div id="content-station-1"></div>
      </div>
      <div id="content-container-1">
        <h1 style="border-bottom: 1rem solid var(--body-span-line-syapole);" class="subtitle">{{ $t("bodyContent.creativeWorld") }}</h1>
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
      <div id="line-cross-out-R-1"></div>
    </section>

    <div class="content-span-body">
      <div id="span-line-sec2"></div>
    </div>

    <div class="span-container-sec2-BL">
      <h1 style="border-bottom: 1rem solid var(--body-span-line-chikai);" class="subtitle" id="gallery">{{ $t("bodyContent.gallery") }}</h1>
      <v-carousel cycle interval=6000 :show-arrows="false" delimiter-icon="mdi-minus" id="span-sec2-BL-carousel" height="400">
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
import Cesynlinc from "../../assets/content/Cesynlinc-Optimal.png"
import Syapole from "../../assets/content/Syapole-20th-North-Optimal.png"
import Southpark from "../../assets/content/Southpark-Optimal.png"
import Central from "../../assets/content/Morning-Central-Optimal.png"

export default {
  name: "mobileBodyContentViewer",
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
  margin-bottom: -600px;
}

#rectangle-station{
  height: 16px;
  width: 40px;
  margin-left: 18px;
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
  border-bottom-left-radius: 90px;
  border-left: 16px solid var(--body-content-span-line-creative);
  border-bottom: 16px solid var(--body-content-span-line-creative);
  transform: translateY(-400px);
}

.span-railway-line{
  height: 16px;
  background-color: var(--body-content-span-line-creative);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  transform: skewY(3deg) translateY(65px);
  z-index: 3;
  position: relative;
}

.span-expand{
  height: 130px;
  background-color: var(--body-content-bg);
  transform: skewY(3deg) translateY(195px);
  box-shadow: 0 -20px 20px 8px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

/* Section 1 Start */

.content-container-section-1{
  height: 300px;
  z-index: 2;
  position: relative;
}

#line-cross-in-L-1{
  float: right;
  width: 70px;
  height: 70px;
  background-color: transparent;
  border-top-left-radius: 90px;
  border-left: 16px solid var(--body-span-line-syapole);
  border-top: 16px solid var(--body-span-line-syapole);
  transform: translateY(-220px);/*Section 1 Original Calc Point*/
}

#content-container-line-1{
  float: right;
  height: 100%;
  width: 16px;
  background-color: var(--body-span-line-syapole);
  transform: translate(16px, -150px);
}

#content-station-1{
  height: 16px;
  width: 30px;
  background-color: var(--body-span-line-syapole);
  transform: translate(-30px, 10rem);
}

#content-container-1{
  background-color: transparent;
  transform: translateY(-20px);
  text-align: center;
  margin: 200px 0 0 32%;
}

#line-cross-out-L-1{
  float: right;
  width: 70px;
  height: 70px;
  background-color: transparent;
  border-bottom-left-radius: 90px;
  border-left: 16px solid var(--body-span-line-syapole);
  border-bottom: 16px solid var(--body-span-line-syapole);
  transform: translate(86px, 100px); /*Section 1 Original Calc Point*/
}

#span-line{
  height: 16px;
  background-color: var(--body-span-line-southpark);
  transform: skewY(-5deg) translateY(-145px);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

/* Section 2 Start */

.content-container-section-2{
  height: 300px;
  z-index: 1;
  position: relative;
}

#line-cross-in-R-1{
  float: left;
  width: 70px;
  height: 70px;
  background-color: transparent;
  border-top-right-radius: 90px;
  border-right: 16px solid var(--body-span-line-kitajuku);
  border-top: 16px solid var(--body-span-line-kitajuku);
  transform: translateY(-150px); /*Section 1 Original Calc Point*/

}

#content-container-line-2{
  float: left;
  height: 100%;
  width: 16px;
  background-color: var(--body-span-line-kitajuku);
  transform: translate(-16px, -80px);
}

#content-station-2{
  height: 16px;
  width: 30px;
  background-color: var(--body-span-line-kitajuku);
  transform: translate(10px, 10rem);
}

#content-container-2{
  height: 40px;
  background-color: transparent;
  margin: -60px 0 0 120px;
  transform: translate(-10px, -10px);
  line-height: 1rem;
  padding-right: 3rem;
}

#line-cross-out-R-1{
  float: left;
  width: 70px;
  height: 70px;
  background-color: transparent;
  border-bottom-right-radius: 90px;
  border-right: 16px solid var(--body-span-line-kitajuku);
  border-bottom: 16px solid var(--body-span-line-kitajuku);
  transform: translate(-86px, 180px); /*Section 2 Original Calc Point*/
}

#span-line-sec2{
  height: 16px;
  background-color: var(--body-span-line-hokuriku);
  transform: skewY(2deg) translateY(-75px);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

/* Span Sec.2 Below(BL) Start */

.span-container-sec2-BL{
  height: 600px;
}

#span-sec2-BL-carousel{
  width: 60%;
  height: 20%;
  margin: 0 auto;
  alignment: center;
}

#gallery{
  margin: 0 auto;
  transform: translateY(-50px);
}

.span-container-sec2-BL{
  z-index: 3;
  position: relative;
}

#span-line-sec3-UP{
  height: 22px;
  background-color: var(--body-span-line-chikai);
  transform: skewY(-5deg) translateY(-75px);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

/* Section 3 Start */



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
</style>