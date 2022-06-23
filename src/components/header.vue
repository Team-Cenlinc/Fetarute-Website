<template>
  <header>
    <div class="header-flex" v-bind:class="{'after-scroll-bg': scrollPassed, 'before-scroll-bg': !scrollPassed}" data-app>
      <!-- LOGO PLACEHOLDER -->
      <h1><small><a href="/" class="header-nav-home">{{ title }}</a></small></h1>
      <span>
        <input type="button" @click.stop="drawer = !drawer" class="material-symbols-outlined header-nav" value="menu">
        <input type="button" @click="changeModeAnimation" v-if="darkMode" class="material-symbols-outlined header-nav style-option" value="dark_mode">
        <input type="button" @click="changeModeAnimation" v-if="!darkMode" class="material-symbols-outlined header-nav style-option" value="light_mode">
        <v-menu offset-y v-bind:dark="darkMode" buttom origin="center center" transition="slide-y-transition" content-class="lang-menu" close-on-click="close-on-click">
          <template v-slot:activator="{ on, attrs }">
            <input v-bind="attrs" v-on="on" type="button" class="material-symbols-outlined header-nav" value="translate">
          </template>
          <v-list>
            <v-list-item
            v-for="(lang, index) in languageList"
            :key="index"
            link
            >
              <v-list-item-title>{{ lang.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-navigation-drawer v-model="drawer" right app temporary link v-bind:dark="darkMode">
          <v-list nav dense rounded>
            <v-list-item-group>
              <v-list-item @click.stop="drawer = !drawer">
                <input type="button" class="material-symbols-outlined drawer-close-icon" value="close">
              </v-list-item>
              <v-list-item>
                <v-list-item-title>{{ $t("headerNav.homePage") }}</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>{{ $t("headerNav.serverStatus") }}</v-list-item-title>
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

export default {
  name: "headerNav",
  props: ["title"],
  data: () => ({
    darkMode: false,
    drawer: false,
    scrollPassed: false,
    languageList: [
      {
        title: '简体中文'
      },
      {
        title: "English"
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

    window.addEventListener("scroll", this.handleScroll)
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
    },
    handleScroll(){
      let scrollOffset = window.scrollY
      let panHeaderHeight = document.getElementById("pan-header-picture").clientHeight

      if (scrollOffset > panHeaderHeight - 70) {
        this.scrollPassed = true
      } else if (scrollOffset < panHeaderHeight - 70) {
        this.scrollPassed = false
      }
    }
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
  flex: 0 0 auto;
  z-index: 3;
  position: fixed;
  transition: 225ms ease-out;
}

.after-scroll-bg{
  transition: 225ms ease-out;
  background-color: var(--header-background-color);
  box-shadow: 0 0 5px var(--header-shade-color);
  color: #1f1f1f;
}

header .header-flex {
  padding: 10px 20px;
  height: 70px;
  width: 100%;
  display: -webkit-flex; /* Safari */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  z-index: 3;
  position: fixed;
}

header .header-nav-home {
  display: flex;
  padding: 0 1em;
  line-height: 50px;
  color: var(--header-nav-color);
  text-decoration: none;
  float: right;
  position: fixed;
}

header .header-nav{
  display: block;
  padding: 0 1em;
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
</style>