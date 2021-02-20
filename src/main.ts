import '@/plugins/vueBootstrap'
import '@/sass/global.sass'

import App from './App.vue'
import Vue from 'vue'
import router from './plugins/router'
import store from './store'

Vue.config.productionTip = false

new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app')
