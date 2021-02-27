<template>
  <div id="app" :style="rootColors">
    <!-- <button v-on:click="scan()">Scan</button> -->
    <Titlebar />
    <div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
// import {Themes} from '@/commonStore/themeState'
import { ThemesModule } from '@/mainWindow/store/themeState'

import { Playlist } from '@/models/playlists'
import { IpcEvents, PlaylistEvents, ScannerEvents, WindowEvents } from '@/utils/ipc/main/constants'

import { playlistInfo, PlaylistModule } from '@/mainWindow/store/playlists'
import { Component, Vue } from 'vue-property-decorator'
import { ipcRendererHolder } from '@/utils/ipc/renderer'
import Titlebar from '@/commonComponents/Titlebar.vue'

const stun = require('stun')

@Component({
  components: {
    Titlebar,
  },
})
export default class App extends Vue {
  private root = document.documentElement
  get rootColors() {
    return ThemesModule.rootVars
  }

  private setDefaultTheme() {
    ThemesModule.setRootVars({
      '--primary': '#212121',
      '--secondary': '#282828',
      '--tertiary': '#202730',
      '--quaternary': '#404040',
      '--textPrimary': '#ffffff',
      '--textPrimaryTransparent': '#ffffff03',
      '--textSecondary': '#565656',
      '--accentPrimary': '#65CB88',
    })
  }

  mounted() {
    this.registerThemeListeners()
    this.setDefaultTheme()
    this.watchPlaylistUpdates()
    this.populatePlaylists()
    this.registerDevTools()
    // this.testStun()
  }

  private registerDevTools() {
    document.addEventListener('keydown', function (e) {
      if (e.code === 'F12') {
        ipcRendererHolder.send<void>(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.TOGGLE_DEV_TOOLS })
      } else if (e.code === 'F5') {
        location.reload()
      }
    })
  }

  private scan() {
    ipcRendererHolder
      .send<void>(IpcEvents.SCANNER, { type: ScannerEvents.SCAN_MUSIC })
      .then((data) => {
        console.log(data)
      })
  }

  public testStun(): void {
    stun.request('stun.l.google.com:19302', (err: any, res: any) => {
      if (err) {
        console.error(err)
      } else {
        const { address } = res.getXorAddress()
        console.log('ip: ', address)
      }
    })
  }

  private registerThemeListeners() {
    ThemesModule.$watch(
      (themesModule) => themesModule.rootVars,
      async (newColors: { [key: string]: string }) => {
        this.root.style.setProperty('--primary', newColors['--primary'])
      }
    )
  }

  private watchPlaylistUpdates() {
    PlaylistModule.$watch(
      (playlistModule) => playlistModule.updated,
      (updated: boolean) => {
        if (updated) {
          PlaylistModule.setUpdated(false)
          this.populatePlaylists()
        }
      }
    )
  }

  private populatePlaylists() {
    ipcRendererHolder
      .send<Playlist[]>(IpcEvents.PLAYLIST, { type: PlaylistEvents.GET_ALL_PLAYLISTS })
      .then((data) => {
        let playlists: playlistInfo = {}
        for (let p of data) {
          playlists[p.playlist_id] = p.playlist_name
        }
        PlaylistModule.setPlaylists(playlists)
      })
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background: var(--primary);
  color: var(--textPrimary);
  width: 100%;
  height: 100%;
  /* margin-top: 60px; */
}

body {
  background-color: var(--primary) !important;
  color: var(--textPrimary) !important;
}
</style>
