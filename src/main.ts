import Vue from 'vue'

import App from './App.vue'
import router from './router'

import '@/plugins/vueBootstrap'
import '@/sass/global.sass'
import store from './store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app')
