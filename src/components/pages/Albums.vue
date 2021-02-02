<template>
  <b-container fluid>
    <b-row class="d-flex">
      <!-- <b-col cols="8"><SongList /></b-col>
      <b-col cols="4"><SongDetails /></b-col> -->
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import SongDetails from './allsongs/SongDetails.vue'
import SongList from './allsongs/SongList.vue'

@Component({
  components: {
    SongList,
    SongDetails,
  },
})
export default class AllSongs extends Vue {
  // private getAlbums() {
  //   let albums: string[] = []
  //   for (let i of this.AllSongs) {
  //     if (i.album) !albums.includes(i.album) ? albums.push(i.album) : null
  //     else albums.push('misc')
  //   }
  //   this.setAlbums(albums)
  // }
}
</script>

<style lang="sass" scoped>
@import '@/sass/variables.sass'
</style>
