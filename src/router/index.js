import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/watch',
      name: 'watcher',
      component: require('@/components/Watcher').default
    },
    {
      path: '/broadcast',
      name: 'broadcaster',
      component: require('@/components/Broadcaster').default
    }
  ]
})
