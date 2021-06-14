import Router from 'vue-router'
import Scanner from '@/preferenceWindow/components/pages/Paths.vue'
import Vue from 'vue'

Vue.use(Router)

const routes = [
  {
    path: '/',
    redirect: { name: 'paths' },
  },
  {
    name: 'paths',
    path: '/paths',
    component: Scanner,
  },
  {
    name: 'cache',
    path: '/cache',
    component: Scanner,
  },
  {
    name: 'interface',
    path: '/interface',
    component: Scanner,
  },
  {
    name: 'system',
    path: '/system',
    component: Scanner,
  },
]

export default new Router({ routes })
