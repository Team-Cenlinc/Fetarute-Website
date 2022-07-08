import Vue from 'vue'
import router from './router'
import i18n from './locales/i18n'
import vuetify from './plugins/vuetify'
import './assets/global.css'

new Vue({
  router,
  i18n,
  vuetify,
}).$mount('#app')
