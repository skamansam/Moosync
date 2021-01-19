<template>
  <div>
    <!-- <button v-on:click="toggleBroadcaster()">Broadcaster</button>
    <button v-on:click="toggleWatcher()">Watcher</button> -->

    <Sidebar class="sidebar" />
    <router-view></router-view>
    <AudioStream class="musicbar" :isBroadcaster="!watcher" :audioType="audioType" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AudioStream from '@/components/AudioStream.vue'
import Sidebar from '@/components/Sidebar.vue'
import { AudioType } from '@/services/player/enums'
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

  mounted() {
    this.testStun()
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
.sidebar
  z-index: -1
</style>
