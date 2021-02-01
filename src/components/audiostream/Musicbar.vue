<template>
  <div class="background w-100">
    <div class="timeline w-100"></div>
    <b-container fluid class="d-flex h-100">
      <b-row class="flex-grow-1 justify-content-between">
        <b-col col lg="3"
          ><Details
            :title="currentSong ? currentSong.title : '-'"
            :artists="currentSong ? currentSong.artists : []"
            :cover="currentCover ? currentCover.data : ''"
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
import { CoverImg, Song } from '@/models/songs'
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
  private currentCover!: CoverImg | null

  @Prop({ default: null })
  private currentCoverBlob!: Blob | null
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
