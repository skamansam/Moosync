<!-- 
  Controls.vue is a part of Moosync.
  
  Copyright 2022 by Sahil Gupte <sahilsachingupte@gmail.com>. All rights reserved.
  Licensed under the GNU General Public License. 
  
  See LICENSE in the project root for license information.
-->

<template>
  <b-row align-v="center" class="justify-content-center">
    <b-col cols="auto" align-self="center" class="mr-auto">
      <Timestamp class="invisible timestamp" :duration="duration" timestamp="0" />
    </b-col>
    <b-col cols="auto" v-on:click="prevSongWrapper()">
      <PrevTrack :disabled="!enableTrackControls" />
    </b-col>
    <b-col cols="auto" v-on:click="toggleRepeat()">
      <Repeat :filled="repeat" />
    </b-col>
    <b-col cols="auto" v-if="isLoading">
      <b-spinner label="Loading..."></b-spinner>
    </b-col>
    <b-col cols="auto" v-else v-on:click="togglePlayerState()">
      <Play :play="playerState === 'PLAYING'" />
    </b-col>
    <b-col cols="auto" v-on:click="nextSongWrapper()">
      <NextTrack :disabled="!enableTrackControls" />
    </b-col>
    <b-col cols="auto" v-on:click="shuffle()">
      <Shuffle :filled="true" />
    </b-col>
    <b-col cols="auto" align-self="center" class="mr-auto">
      <Timestamp class="timestamp" :duration="duration" :timestamp="timestamp" />
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import PrevTrack from '@/icons/PrevTrackIcon.vue'
import NextTrack from '@/icons/NextTrackIcon.vue'
import Play from '@/icons/PlayIcon.vue'
import Repeat from '@/icons/RepeatIcon.vue'
import Shuffle from '@/icons/ShuffleIcon.vue'
import { mixins } from 'vue-class-component'
import PlayerControls from '@/utils/ui/mixins/PlayerControls'
import { vxm } from '@/mainWindow/store'
import Timestamp from '@/mainWindow/components/musicbar/components/Timestamp.vue'

@Component({
  components: {
    PrevTrack,
    NextTrack,
    Play,
    Repeat,
    Shuffle,
    Timestamp
  }
})
export default class MusicBar extends mixins(PlayerControls) {
  @Prop({ default: 0 })
  private duration!: number

  @Prop({ default: 0 })
  private timestamp!: number

  get repeat() {
    return vxm.player.Repeat
  }

  get playerState() {
    return vxm.player.playerState
  }

  get enableTrackControls() {
    return this.isSyncing ? vxm.sync.queueOrder.length > 1 : vxm.player.queueOrder.length > 1
  }

  private nextSongWrapper() {
    if (this.enableTrackControls) this.nextSong()
  }

  private prevSongWrapper() {
    if (this.enableTrackControls) this.prevSong()
  }

  get isLoading() {
    return vxm.player.loading
  }

  private toggleRepeat() {
    vxm.player.Repeat = !this.repeat
  }
}
</script>

<style lang="sass" scoped>
.invisible
  min-width: 0%
</style>
