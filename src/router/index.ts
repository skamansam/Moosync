import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/songs',
      name: 'All Songs',
      component: require('@/pages/AllSongs.vue').default,
    },
    {
      path: '/albums',
      name: 'Albums',
      component: require('@/pages/Albums.vue').default,
    },
    {
      path: '/artists',
      name: 'Artists',
      component: require('@/pages/Artists.vue').default,
    },
  ],
})
