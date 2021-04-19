import '@/preferenceWindow/plugins/vueBootstrap'
import '@/sass/global.sass'

import App from './Preferences.vue'
import Vue from 'vue'
import router from '@/preferenceWindow/plugins/router'
// import {store} from '@/mainWindow/store'

Vue.config.productionTip = false

new Vue({
  components: { App },
  router,
  // store,
  template: '<App/>',
}).$mount('#app')
