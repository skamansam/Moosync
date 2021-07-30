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
import { bus } from './main'
import PlayerControls from '@/utils/ui/mixins/PlayerControls'
import { v1 } from 'uuid'

const stun = require('stun')

@Component({
  components: {
    Titlebar,
    ContextMenu,
    NewPlaylistModal,
    AddPlaylistModal
  }
})
export default class App extends mixins(ThemeHandler, PlayerControls) {
  created() {
    this.registerLogger()
    this.registerNotifier()
    this.listenExtensionEvents()
    this.listenExtensionRequests()
  }

  mounted() {
    this.registerFileOpenRequests()
    this.watchPlaylistUpdates()
    this.populatePlaylists()
    this.registerDevTools()
    this.registerFileDragListener()
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

    if (window.LoggerUtils && window.LoggerUtils.info && window.LoggerUtils.error) {
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
  }

  private registerNotifier() {
    window.NotifierUtils.registerMainProcessNotifier((obj) => {
      vxm.notifier.emit(obj)
    })
  }

  private getFileName(path: string) {
    let li = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
    return path.substring(li + 1)
  }

  private getDuration(src: string): Promise<number> {
    return new Promise(function (resolve) {
      var audio = new Audio()
      audio.addEventListener('loadedmetadata', function () {
        resolve(audio.duration)
      })
      audio.src = 'media://' + src
    })
  }

  private async getSongFromPath(path: string): Promise<Song> {
    const duration = await this.getDuration(path)
    return {
      _id: v1(),
      title: this.getFileName(path),
      duration: duration,
      artists: [],
      path: path,
      type: 'LOCAL'
    }
  }

  private registerFileOpenRequests() {
    window.FileUtils.listenInitialFileOpenRequest(async (paths) => {
      if (paths.length > 0) {
        for (let [index, path] of paths.entries()) {
          const song = await this.getSongFromPath(path)
          if (index === 0) {
            await this.playTop([song])
          } else {
            await this.queueSong([song])
          }
        }
      }
    })
    window.WindowUtils.mainWindowHasMounted()
  }

  private registerFileDragListener() {
    document.addEventListener('drop', async (event) => {
      event.preventDefault()
      event.stopPropagation()
      if (event.dataTransfer) {
        console.log(event.dataTransfer.files.length)
        for (const f of event.dataTransfer.files) {
          if (f) {
            const song = await this.getSongFromPath(f.path)
            await this.playTop([song])
          }
        }
      }
    })

    document.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
  }

  private listenExtensionRequests() {
    window.ExtensionUtils.listenRequests((data) => {
      if (data.type === 'get-current-song') {
        window.ExtensionUtils.replyToRequest({ ...data, data: vxm.player.currentSong })
        return
      }

      if (data.type === 'get-volume') {
        window.ExtensionUtils.replyToRequest({ ...data, data: vxm.player.volume })
        return
      }

      if (data.type === 'get-time') {
        window.ExtensionUtils.replyToRequest({ ...data, data: vxm.player.currentTime })
        return
      }

      if (data.type === 'get-queue') {
        window.ExtensionUtils.replyToRequest({ ...data, data: vxm.player.queue })
        return
      }

      if (data.type === 'get-player-state') {
        window.ExtensionUtils.replyToRequest({ ...data, data: vxm.player.playerState })
      }
    })
  }

  private listenExtensionEvents() {
    vxm.player.$watch('currentSong', (newVal: Song) =>
      window.ExtensionUtils.sendEvent({
        type: 'onSongChanged',
        data: newVal
      })
    )

    vxm.player.$watch('playerState', (newVal: PlayerState) =>
      window.ExtensionUtils.sendEvent({
        type: 'onPlayerStateChanged',
        data: newVal
      })
    )

    vxm.player.$watch('volume', (newVal: number) =>
      window.ExtensionUtils.sendEvent({
        type: 'onVolumeChanged',
        data: newVal
      })
    )

    vxm.player.$watch('songQueue', (newVal: SongQueue) =>
      window.ExtensionUtils.sendEvent({
        type: 'onSongQueueChanged',
        data: newVal
      })
    )

    bus.$on('forceSeek', (newVal: number) =>
      window.ExtensionUtils.sendEvent({
        type: 'onSeeked',
        data: newVal
      })
    )
  }
}
</script>

<style lang="sass">
#app
  font-family: 'Nunito Sans'
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  background: var(--primary)
  color: var(--textPrimary) !important
  width: 100%
  height: 100%
  user-select: none
  user-drag: none

*:focus
  outline: none

body
  background-color: var(--primary) !important
  color: var(--textPrimary) !important
  width: 100vw
  height: 100vh

.appContainer
  width: 100%
  height: 100%
</style>
