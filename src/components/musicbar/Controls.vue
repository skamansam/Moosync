<template>
  <b-container fluid class="d-flex flex-column h-100">
    <b-row class="flex-grow-1 align-items-center">
      <b-col cols="auto" class="timestamp">3:32 / 6:10</b-col>
      <b-col><LastTrack /></b-col>
      <b-col><Repeat /></b-col>
      <b-col><Play /></b-col>
      <b-col><NextTrack /></b-col>
      <b-col><Shuffle /></b-col>
      <!-- <b-col cols="2" class="d-none d-xl-block"></b-col> -->
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
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
export default class MusicBar extends Vue {}
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
