import ThemeStore from '@/commonStore/themeState'
import Vue from 'vue'
import Vuex from 'vuex'
import { createProxy, extractVuexModule } from 'vuex-class-component'
import { PreferenceStore } from '@/preferenceWindow/store/preferences'
import { createPersist } from '@/utils/store/persist'

Vue.use(Vuex)

const paths = ['themes.colors']

export const store = new Vuex.Store({
  modules: {
    ...extractVuexModule(ThemeStore),
    ...extractVuexModule(PreferenceStore),
  },
  plugins: [createPersist(paths)],
})

export const vxm = {
  themes: createProxy(store, ThemeStore),
  preferences: createProxy(store, PreferenceStore),
}
