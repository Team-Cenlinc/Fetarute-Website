<template>
  <div class="content-viewer">

    <div class="content-container-section-2-wrapper">
    <section class="content-container-section-1">
      <div id="line-cross-in-L-1"></div>
      <div id="content-container-line-1">
        <div id="content-station-1"></div>
      </div>
      <div id="line-cross-out-L-1"></div>
      <div id="content-container-1">
        <h1 style="border-bottom: 1rem solid var(--body-span-line-syapole); text-anchor: end;" class="subtitle">{{ $t("bodyContent.memberJoin") }}</h1>
          <p>
            <br>{{ $t("bodyContent.introFirstLineJoin") }}
            <br>{{ $t("bodyContent.introSecondLineJoin") }}
            <br>
            <br><a type="button" href="https://qm.qq.com/cgi-bin/qm/qr?k=edb-q-Uwu4U04CNvJ6U_eQWeUzZTAXrp&jump_from=webapi&authKey=AEeHlCj4nU2ttBdi75gCrVS6VNR71p+ZUOh9If8HW7wVbe61PUcRFT+X8lR2D5eP" target="_blank" class="button-link">QQ门户群</a>
            <a type="button" href="https://www.twitter.com/Fetarute" target="_blank" class="button-link-alter">Twitter</a>
            <a type="button" href="https://discord.gg/EZQS2FgZCf" target="_blank" class="button-link-discord">Discord</a>
          </p>
      </div>

    </section>
    </div>

    <div class="content-span-body">
      <div id="span-line"></div>
    </div>

    <div class="content-container-section-1-wrapper">
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
  name: "mobileBodyContentViewerJoin",
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
  z-index: 0;
  position: relative;
}

#line-cross-in-L-1{
  float: left;
  width: 4rem;
  height: 4rem;
  background-color: transparent;
  border-top-left-radius: 5rem;
  border-left: 1rem solid var(--body-span-line-pyutocor);
  border-top: 1rem solid var(--body-span-line-pyutocor);
  transform: translate(3rem, 1.5rem);
}

#content-container-line-1 {
  float: left;
  height: 20em;
  width: 1rem;
  background-image: linear-gradient(to bottom, var(--body-span-line-pyutocor), var(--body-span-line-syapole));
  transform: translate(-1rem, 5.5rem);
}

#line-cross-out-L-1{
  float: left;
  width: 4rem;
  height: 4rem;
  background-color: transparent;
  border-bottom-left-radius: 5rem;
  border-left: 1rem solid var(--body-span-line-syapole);
  border-bottom: 1rem solid var(--body-span-line-syapole);
  transform: translate(-2rem, 25rem); /*Section 1 Original Calc Point*/
}

#content-container-1{
  background-color: transparent;
  transform: translateY(10rem);
  text-align: left;
  margin: 150px 0 0 20%;
}

/* Section 2 Start */

.content-container-section-2{
  height: 18rem;
  z-index: 0;
  position: relative;
  background-color: var(--body-content-bg);
  transform: translateY(20rem);
  background-image: url('../../assets/background/abstract-small.webp');
  background-position: center;
  background-origin: content-box;
  background-size: cover;
  background-repeat: repeat-x;
}

.content-container-section-2-wrapper{
  z-index: 1;
  position: relative;
}

#span-line-sec2{
  height: 1rem;
  background-color: var(--body-span-line-syapole);
  transform: translateY(26rem);
  box-shadow: 0 5px var(--body-content-bg), 0 -5px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

/* Scooped Start */

h1.subtitle{
  color: var(--body-content-span-text-color);
  font-size: 2rem;
  width: max-content;
  height: 3rem;
  align-self: self-start;
  transform: translateY(-3rem);
  margin-left: 20%;
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
  max-width: 90%;
  color: var(--body-content-span-text-color);
  font-size: 0.8rem;
  transform: translateY(-1rem);
}

/* Button Start */

a{
  text-decoration: none;
  text-align: center;
  font-size: 0.8rem;
  color: var(--body-content-span-text-color);
}

.button-link{
  height: 30px;
  width: 80px;
  font-size: 1rem;
  border-width: 0;
  border-radius: 3px;
  border-bottom: 5px solid var(--body-span-line-pyutocor);
  transition: 200ms ease-out;
  color: var(--header-color);
  background-color: var(--body-content-bg-gray);
}
.button-link:hover{
  background-color: var(--body-span-line-pyutocor);
  color: var(--header-color);
}

.button-link-alter{
  height: 30px;
  width: 80px;
  font-size: 1rem;
  border-width: 0;
  border-radius: 3px;
  border-bottom: 5px solid var(--body-span-line-syapole);
  transition: 200ms ease-out;
  color: var(--header-color);
  background-color: var(--body-content-bg-gray);
  transform: translateX(3rem);
}
.button-link-alter:hover{
  background-color: var(--body-span-line-syapole);
  color: var(--header-color);
}

.button-link-discord{
  height: 30px;
  width: 80px;
  font-size: 1rem;
  border-width: 0;
  border-radius: 3px;
  border-bottom: 5px solid var(--body-span-line-chikai);
  transition: 200ms ease-out;
  color: var(--header-color);
  background-color: var(--body-content-bg-gray);
  transform: translateX(6rem);
}
.button-link-discord:hover{
  background-color: var(--body-span-line-chikai);
  color: var(--header-color);
}
</style>