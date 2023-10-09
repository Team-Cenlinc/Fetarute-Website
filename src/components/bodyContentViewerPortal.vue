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
        <h1 style="border-bottom: 1.75rem solid var(--body-span-line-southpark); text-anchor: end;" class="subtitle">{{ $t("bodyContent.memberPortal") }}</h1>
          <p>
            <br>{{ $t("bodyContent.introFirstLinePortal") }}
            <br>
          </p>
              <div class="portal">
                <div class="content-container">
                  <div class="link-forward">
                    <p><br><a class="portal-link" href="https://wiki.hydcraft.cn/%E9%A6%96%E9%A1%B5">
                      <v-avatar
                        rounded="0"
                        tile
                        size="3rem">
                      <img
                          alt="Avatar"
                          src="../assets/external-logos/HydCraft.webp"
                      >
                    </v-avatar>{{ $t("friendlyServers.hydCraft") }}</a></p>
                    <p><br><a class="portal-link" href="https://wiki.knebulae.com/wiki/%E9%A6%96%E9%A1%B5">
                      <v-avatar
                          :tile="true"
                          size="3rem">
                        <img
                            alt="Avatar"
                            src="../assets/external-logos/NebulaeCraft.webp"
                        >
                      </v-avatar>{{ $t("friendlyServers.nebulaeCraft") }}</a></p>
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
  name: "bodyContentViewerAdmins",
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
  height: 30rem;
  z-index: 1;
  position: relative;
  margin-bottom: -900px;
  transform: translateY(-29rem);
}

.content-container-section-1-wrapper{
  z-index: 0;
  position: relative;
}

#line-cross-in-L-1{
  float: left;
  width: 5rem;
  height: 5rem;
  background-color: transparent;
  border-top-left-radius: 5rem;
  border-left: 1.375rem solid var(--body-span-line-southpark);
  border-top: 1.375rem solid var(--body-span-line-southpark);
  transform: translate(7.225rem, 4.125rem);
}

#content-container-line-1 {
  float: left;
  height: 29rem;
  width: 1.375rem;
  background-image: linear-gradient(to bottom, var(--body-span-line-southpark), var(--body-span-line-coston));
  transform: translate(2.25rem, 9.125rem);
}

#line-cross-out-L-1{
  float: left;
  width: 5rem;
  height: 5rem;
  background-color: transparent;
  border-bottom-left-radius: 5rem;
  border-left: 1.375rem solid var(--body-span-line-coston);
  border-bottom: 1.375rem solid var(--body-span-line-coston);
  transform: translate(0.875rem, 38rem); /*Section 1 Original Calc Point*/
}

#content-container-1{
  background-color: transparent;
  transform: translateY(18.75rem);
  text-align: left;
  margin: 150px 0 0 25%;
}

/* Section 2 Start */

.content-container-section-2{
  height: 32rem;
  z-index: 0;
  position: relative;
  background-color: var(--body-content-bg);
  transform: translateY(6rem);
  background-image: url('../assets/background/abstract-small.webp');
  background-position: center;
  background-origin: content-box;
  background-repeat: repeat-x;
}

.content-container-section-2-wrapper{
  z-index: 1;
  position: relative;
}

#span-line-sec2{
  height: 1.375rem;
  background-color: var(--body-span-line-coston);
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
  max-width: 100%;
  color: var(--body-content-span-text-color);
  font-size: 1.2rem;
  transform: translateY(-3rem);
}

/* Portal Sec. Start */

.content-container{
  float: left;
  width: 32.5%;
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