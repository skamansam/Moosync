<template>
  <b-container fluid class="song-container">
    <b-row class="d-flex">
      <b-col cols="8" class="d-flex"
        ><SongList
          :songList="songList"
          :extrafields="[{ key: 'title' }, { key: 'album' }, { key: 'artists' }]"
          @onRowDoubleClicked="pushInQueue"
          @onRowContext="getSongContextMenu"
          @onRowSelected="updateCoverDetails"
      /></b-col>
      <b-col cols="4">
        <SongDetails
          :currentTitle="currentSong ? currentSong.title : ''"
          :currentsubTitle="
            currentSong && currentSong.album && currentSong.album.album_name ? currentSong.album.album_name : ''
          "
          :imgSrc="
            currentSong && currentSong.album && currentSong.album.album_coverPath
              ? currentSong.album.album_coverPath
              : ''
          "
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import SongList from '@/mainWindow/components/generic/SongList.vue'
import SongDetails from '@/mainWindow/components/generic/SongDetails.vue'
import { Song } from '@/models/songs'
import { PlayerModule } from '@/mainWindow/store/playerState'
import Colors from '@/utils/mixins/Colors'
import { mixins } from 'vue-class-component'

@Component({
  components: {
    SongList,
    SongDetails,
  },
})
export default class AllSongs extends mixins(Colors) {
  @Prop({ default: () => [] })
  private songList!: Song[]

  private currentSong: Song | null = null

  private pushInQueue(item: Song) {
    PlayerModule.pushInQueue(item)
  }

  private updateCoverDetails(items: Song[]) {
    if (items) this.currentSong = items[items.length - 1]
  }

  private getSongContextMenu(item: Song) {
    this.$emit('onRowContext', item)
  }
}
</script>

<style lang="sass" scoped>
.song-container
  position: absolute
  overflow-y: hidden
</style>
