import Toasted from 'vue-toasted';
import Vue from 'vue';

Vue.use(Toasted, {
  position: 'top-right',
  className: 'custom-toast',
  duration: 2500
})