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
        <h1 style="border-bottom: 1.75rem solid var(--body-span-line-syapole); text-anchor: end;" class="subtitle">{{ $t("bodyContent.memberThanks") }}</h1>
          <p>
            <br>{{ $t("bodyContent.introFirstLineThanks") }}
            <br>{{ $t("bodyContent.introSecondLineThanks") }}
            <br>
            <br><v-avatar
              size="3rem"
              tile
              >
            <img
                alt="Avatar"
                src="../assets/avatar/Acatine-Avatar.png"
            >
            </v-avatar>
            {{ $t("admins.acatine") }}
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
  name: "bodyContentViewerConclusion",
  data: () => ({
    isSmallScreen: false,
  }),
}
</script>

<style scoped>
.content-viewer{
  background-color: var(--body-content-bg);
  height: 30rem;
}

/* Section 1 Start */

.content-container-section-1{
  height: 32rem;
  z-index: 1;
  position: relative;
  margin-bottom: -900px;
  transform: translateY(-29rem);
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
  border-top-right-radius: 5rem;
  border-right: 1.375rem solid var(--body-span-line-syapole);
  border-top: 1.375rem solid var(--body-span-line-syapole);
  transform: translate(-3.625rem, 2.625rem);
}

#content-container-line-1 {
  float: right;
  height: 32.5rem;
  width: 1.375rem;
  background-image: linear-gradient(to bottom, var(--body-span-line-syapole), var(--body-span-line-southpark));
  transform: translate(1.375rem, 7.625rem);
}

#line-cross-out-L-1{
  float: right;
  width: 5rem;
  height: 5rem;
  background-color: transparent;
  border-bottom-right-radius: 5rem;
  border-right: 1.375rem solid var(--body-span-line-southpark);
  border-bottom: 1.375rem solid var(--body-span-line-southpark);
  transform: translate(2.765rem, 40rem); /*Section 1 Original Calc Point*/
}

#content-container-1{
  background-color: transparent;
  transform: translateY(18.75rem);
  text-align: left;
  margin: 150px 0 0 10%;
}

/* Section 2 Start */

.content-container-section-2{
  height: 32rem;
  z-index: 0;
  position: relative;
  background-color: var(--body-content-bg);
  transform: translateY(6rem);
  background-image: url('../assets/background/abstract-small-2.webp');
  background-position: center;
  background-origin: content-box;
  background-repeat: repeat-x;
}

#span-line-sec2{
  height: 1.375rem;
  background-color: var(--body-span-line-southpark);
  transform: translateY(7rem);
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
  transform: translateY(-4rem);
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
  max-width: 80%;
  color: var(--body-content-span-text-color);
  font-size: 1.2rem;
  transform: translateY(-3rem);
}
</style>