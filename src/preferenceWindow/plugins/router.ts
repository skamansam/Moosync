import Extensions from '@/preferenceWindow/components/pages/Extensions.vue';
import Paths from '@/preferenceWindow/components/pages/Paths.vue';
import Router from 'vue-router';
import System from '../components/pages/System.vue'
import Vue from 'vue';

Vue.use(Router)

const routes = [
  {
    path: '/',
    redirect: { name: 'paths' },
  },
  {
    name: 'paths',
    path: '/paths',
    component: Paths,
  },
  {
    name: 'extensions',
    path: '/extensions',
    component: Extensions,
  },
  {
    name: 'system',
    path: '/system',
    component: System,
  },
]

export default new Router({ routes })
