<template>
  <header>
    <div class="header-flex" v-bind:class="{'after-scroll-bg': scrollPassed, 'before-scroll-bg': !scrollPassed}" data-app>
      <h2>
        <small>
          <a href="/#/" class="header-nav-home">
            <v-avatar
                v-if="darkMode||!scrollPassed"
                tile
                size="2rem">
              <img
                  alt="Avatar"
                  src="../../../../assets/avatar/Sealer-Dark.webp"
              >
            </v-avatar>
            <v-avatar
                v-if="!darkMode&&scrollPassed"
                tile
                size="2rem">
              <img
                  alt="Avatar"
                  src="../../../../assets/avatar/Sealer-Light.webp"
              >
            </v-avatar>
          </a>
        </small>
      </h2>
      <span>
        <input type="button" @click.stop="drawer = !drawer" class="material-symbols-outlined header-nav" value="menu">
        <input type="button" @click="changeModeAnimation" v-if="darkMode" class="material-symbols-outlined header-nav style-option" value="dark_mode">
        <input type="button" @click="changeModeAnimation" v-if="!darkMode" class="material-symbols-outlined header-nav style-option" value="light_mode">
        <v-menu offset-y v-bind:dark="darkMode" buttom origin="center center" transition="slide-y-transition" content-class="lang-menu" close-on-click="close-on-click" open-on-hover>
          <template v-slot:activator="{ on, attrs }">
            <input v-bind="attrs" v-on="on" type="button" class="material-symbols-outlined header-nav" value="translate">
          </template>
          <v-list>
            <v-list-item
                v-for="(lang, index) in languageList"
                :key="index"
                link
            >
              <v-list-item-title @click="modifyLanguage(lang.key)">{{ lang.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-navigation-drawer v-model="drawer" right app temporary link v-bind:dark="darkMode">
          <v-list nav dense rounded>
            <v-list-item-group>
              <v-list-item @click.stop="drawer = !drawer">
                <input type="button" class="material-symbols-outlined drawer-close-icon" value="close">
              </v-list-item>
              <router-link to="/" active-class="router-link-active">
                <v-list-item>
                  <v-list-item-title>{{ $t("headerNav.homePage") }}</v-list-item-title>
                </v-list-item>
              </router-link>
              <router-link to="/tools/status" active-class="router-link-active">
                <v-list-item>
                  <v-list-item-title>{{ $t("headerNav.serverPlayerCount") }}</v-list-item-title>
                </v-list-item>
              </router-link>
              <v-list-item link href="https://status.fetarute.info/status/all" target="_blank" :title="$t('headerNav.chineseLangOnly')">
                <v-list-item-title>{{ $t("headerNav.serverStatus") }}</v-list-item-title>
              </v-list-item>
              <v-list-item link href="https://www.fetarute.org/wiki/index.php/%E9%A6%96%E9%A1%B5" target="_blank" :title="$t('headerNav.chineseLangOnly')">
                <v-list-item-title>{{ $t("headerNav.wikiLink") }}</v-list-item-title>
              </v-list-item>
              <v-list-item :disabled="true">
                <v-list-item-title>{{ $t("headerNav.onlineMap") }}</v-list-item-title>
              </v-list-item>
              <v-list-item link href="https://map.creative.fetarute.org" target="_blank">
                <v-list-item-title>{{ $t("headerNav.onlineMapCreative") }}</v-list-item-title>
              </v-list-item>
              <v-list-item link href="https://map.survival.fetarute.org" target="_blank">
                <v-list-item-title>{{ $t("headerNav.onlineMapSurvival") }}</v-list-item-title>
              </v-list-item>
              <v-list-item link href="https://map.lobby.fetarute.org" target="_blank">
                <v-list-item-title>{{ $t("headerNav.onlineMapLobby") }}</v-list-item-title>
              </v-list-item>
              <v-list-item :disabled="true">
                <v-list-item-title>{{ $t("headerNav.socialMedia") }}</v-list-item-title>
              </v-list-item>
              <v-list-item link href="https://twitter.com/Fetarute" :title="$t('headerNav.externalLink')">
                <v-list-item-title>{{ $t("headerNav.twitter") }}<span class="material-symbols-outlined">link</span></v-list-item-title>
              </v-list-item>
              <v-list-item :disabled="true">
                <v-list-item-title>{{ $t("headerNav.toolBox") }}</v-list-item-title>
              </v-list-item>
              <v-list-item link href="https://team-cenlinc.github.io/FesGen/" target="_blank" :title="$t('headerNav.chineseLangOnly')">
                <v-list-item-title>FesGen</v-list-item-title>
              </v-list-item>
              <v-list-item link href="https://map.survival.fetarute.org/#Towny;mapday;-543,64,750;3" target="_blank" :title="$t('headerNav.chineseLangOnly')">
                <v-list-item-title>SURnorth MyFTA-Web</v-list-item-title>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-navigation-drawer>
      </span>
    </div>
  </header>
</template>

<script>
import anime from 'animejs/lib/anime.es.js';
import i18n from "@/locales/i18n";

export default {
  name: "mobileHeaderViewer",
  props: ["title"],
  data: () => ({
    darkMode: false,
    drawer: false,
    scrollPassed: true,
    languageList: [
      {
        title: '简体中文',
        key: 'zh_cn'
      },
      {
        title: "日本語",
        key: 'ja_jp'
      },
      {
        title: "English",
        key: 'en_us'
      }
    ]
  }),
  mounted() {
    const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (darkMode && darkMode.matches) {
      document.body.classList.add('dark');
      this.darkMode = true
    }
    darkMode && darkMode.addEventListener('change', e => {
      if (e.matches) {
        document.body.classList.add('dark');
        this.darkMode = true
      } else {
        document.body.classList.remove('dark');
        this.darkMode = false
      }
    });

    this.changeColorTheme()
  },
  methods:{
    changeModeAnimation () {
      anime({
        targets: 'input.style-option',
        translateY: -100,
        direction: 'alternate',
        duration: 100
      })
      this.darkMode = !this.darkMode
      this.changeColorTheme()
    },
    changeColorTheme() {
      if (this.darkMode){
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
      this.$emit('colorThemeChange', this.darkMode)
    },
    modifyLanguage(lang_key) {
      i18n.locale = lang_key
      localStorage.setItem("localeLanguage", lang_key)
    }
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  }
}
</script>

<style scoped>
header .before-scroll-bg{
  --header-color: #e5e5e5;
  --header-nav-color: #e5e5e5;
  --header-nav-color-hover: #c5c5c5;
  --header-lang-menu-bg-hover: #a6a6a6ff;
}

header{
  z-index: 3;
  position: fixed;
  transition: 225ms ease-out;
}

a.header-nav-home{
  transform: translate(1rem, 0.5rem);
}

.after-scroll-bg{
  transition: 225ms ease-out;
  background-color: var(--header-background-color);
  box-shadow: 0 0 1rem var(--header-shade-color);
  color: #1f1f1f;
}

header .header-flex {
  height: 50px;
  width: 100%;
  display: -webkit-flex; /* Safari */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  z-index: 3;
  transition: 225ms ease-out;
  position: fixed;
}

header .header-nav-home {
  display: flex;
  padding: 0 0.6em;
  line-height: 50px;
  color: var(--header-nav-color);
  text-decoration: none;
  float: right;
  position: fixed;
}

header .header-nav{
  display: block;
  padding: 0 1rem;
  line-height: 50px;
  color: var(--header-nav-color);
  text-decoration: none;
  transition: 225ms ease-out;
  float: right;
}

.material-symbols-outlined {
  font-variation-settings:
      'FILL' 0,
      'wght' 600,
      'GRAD' 0,
      'opsz' 48
}

input.header-nav{
  background-color: transparent;
  padding: -10px;
  color: var(--header-nav-color);
  border-style: none;
  transition: 225ms ease-out;
  transform: scale(70%, 70%)
}

input.header-nav:hover {
  color: var(--header-nav-color-hover);
}

.drawer-close-icon {
  float: right;
  color: var(--header-drawer-icon-color);
  transform: scale(125%, 125%);
}

.drawer-close-icon:hover{
  transition: 225ms ease-out;
  color: var(--header-drawer-icon-color-hover);
}

.router-link-active{
  color: var(--header-router-color-text);
  text-decoration: none;
}
</style>