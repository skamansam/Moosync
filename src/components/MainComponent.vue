<template>
  <div class="appContainer">
    <!-- <button v-on:click="toggleBroadcaster()">Broadcaster</button>
    <button v-on:click="toggleWatcher()">Watcher</button> -->
    <AudioStream class="musicbar" :isBroadcaster="!watcher" :audioType="audioType" />
    <Sidebar class="sidebar" />
    <div class="d-flex main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AudioStream from '@/components/AudioStream.vue'
import Sidebar from '@/components/Sidebar.vue'
import { AudioType } from '@/store/playerState'
import { IpcRendererHolder } from '@/services/ipc/renderer'
import { ipcRenderer } from 'electron'
// eslint-disable-next-line no-unused-vars
import { Song } from '@/models/songs'
// import { IpcEvents } from '@/services/ipc/main/constants'

const stun = require('stun')

@Component({
  components: {
    AudioStream,
    Sidebar,
  },
})
export default class MainComponent extends Vue {
  private watcher: Boolean = true
  private audioType: number = AudioType.LOCAL
  private IpcHolder = new IpcRendererHolder(ipcRenderer)

  mounted() {
    this.testStun()
    // this.IpcHolder.send<void>(IpcEvents.SCAN_MUSIC, { params: ['/mnt/g/songs/Playlist/Daily Dose'] })
  }

  public toggleWatcher() {
    this.watcher = true
  }
  public toggleBroadcaster() {
    this.watcher = false
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
}
</script>

<style lang="sass" scoped>

.musicbar
  position: fixed
  z-index: -1

.sidebar
  position: fixed
  z-index: -2

.main-content
  position: fixed
  left: calc(261px + 30px)
  right: 30px
  top: 30px
  bottom: calc(6rem + 30px)
  z-index: -3
</style>

<style lang="sass"></style>
