<template>
  <div class="background w-100">
    <div class="timeline w-100"></div>
    <b-container fluid class="d-flex h-100">
      <b-row class="flex-grow-1 justify-content-between">
        <b-col col lg="3"
          ><Details
            :title="song ? song.title : '-'"
            :artists="song ? song.artists : []"
            :cover="song ? song.cover : ''"
        /></b-col>
        <b-col col lg="auto"><Controls :duration="song ? song.duration : 0" /></b-col>
        <b-col col lg="3"><ExtraControls /></b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Details from './musicbar/Details.vue'
import Controls from './musicbar/Controls.vue'
import ExtraControls from './musicbar/ExtraControls.vue'
import { PlayerModule } from '@/store/player/playerState'

// eslint-disable-next-line no-unused-vars
import { Song } from '@/models/songs'
@Component({
  components: {
    Details,
    Controls,
    ExtraControls,
  },
})
export default class MusicBar extends Vue {
  private song: Song | {} = {}
  mounted() {
    this.registerWatcher()
  }
  private registerWatcher() {
    PlayerModule.$watch(
      (playerModule) => playerModule.currentSongDets,
      (newSong: Song | {}) => {
        this.song = newSong
      }
    )
  }
}
</script>

<style lang="sass" scoped>
@import '@/sass/variables.sass'

.background
  background: $primary
  position: fixed
  bottom: 0
  height: 6rem

.timeline
  background: $tertiary
  background: linear-gradient(90deg, $accent-primary 0%, $accent-primary 60%, $tertiary 0%)
  height: 0.5rem
</style>
