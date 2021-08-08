import '@/preferenceWindow/plugins/vueBootstrap'
import '@/sass/global.sass'

import App from './Preferences.vue'
import Vue from 'vue'
import router from '@/preferenceWindow/plugins/router'

Vue.config.productionTip = false

new Vue({
  components: { App },
  router,
  template: '<App/>',
}).$mount('#app')
