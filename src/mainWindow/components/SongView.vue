<template>
  <b-container fluid class="song-container h-100">
    <b-row align-v="center" class="w-100 no-gutters details-background">
      <b-col class>
        <SongDetails
          class="details-container"
          :currentTitle="currentSong ? currentSong.title : ''"
          :currentsubTitle="getAlbumName(currentSong)"
          :imgSrc="getImg(currentSong)"
        />
      </b-col>
    </b-row>
    <b-row class="no-gutters list-container">
      <SongList
        :songList="songList"
        :extrafields="[{ key: 'title' }, { key: 'album' }, { key: 'artists' }]"
        @onRowDoubleClicked="queueSong"
        @onRowContext="getSongContextMenu"
        @onRowSelected="updateCoverDetails"
      />
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import SongList from '@/mainWindow/components/generic/SongList.vue'
import SongDetails from '@/mainWindow/components/generic/SongDetails.vue'
import { Song } from '@/models/songs'
import Colors from '@/utils/mixins/Colors'
import { mixins } from 'vue-class-component'
import PlayerControls from '@/utils/mixins/PlayerControls'
import ModelHelper from '@/utils/mixins/ModelHelper'

@Component({
  components: {
    SongList,
    SongDetails
  }
})
export default class AllSongs extends mixins(Colors, PlayerControls, ModelHelper) {
  @Prop({ default: () => [] })
  private songList!: Song[]

  private currentSong: Song | null = null

  private updateCoverDetails(items: Song[]) {
    if (items) this.currentSong = items[items.length - 1]
  }

  private getSongContextMenu(event: Event, item: Song) {
    this.$emit('onRowContext', event, item)
  }
}
</script>

<style lang="sass" scoped>
@import '@/sass/variables.sass'
@import "~bootstrap/scss/mixins"

.song-container
  overflow-y: hidden

.details-container
  width: 100%
  padding-top: 15px
  padding-bottom: 15px
  @include media-breakpoint-up(xs)
    height: 120px
  @include media-breakpoint-up(sm)
    height: 150px
  @include media-breakpoint-up(md-c)
    height: 170px
  @include media-breakpoint-up(lg-c)
    height: 200px

.list-container
  @include media-breakpoint-up(xs)
    height: calc(100% - 120px - 30px)
  @include media-breakpoint-up(sm)
    height: calc(100% - 150px - 30px)
  @include media-breakpoint-up(md-c)
    height: calc(100% - 170px - 30px)
  @include media-breakpoint-up(lg-c)
    height: calc(100% - 200px - 30px)

.details-background
  margin-top: 15px
  width: calc(100% - 30px)
  border-radius: 28px
  background: var(--secondary)
</style>
