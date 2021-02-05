import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/songs',
      name: 'All Songs',
      component: require('@/components/pages/AllSongs.vue').default,
    },
    {
      path: '/albums',
      name: 'Albums',
      component: require('@/components/pages/Albums.vue').default,
    },
  ],
})
