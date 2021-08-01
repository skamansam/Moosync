import Extensions from '@/preferenceWindow/components/pages/Extensions.vue';
import Interface from '../components/pages/Interface.vue';
import Paths from '@/preferenceWindow/components/pages/Paths.vue';
import Router from 'vue-router';
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
    name: 'interface',
    path: '/interface',
    component: Interface,
  },
  {
    name: 'system',
    path: '/system',
    component: Paths,
  },
]

export default new Router({ routes })
