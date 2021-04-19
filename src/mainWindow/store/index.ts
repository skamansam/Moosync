import ThemeStore from '@/commonStore/themeState'
import Vue from 'vue'
import Vuex from 'vuex'
import { createProxy, extractVuexModule } from 'vuex-class-component'
import { PlayerStore } from './playerState'
import { PlaylistStore } from '@/mainWindow/store/playlists'
import { SyncStore } from '@/mainWindow/store/syncState'
import { createPersist } from '@/utils/store/persist'

Vue.use(Vuex)

const paths = ['player.volume', 'player.currentSong', 'player.state', 'themes.colors']

export const store = new Vuex.Store({
  modules: {
    ...extractVuexModule(ThemeStore),
    ...extractVuexModule(PlayerStore),
    ...extractVuexModule(PlaylistStore),
    ...extractVuexModule(SyncStore),
  },
  plugins: [createPersist(paths)],
})

export const vxm = {
  themes: createProxy(store, ThemeStore),
  player: createProxy(store, PlayerStore),
  playlist: createProxy(store, PlaylistStore),
  sync: createProxy(store, SyncStore),
}
