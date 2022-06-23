import Vue from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './locales/i18n'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

new Vue({
  router,
  i18n,
  vuetify,
  render: h => h(App)
}).$mount('#app')
