import '@/mainWindow/plugins/vueBootstrap'
import '@/mainWindow/plugins/vueSliderBar'
import '@/sass/global.sass'

import App from '@/mainWindow/App.vue'
import Vue from 'vue'
import router from '@/mainWindow/plugins/router'
import store from '@/mainWindow/store'

Vue.config.productionTip = false

new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app')
