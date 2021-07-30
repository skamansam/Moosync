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
        <b-container fluid class="d-flex bar-container h-100 pb-2">
          <b-row align-h="center" align-content="center" class="d-flex no-gutters w-100 control-row">
            <b-col cols="2" lg="3" xl="4" align-self="center" class="no-gutters details-col">
              <Details
                :title="currentSong ? currentSong.title : '-'"
                :artists="currentSong ? currentSong.artists : []"
                :imgSrc="cover"
              />
            </b-col>
            <b-col cols="auto" align-self="center" class="no-gutters controls-col">
              <Controls
                :playing="playerState == 'PLAYING'"
                :duration="currentSong ? currentSong.duration : 0"
                :timestamp="timestamp"
              />
            </b-col>
            <b-col cols="1" lg="2" align-self="center" class="no-gutters extra-col">
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
      <MusicInfo :currentSong="currentSong" :imgSrc="getImg(currentSong)" />
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
import { bus } from '@/mainWindow/main'

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
  private forceSeek: number = 0
  private PlayerState: PlayerState = 'PAUSED'
  private sliderPosition: boolean = false

  get timestamp() {
    return vxm.player.currentTime
  }

  private errorHandler(e: Event) {
    console.error(e)
  }

  private updateTimestmp(value: number) {
    bus.$emit('forceSeek', value)
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

  private toggleSlider(position: boolean) {
    this.sliderPosition = position
  }

  private updateTimestamp(timestamp: number) {
    vxm.player.currentTime = timestamp
  }
}
</script>

<style lang="sass" scoped>
.background
  background: var(--primary)
  position: fixed
  bottom: 0
  height: 6rem

.timeline-container
  height: 1rem
  width: 100%
  background-color: #ffffff

.timeline
  height: 0.5rem !important
  padding: 0 !important
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

.control-row
  position: relative

.details-col, .extra-col
  position: absolute

.details-col
  left: 0

.extra-col
  right: 0
</style>
