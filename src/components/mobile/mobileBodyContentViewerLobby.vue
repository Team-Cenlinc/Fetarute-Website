<template>
  <div class="content-viewer">

    <div class="content-container-section-1-wrapper">
    <section class="content-container-section-1">
      <div id="line-cross-in-L-1"></div>
      <div id="content-container-line-1">
        <div id="content-station-1"></div>
      </div>
      <div id="content-container-1">
        <h1 style="border-bottom: 1rem solid var(--body-span-line-kitajuku);" class="subtitle">{{ $t("bodyContent.lobbyWorld") }}</h1>
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
        <h3 style="border-bottom: 0.5rem solid var(--body-span-line-pyutocor);" class="subtitle">04 - {{ $t("bodyContent.lobbyBegin") }}<span class="material-symbols-outlined">hub</span></h3>
        <p>
          <br>{{ $t("bodyContent.introFirstLineLobby") }}
          <br>{{ $t("bodyContent.introSecondLineLobby") }}
        </p>
      </div>
      <div id="line-cross-out-R-1"></div>
    </section>
    </div>

    <div class="content-image-mobile">
    <span>
        <v-img
            id="content-sec2-pic"
            src="../../assets/content/Waterside-Line.webp"
            lazy-src="../../assets/content/lazy/Waterside-Line-Lazy.webp"
            max-width="25%"
            max-height="35%"
        >
          <template v-slot:placeholder>
              <v-progress-circular
                  indeterminate
                  color="grey lighten-2"
              ></v-progress-circular>
          </template>
        </v-img>
      </span>
    </div>

    <div class="content-span-body">
      <div id="span-line-sec2"></div>
    </div>

  </div>
</template>

<script>
export default {
  name: "mobileBodyContentViewerLobby",
  data: () => ({
    isSmallScreen: false,
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

  background-image: url('../../assets/background/abstract-small.webp');
  background-position: center;
  background-origin: content-box;
  background-size: cover;
  background-repeat: repeat-x;
}

.content-container-section-1-wrapper{
  z-index: 0;
  position: relative;
}

#line-cross-in-L-1{
  float: right;
  width: 4rem;
  height: 4rem;
  background-color: transparent;
  border-top-left-radius: 5rem;
  border-left: 1rem solid var(--body-span-line-duka);
  border-top: 1rem solid var(--body-span-line-duka);
  transform: translateY(-13.75rem);/*Section 1 Original Calc Point*/
}

#content-container-line-1{
  float: right;
  height: 100%;
  width: 1rem;
  background-color: var(--body-span-line-duka);
  transform: translate(1rem, -10rem);
}

#content-station-1{
  height: 1rem;
  width: 2rem;
  background-color: var(--body-span-line-duka);
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
  border-left: 1rem solid var(--body-span-line-duka);
  border-bottom: 1rem solid var(--body-span-line-duka);
  transform: translate(5rem, 5rem); /*Section 1 Original Calc Point*/
}

#span-line{
  height: 1rem;
  background-color: var(--body-span-line-coston);
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

  background-image: url('../../assets/background/abstract-small-2.webp');
  background-position: center;
  background-origin: content-box;
  background-size: cover;
  background-repeat: repeat-x;
}

.content-container-section-2-wrapper{
  z-index: 0;
  position: relative;
}

#line-cross-in-R-1{
  float: left;
  width: 4rem;
  height: 4rem;
  background-color: transparent;
  border-top-right-radius: 5rem;
  border-right: 1rem solid var(--body-span-line-syapole);
  border-top: 1rem solid var(--body-span-line-syapole);
  transform: translateY(-10rem); /*Section 2 Original Calc Point*/

}

#content-container-line-2{
  float: left;
  height: 100%;
  width: 1rem;
  background-color: var(--body-span-line-syapole);
  transform: translate(-1rem, -6rem);
}

#content-station-2{
  height: 1rem;
  width: 2rem;
  background-color: var(--body-span-line-syapole);
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

#content-sec2-pic {
  float: right;
  transform: translate(-5rem, -12.5rem);
  box-shadow: 0.5rem 0.75rem var(--body-span-line-pyutocor);
}

#line-cross-out-R-1{
  float: left;
  width: 4rem;
  height: 4rem;
  background-color: transparent;
  border-bottom-right-radius: 5rem;
  border-right: 1rem solid var(--body-span-line-syapole);
  border-bottom: 1rem solid var(--body-span-line-syapole);
  transform: translate(-5rem, 9.325rem); /*Section 2 Original Calc Point*/
}

#span-line-sec2{
  height: 1rem;
  background-color: var(--body-span-line-chikai);
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