<template>
  <div id="app">
    <ContextMenu />
    <Titlebar />
    <div class="appContainer">
      <router-view></router-view>
    </div>
    <NewPlaylistModal :id="'NewPlaylistModal'" />
    <AddPlaylistModal />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import Titlebar from '@/commonComponents/Titlebar.vue'
import { mixins } from 'vue-class-component'
import ThemeHandler from '@/utils/ui/mixins/ThemeHandler'
import ContextMenu from './components/generic/Context.vue'
import NewPlaylistModal from '@/mainWindow/components/generic/NewPlaylistModal.vue'
import AddPlaylistModal from '@/mainWindow/components/generic/AddPlaylistModal.vue'

import { vxm } from './store'

const stun = require('stun')

@Component({
  components: {
    Titlebar,
    ContextMenu,
    NewPlaylistModal,
    AddPlaylistModal
  }
})
export default class App extends mixins(ThemeHandler) {
  created() {
    this.registerLogger()
    this.registerNotifier()
  }

  mounted() {
    this.watchPlaylistUpdates()
    this.populatePlaylists()
    this.registerDevTools()
    // this.testStun()
  }

  private registerDevTools() {
    document.addEventListener('keydown', function (e) {
      if (e.code === 'F12') {
        window.WindowUtils.toggleDevTools()
      } else if (e.code === 'F5') {
        location.reload()
      }
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

  private watchPlaylistUpdates() {
    vxm.playlist.$watch('updated', (updated: boolean) => {
      if (updated) {
        vxm.playlist.updated = false
        this.populatePlaylists()
      }
    })
  }

  private async populatePlaylists() {
    let RawPlaylists = await window.DBUtils.getAllPlaylists()
    let playlists: playlistInfo = {}
    for (let p of RawPlaylists) {
      playlists[p.playlist_id] = p.playlist_name
    }
    vxm.playlist.playlists = playlists
  }

  private registerLogger() {
    const preservedConsoleInfo = console.info
    const preservedConsoleError = console.error

    console.info = (...args: any[]) => {
      preservedConsoleInfo.apply(console, args)
      window.LoggerUtils.info(args)
    }

    console.error = (...args: any[]) => {
      preservedConsoleError.apply(console, args)
      window.LoggerUtils.error(args)
    }

    window.onerror = (err) => window.LoggerUtils.error(err)
  }

  private registerNotifier() {
    window.NotifierUtils.registerMainProcessNotifier((obj) => {
      vxm.notifier.emit(obj)
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
  color: var(--textPrimary) !important;
  width: 100%;
  height: 100%;
  /* margin-top: 60px; */
}

*:focus {
  outline: none;
}

body {
  background-color: var(--primary) !important;
  color: var(--textPrimary) !important;
  width: 100vw;
  height: 100vh;
}

.appContainer {
  width: 100%;
  height: 100%;
}
</style>
