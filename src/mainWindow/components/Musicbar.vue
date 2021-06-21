<template>
  <div class="musicbar-content d-flex">
    <div class="background w-100">
      <div class="musicbar h-100">
        <VueSlider
          :min="0"
          :max="currentSong ? parseFloat(currentSong.duration.toFixed(3)) : 0"
          class="timeline"
          :interval="0.001"
          :dotSize="10"
          :value="parseFloat(timestamp.toFixed(3))"
          :duration="0.1"
          :tooltip="'none'"
          @change="updateTimestmp"
          @error="errorHandler"
        />
        <b-container fluid class="d-flex bar-container">
          <b-row align-h="between" class="d-flex no-gutters w-100">
            <b-col cols="3" align-self="center" class="no-gutters">
              <Details
                :title="currentSong ? currentSong.title : '-'"
                :artists="currentSong ? currentSong.artists : []"
                :imgSrc="cover"
              />
            </b-col>
            <b-col md="6" lg="auto" align-self="center" class="no-gutters">
              <Controls
                :playing="playerState == 'PLAYING'"
                :duration="currentSong ? currentSong.duration : 0"
                :timestamp="timestamp"
                :loading="waiting"
              />
            </b-col>
            <b-col cols="3" align-self="center" class="no-gutters">
              <ExtraControls @onToggleSlider="toggleSlider" />
            </b-col>
          </b-row>
        </b-container>
      </div>
      <AudioStream
        :playerState="playerState"
        :currentSong="currentSong"
        @onTimeUpdate="updateTimestamp"
        :forceSeek="forceSeek"
      />
    </div>
    <div class="slider" :class="{ open: sliderPosition }">
      <MusicInfo :imgSrc="getImg(currentSong)" />
    </div>
  </div>
</template>

<script lang="ts">
import AudioStream from '@/mainWindow/components/AudioStream.vue'
import Controls from '@/mainWindow/components/musicbar/Controls.vue'
import Details from '@/mainWindow/components/musicbar/Details.vue'
import ExtraControls from '@/mainWindow/components/musicbar/ExtraControls.vue'
import MusicInfo from '@/mainWindow/components/musicbar/MusicInfo.vue'

import { Component } from 'vue-property-decorator'
import Colors from '@/utils/ui/mixins/Colors'
import { mixins } from 'vue-class-component'
import ModelHelper from '@/utils/ui/mixins/ModelHelper'
import { vxm } from '../store'

@Component({
  components: {
    Details,
    Controls,
    ExtraControls,
    AudioStream,
    MusicInfo
  }
})
export default class MusicBar extends mixins(Colors, ModelHelper) {
  private timestamp: number = 0
  private forceSeek: number = 0
  private PlayerState: PlayerState = 'PAUSED'
  private sliderPosition: boolean = false

  private errorHandler(e: Event) {
    console.log(e)
  }

  private updateTimestmp(value: number) {
    this.forceSeek = value
  }

  get currentSong() {
    return vxm.sync.currentSongDets ?? vxm.player.currentSong
  }

  get remoteCover() {
    return vxm.sync.currentCover
  }

  get playerState() {
    return vxm.player.playerState
  }

  get cover() {
    return this.remoteCover ? this.remoteCover : this.getImg(this.currentSong)
  }

  get waiting() {
    return vxm.player.playerState == 'LOADING'
  }

  private toggleSlider(position: boolean) {
    this.sliderPosition = position
  }

  private updateTimestamp(timestamp: number) {
    this.timestamp = timestamp
  }
}
</script>

<style lang="sass" scoped>
.background
  background: var(--primary)
  position: fixed
  bottom: 0
  height: 6.5rem

.timeline-container
  height: 1rem
  width: 100%
  background-color: #ffffff

.timeline
  height: 0.5rem !important
  width: 100%

.musicbar
  position: relative

.bar-container
  height: calc(100% - 1rem)

.slider
  position: fixed
  background: var(--primary)
  top: 100%
  height: calc(100% - 7.5rem)
  width: 100%
  // animation: 0.2s linear 0s slide
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
  z-index: -2
.open
  top: 26px !important
</style>

<style lang="sass">
.vue-slider-process
  background-color: var(--accent)

.vue-slider-rail
  background-color: var(--tertiary)
</style>
