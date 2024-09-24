import Vue from 'vue'
import router from './router'
import i18n from './locales/i18n'
import vuetify from './plugins/vuetify'
import './assets/global.css'
import 'modern-normalize/modern-normalize.css';

new Vue({
  router,
  i18n,
  vuetify,
}).$mount('#app')

let darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
handleDarkMode(darkModeMediaQuery);
function handleDarkMode(e) {
  let darkModeOn = e.matches;
  let favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) {
    return;
  }
  if (darkModeOn) {
    favicon.href = '/favicon_dark.ico';
  } else {
    favicon.href = '/favicon.ico';
  }
}
darkModeMediaQuery.addEventListener('change', handleDarkMode);
