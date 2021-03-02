<template>
  <div class="background w-100">
    <VueSlider
      :min="0"
      :max="currentSong ? Math.round(currentSong.duration) : 0"
      class="timeline"
      :interval="1"
      :dotSize="10"
      :value="timestamp"
      :duration="0.1"
      :tooltip="'none'"
      @change="updateTimestmp"
    />
    <b-container fluid class="d-flex h-100">
      <b-row class="flex-grow-1 justify-content-between">
        <b-col col lg="3"
          ><Details
            :title="currentSong ? currentSong.title : '-'"
            :artists="currentSong ? currentSong.artists : []"
            :cover="
              currentSong && currentSong.album && currentSong.album.album_coverPath
                ? currentSong.album.album_coverPath
                : ''
            "
            :coverBlob="currentCoverBlob"
        /></b-col>
        <b-col col lg="auto"
          ><Controls :duration="currentSong ? currentSong.duration : 0" :timestamp="timestamp"
        /></b-col>
        <b-col col lg="3"><ExtraControls @onVolumeChange="volumeUpdated" /></b-col>
      </b-row>
    </b-container>
    <AudioStream
      :playerState="playerState"
      :currentSong="currentSong"
      @onTimeUpdate="updateTimestamp"
      :forceSeek="forceSeek"
      :volume="volume"
    />
  </div>
</template>

<script lang="ts">
import AudioStream from '@/mainWindow/components/AudioStream.vue'
import Controls from '@/mainWindow/components/musicbar/Controls.vue'
import Details from '@/mainWindow/components/musicbar/Details.vue'
import ExtraControls from '@/mainWindow/components/musicbar/ExtraControls.vue'

import { Component } from 'vue-property-decorator'
import { Song } from '@/models/songs'
import { PlayerModule, PlayerState } from '@/mainWindow/store/playerState'
import { SyncModule } from '@/mainWindow/store/syncState'
import Colors from '@/utils/mixins/Colors'
import { mixins } from 'vue-class-component'

@Component({
  components: {
    Details,
    Controls,
    ExtraControls,
    AudioStream,
  },
})
export default class MusicBar extends mixins(Colors) {
  private currentSong: Song | null = null
  private timestamp: number = 0
  private forceSeek: number = 0
  private volume: number = 50
  private currentCoverBlob: Blob | null = null

  private playerState: PlayerState = PlayerState.STOPPED

  private updateTimestmp(value: number) {
    this.forceSeek = value
  }

  mounted() {
    this.registerSongInfoListeners()
    this.registerSyncInfoListeners()
  }

  private registerSongInfoListeners() {
    PlayerModule.$watch(
      (playerModule) => playerModule.currentSong,
      (newSong: Song | null) => {
        this.currentSong = newSong
      }
    )

    PlayerModule.$watch(
      (playerModule) => playerModule.playerState,
      async (newState: PlayerState) => {
        this.playerState = newState
      }
    )
  }

  private registerSyncInfoListeners() {
    // TODO: Decide when to play local or remote track
    SyncModule.$watch(
      (syncModule) => syncModule.currentSongDets,
      (newSong: Song | null) => {
        this.currentSong = newSong
      }
    )

    SyncModule.$watch(
      (syncModule) => syncModule.currentCover,
      async (newCover: Blob | null) => {
        this.currentCoverBlob = newCover
      }
    )
  }

  private updateTimestamp(timestamp: number) {
    this.timestamp = timestamp
  }

  private volumeUpdated(value: number) {
    this.volume = value
  }
}
</script>

<style lang="sass">
.background
  background: var(--primary)
  position: fixed
  bottom: 0
  height: 6.5rem

.timeline-container
  position: absolute
  bottom: 6rem
  height: 1rem
  width: 100%
  background-color: #ffffff

.timeline
  height: 0.5rem !important
  width: 100%

.vue-slider-process
  background-color: var(--accentPrimary)

.vue-slider-rail
  background-color: var(--tertiary)
</style>
