<template>
  <header class="">
    <div class="header-flex">
      <!-- LOGO PLACEHOLDER -->
      <h1><small><a href="/" class="header-nav-home">{{ title }}</a></small></h1>
      <span>
        <input type="button" @click.stop="drawer = !drawer" class="material-symbols-outlined header-nav" value="menu">
        <input type="button" @click="changeModeAnimation" v-if="darkMode" class="material-symbols-outlined header-nav style-option" value="dark_mode">
        <input type="button" @click="changeModeAnimation" v-if="!darkMode" class="material-symbols-outlined header-nav style-option" value="light_mode">
        <input type="button" class="material-symbols-outlined header-nav" value="translate">
        <v-navigation-drawer v-model="drawer" temporary right absolute>
          <v-list nav dense>
            <v-list-item-group>
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
    drawer: false
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

      if (scrollOffset > panHeaderHeight) {
        document.header.classList.add('after-scroll');
      } else if (scrollOffset < panHeaderHeight) {
        if (document.header.classList !== undefined) {
          document.header.classList.remove('after-scroll');
        }
      }
    }
  }
}
</script>

<style>
header{
  background-color: transparent;
  flex: 0 0 auto;
  z-index: 3;
  position: fixed;
}

header.after-scroll{
  background-color: var(--header-background-color);
}

header .header-flex {
  width: 100%;
  height: 100%;
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

</style>