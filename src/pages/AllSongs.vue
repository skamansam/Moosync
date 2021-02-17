<template>
  <b-container fluid class="song-container">
    <b-row class="d-flex h-100">
      <b-col class="h-100" cols="8"><SongList /></b-col>
      <b-col class="h-100" cols="4"><SongDetails /></b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import SongList from '@/components/SongList.vue'
import SongDetails from '@/components/SongDetails.vue'

@Component({
  components: {
    SongList,
    SongDetails,
  },
})
export default class AllSongs extends Vue {}
</script>

<style lang="sass" scoped>
.song-container
  position: absolute
  height: 100%
  overflow-y: hidden
</style>
