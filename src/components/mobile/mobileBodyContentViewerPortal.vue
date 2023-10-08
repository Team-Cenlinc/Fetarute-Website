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
        <h1 style="border-bottom: 1rem solid var(--body-span-line-southpark); text-anchor: end;" class="subtitle">{{ $t("bodyContent.memberPortal") }}</h1>
        <p>
          <br>{{ $t("bodyContent.introFirstLinePortal") }}
          <br>
        </p>
        <div class="portal">
          <div class="content-container">
            <div class="link-forward">
              <p><br><a class="portal-link" href="https://wiki.hydcraft.cn/%E9%A6%96%E9%A1%B5">{{ $t("friendlyServers.hydCraft") }}</a></p>
              <p><br><a class="portal-link" href="https://wiki.knebulae.com/wiki/%E9%A6%96%E9%A1%B5">{{ $t("friendlyServers.nebulaeCraft") }}</a></p>
            </div>
          </div>
        </div>
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
  name: "mobileBodyContentViewerPortal",
  data: () => ({
    isSmallScreen: false,
  }),
}
</script>

<style scoped>
.content-viewer{
  background-color: var(--body-content-bg);
  height: 20rem;
}

/* Section 1 Start */

.content-container-section-1{
  height: 20rem;
  z-index: 1;
  position: relative;
  margin-bottom: -900px;
  transform: translateY(-23rem);
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
  border-left: 1rem solid var(--body-span-line-southpark);
  border-top: 1rem solid var(--body-span-line-southpark);
  transform: translate(3rem, 1.5rem);
}

#content-container-line-1 {
  float: left;
  height: 20em;
  width: 1rem;
  background-image: linear-gradient(to bottom, var(--body-span-line-southpark), var(--body-span-line-coston));
  transform: translate(-1rem, 5.5rem);
}

#line-cross-out-L-1{
  float: left;
  width: 4rem;
  height: 4rem;
  background-color: transparent;
  border-bottom-left-radius: 5rem;
  border-left: 1rem solid var(--body-span-line-coston);
  border-bottom: 1rem solid var(--body-span-line-coston);
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
  background-color: var(--body-span-line-coston);
  transform: translateY(23.5rem);
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
  align-self: start;
  margin-left: 15%;
  transform: translateY(-2rem);
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
  transform: translateY(0rem);
}

/* Portal Sec. Start */

.content-container{
  float: left;
  width: 35%;
}

.link-forward{
  position: relative;
  text-align: left;
}

.portal-link{
  color: var(--header-router-color-text);
  text-decoration: none;
  background-color: transparent;
  transition: 225ms ease-out;
  position: relative;
  display: block;
}

.portal-link:hover{
  z-index: 1;
  color: var(--error-link-hover-color);
  background-color: transparent;
}

.portal-link:after, .portal-link:before{
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 100%;
  background-color: transparent;
  z-index: -2;
}

.portal-link:before{
  transition: .3s;
  background-color: var(--body-span-line-coston);;
  z-index: -1;
}

.portal-link:hover:after, .portal-link:hover:before{
  width: 100%;
}

.content-container strong{
  float: right;
  transform: translateY(3rem);
  color: var(--body-content-span-text-color);
  font-size: 2rem;
  width: fit-content;
}
</style>