<template>
  <div class="content-viewer">

    <div class="content-container-section-1-wrapper">
    <section class="content-container-section-1">
      <div id="line-cross-in-L-1"></div>
      <div id="content-container-line-1">
        <div id="content-station-1"></div>
      </div>
      <div id="line-cross-out-L-1"></div>
      <div id="content-container-1">
        <h1 style="border-bottom: 1rem solid var(--body-span-line-syapole); text-anchor: end;" class="subtitle">{{ $t("bodyContent.memberConclusion") }}</h1>
          <p>
            <br>{{ $t("bodyContent.introFirstLineConclusion") }}
            <br>{{ $t("bodyContent.introSecondLineConclusion") }}
            <br>
            <br><v-avatar
              tile
              size="1.5rem">
            <img
                alt="Avatar"
                src="../../assets/avatar/Thomasxyx-Avatar.jpg"
            >
            </v-avatar>
            {{ $t("admins.thomasxiao") }}
          </p>
      </div>


    </section>
    </div>

    <div class="content-span-body">
      <div id="span-line"></div>
    </div>

    <div class="content-container-section-2-wrapper">
      <section class="content-container-section-2">
      </section>
    </div>

    <div class="content-span-body">
      <div id="span-line-sec2"></div>
    </div>

  </div>
</template>

<script>

export default {
  name: "mobileBodyContentViewerConclusion",
  data: () => ({
    isSmallScreen: false,
  }),
}
</script>

<style scoped>
.content-viewer{
  background-color: var(--body-content-bg);
  height: 18rem;
}

/* Section 1 Start */

.content-container-section-1{
  height: 20rem;
  z-index: 1;
  position: relative;
  margin-bottom: -900px;
  transform: translateY(-20rem);
}

.content-container-section-1-wrapper{
  z-index: 1;
  position: relative;
}

#line-cross-in-L-1{
  float: right;
  width: 4rem;
  height: 4rem;
  background-color: transparent;
  border-top-right-radius: 5rem;
  border-right: 1rem solid var(--body-span-line-chikai);
  border-top: 1rem solid var(--body-span-line-chikai);
  transform: translate(-3rem, 4rem);
}

#content-container-line-1 {
  float: right;
  height: 18rem;
  width: 1rem;
  background-image: linear-gradient(to bottom, var(--body-span-line-chikai), var(--body-span-line-pyutocor));
  transform: translate(1rem, 8rem);
}

#line-cross-out-L-1{
  float: right;
  width: 4rem;
  height: 4rem;
  background-color: transparent;
  border-bottom-right-radius: 5rem;
  border-right: 1rem solid var(--body-span-line-pyutocor);
  border-bottom: 1rem solid var(--body-span-line-pyutocor);
  transform: translate(2rem, 26rem); /*Section 1 Original Calc Point*/
}

#content-container-1{
  background-color: transparent;
  transform: translateY(10rem);
  text-align: left;
  margin: 150px 0 0 10%;
}

/* Section 2 Start */

.content-container-section-2{
  height: 18rem;
  z-index: 0;
  position: relative;
  background-color: var(--body-content-bg);
  transform: translateY(23.5rem);
  background-image: url('../../assets/background/abstract-small-2.webp');
  background-position: center;
  background-origin: content-box;
  background-size: cover;
  background-repeat: repeat-x;
}

#span-line-sec2{
  height: 1rem;
  background-color: var(--body-span-line-pyutocor);
  transform: translateY(27rem);
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
  align-self: center;
  transform: translateY(0rem);
}

h3.subtitle{
  color: var(--body-content-span-text-color);
  font-size: 0.9rem;
  width: fit-content;
  height: 1.8rem;
}

v-progress-circular{
  align-self: center;
  justify-self: center;
}

p{
  max-width: 80%;
  color: var(--body-content-span-text-color);
  font-size: 0.8rem;
  transform: translateY(2rem);
}
</style>