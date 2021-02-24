import Router from 'vue-router'
import Scanner from '@/preferenceWindow/components/Scanner.vue'
import Vue from 'vue'

Vue.use(Router)

const routes = [
  {
    path: '/',
    redirect: { name: 'scanner' },
  },
  {
    name: 'scanner',
    path: '/scanner',
    component: Scanner,
  },
]

export default new Router({ routes })
