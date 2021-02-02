<template>
  <div class="background w-100">
    <b-progress class="w-100 timeline" :max="currentSong ? currentSong.duration : 0">
      <b-progress-bar :value="Math.floor(timestamp)" variant="success"></b-progress-bar>
    </b-progress>
    <b-container fluid class="d-flex h-100">
      <b-row class="flex-grow-1 justify-content-between">
        <b-col col lg="3"
          ><Details
            :title="currentSong ? currentSong.title : '-'"
            :artists="currentSong ? currentSong.artists : []"
            :cover="currentCover"
            :coverBlob="currentCoverBlob"
        /></b-col>
        <b-col col lg="auto"
          ><Controls :duration="currentSong ? currentSong.duration : 0" :timestamp="timestamp"
        /></b-col>
        <b-col col lg="3"><ExtraControls /></b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Details from './musicbar/Details.vue'
import Controls from './musicbar/Controls.vue'
import ExtraControls from './musicbar/ExtraControls.vue'

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
  @Prop({ default: null })
  private currentSong!: Song | null

  @Prop({ default: 0 })
  private timestamp!: number

  @Prop({ default: null })
  private currentCover!: Buffer | null

  @Prop({ default: null })
  private currentCoverBlob!: Blob | null
}
</script>

<style lang="sass" scoped>
.background
  background: $primary
  position: fixed
  bottom: 0
  height: 6rem

.timeline
  background: $tertiary
  height: 0.5rem

.timeline > .progress-bar
  background-color: $accent-primary !important
  transition: width 1s linear
</style>
