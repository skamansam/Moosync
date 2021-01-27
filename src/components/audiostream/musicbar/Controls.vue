<template>
  <b-container fluid class="d-flex flex-column h-100">
    <b-row class="flex-grow-1 align-items-center">
      <b-col cols="auto" class="timestamp">{{ formatDuration(timestamp) }} / {{ formatDuration(duration) }}</b-col>
      <b-col v-on:click="prevTrack()"><LastTrack /></b-col>
      <b-col><Repeat /></b-col>
      <b-col v-on:click="togglePlayerState()"><Play /></b-col>
      <b-col v-on:click="nextTrack()"><NextTrack /></b-col>
      <b-col><Shuffle /></b-col>
      <!-- <b-col cols="2" class="d-none d-xl-block"></b-col> -->
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { PlayerModule, PlayerState } from '@/store/player/playerState'
import { Component, Prop, Vue } from 'vue-property-decorator'
import LastTrack from './controls/LastTrack.vue'
import NextTrack from './controls/NextTrack.vue'
import Play from './controls/Play.vue'
import Repeat from './controls/Repeat.vue'
import Shuffle from './controls/Shuffle.vue'

@Component({
  components: {
    LastTrack,
    NextTrack,
    Play,
    Repeat,
    Shuffle,
  },
})
export default class MusicBar extends Vue {
  @Prop({ default: 0 })
  private duration!: number

  @Prop({ default: 0 })
  private timestamp!: number

  private playerState: PlayerState = PlayerState.STOPPED

  mounted() {
    this.setupListeners()
  }

  private formatDuration(n: number) {
    let tmp = new Date(n * 1000).toISOString().substr(11, 8)

    if (tmp[0] == '0' && tmp[1] == '0') {
      return tmp.substr(3)
    }

    return tmp
  }

  private setupListeners() {
    PlayerModule.$watch(
      (playerModule) => playerModule.state,
      (newState: PlayerState) => {
        this.playerState = newState
      }
    )
  }

  private togglePlayerState() {
    if (this.playerState == PlayerState.PAUSED || this.playerState == PlayerState.STOPPED) {
      PlayerModule.setState(PlayerState.PLAYING)
    } else {
      PlayerModule.setState(PlayerState.PAUSED)
    }
  }

  private lastTrack() {
    PlayerModule.prevSong()
  }

  private nextTrack() {
    PlayerModule.nextSong()
  }
}
</script>

<style lang="sass" scoped>
@import '@/sass/variables.sass'

.timestamp
  color: $text-secondary
  font-family: 'Proxima Nova'
  font-style: normal
  font-weight: normal
  font-size: 18px
  line-height: 170.19%
  overflow: hidden
  margin-left: -45px
  margin-right: 15px

.invisible
  min-width: 0%
</style>
