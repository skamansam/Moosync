import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'All Songs',
      component: require('@/components/pages/AllSongs.vue').default,
    },
    // {
    //   path: '/broadcast',
    //   name: 'broadcaster',
    //   component: require('@/components/Broadcaster.vue').default
    // }
  ],
})
