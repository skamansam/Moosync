<template>
  <b-row align-v="center" class="justify-content-center">
    <b-col cols="auto" class="timestamp">{{ formatDuration(timestamp) }} / {{ formatDuration(duration) }}</b-col>
    <b-col cols="auto" v-on:click="prevSong()"><LastTrack /></b-col>
    <b-col cols="auto"><Repeat /></b-col>
    <b-col cols="auto" v-on:click="togglePlayerState()"><Play /></b-col>
    <b-col cols="auto" v-on:click="nextSong()"><NextTrack /></b-col>
    <b-col cols="auto"><Shuffle /></b-col>
    <!-- <b-col cols="2" class="d-none d-xl-block"></b-col> -->
  </b-row>
</template>

<script lang="ts">
import { PlayerModule, PlayerState } from '@/mainWindow/store/playerState'
import { Component, Prop } from 'vue-property-decorator'
import LastTrack from '@/mainWindow/components/icons/LastTrack.vue'
import NextTrack from '@/mainWindow/components/icons/NextTrack.vue'
import Play from '@/mainWindow/components/icons/Play.vue'
import Repeat from '@/mainWindow/components/icons/Repeat.vue'
import Shuffle from '@/mainWindow/components/icons/Shuffle.vue'
import { mixins } from 'vue-class-component'
import PlayerControls from '@/utils/mixins/PlayerControls'

@Component({
  components: {
    LastTrack,
    NextTrack,
    Play,
    Repeat,
    Shuffle,
  },
})
export default class MusicBar extends mixins(PlayerControls) {
  @Prop({ default: 0 })
  private duration!: number

  @Prop({ default: 0 })
  private timestamp!: number

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
      (playerModule) => playerModule.playerState,
      (newState: PlayerState) => {
        // TODO: Change icons
        console.log(newState)
      }
    )
  }
}
</script>

<style lang="sass" scoped>
@import '@/sass/variables.sass'

.timestamp
  color:  var(--textSecondary)
  font-family: 'Proxima Nova'
  font-style: normal
  font-weight: normal
  font-size: 18px
  line-height: 170.19%
  overflow: hidden

.invisible
  min-width: 0%
</style>
