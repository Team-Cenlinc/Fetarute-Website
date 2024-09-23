<template>
  <div class="not-found-page">
    <section class="status-declaration">
      <div class="text-show">
        <p><strong>404</strong></p>
        <p>{{ $t("error.notFoundText") }}</p>
      </div>
      <div class="presentation-line">
        <div id="present-body"></div>
        <div id="present-station"></div>
        <div id="turn-portal"></div>
      </div>
    </section>

    <section class="portal">
      <div class="content-container">
        <p><strong style="border-bottom: 1rem solid var(--body-span-line-syapole);">{{ $t("headerNav.portal") }}</strong></p>
        <div class="link-forward">
          <p><br><a class="portal-link" href="/#/">{{ $t("headerNav.homePage") }}</a></p>
          <p><br><a class="portal-link" href="/#/tools/status">{{ $t("headerNav.serverPlayerCount") }}</a></p>
          <p><br><a class="portal-link" href="https://twitter.com/Fetarute">{{ $t("headerNav.twitter") }}</a></p>
          <p><br><a class="portal-link" href="https://utils.fetarute.org/wiki/index.php/%E9%A6%96%E9%A1%B5">{{ $t("headerNav.wikiLink") }}</a></p>
          <p><br><a class="portal-link" href="https://team-cenlinc.github.io/FesGen/">FesGen</a></p>
        </div>
      </div>

      <div class="content-guideline">
        <div id="side-line"></div>
        <div id="side-station-1"></div>
        <div id="side-station-terminal"></div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "mobileErrorNotFoundViewer",
}
</script>

<style scoped>

div.not-found-page{
  background-color: var(--body-content-bg);
  height: 800px;

  background-image: url('../../../assets/background/abstract.webp');
  background-position: center;
  background-origin: content-box;
  background-size: cover;
}

.status-declaration{
  padding-top: 80px;
  width: 100%;
}

.text-show{
  text-align: center;
  padding-bottom: 3rem;
  padding-top: 2rem;
}

#present-body{
  width: 100%;
  height: 1rem;
  background-color: var(--error-span-line);
  box-shadow: 0 5px var(--body-content-bg);
  z-index: 2;
  position: relative;
}

#present-station{
  width: 1rem;
  height: 2rem;
  background-color: var(--body-content-bg);
  border: 3px dashed var(--error-span-line);
  margin: 0 auto;
  transform: translateY(-3rem);
}

#turn-portal{
  float: left;
  width: 5rem;
  height: 5rem;
  margin-left: 2rem;
  background-color: transparent;
  border-top-left-radius: 5rem;
  transform: translateY(-3rem);
  border-left: 1rem solid var(--error-span-line);
  border-top: 1rem solid var(--error-span-line);
}

.text-show strong{
  color: var(--body-content-span-text-color);
  font-size: 2rem;
  width: fit-content;
  align-self: center;
}

/* Portal Sec. Start */

.content-container{
  float: left;
}

.link-forward{
  transform: translate(-1rem, 6rem);
  position: absolute;
  display:grid;
  text-align: left;
}

.portal-link{
  color: var(--header-router-color-text);
  text-decoration: none;
  background-color: var(--body-content-bg);
  transition: 225ms ease-out;
  position: relative;
  display: block;
}

.portal-link:hover{
  z-index: 1;
  color: var(--error-link-hover-color);
  background-color: var(--body-content-bg);
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
  background-color: var(--body-span-line-syapole);;
  z-index: -1;
}

.portal-link:hover:after, .portal-link:hover:before{
  width: 100%;
}

.content-container strong{
  float: left;
  transform: translate(-1rem ,3rem);
  color: var(--body-content-span-text-color);
  font-size: 1.5rem;
  width: fit-content;
}

#side-line{
  transform: translate(2rem, 2rem);
  height: 25rem;
  width: 1rem;
  position: absolute;
  margin-right: 2.5rem;
  background-image: linear-gradient(to bottom, var(--error-span-line), var(--body-content-span-line-creative));
}

#side-station-terminal{
  position: absolute;
  transform: translate(1.25rem, 27rem);
  width: 2.5rem;
  height: 1rem;
  background-color: var(--body-content-span-line-creative);
}

p{
  color: var(--body-content-span-text-color);
  font-size: 1rem;
}
</style>