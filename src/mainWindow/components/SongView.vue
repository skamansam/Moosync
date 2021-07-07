<template>
  <b-container fluid class="song-container h-100">
    <b-row align-v="center" class="w-100 no-gutters details-background">
      <b-col class>
        <SongDetails
          class="details-container"
          :currentTitle="currentSong ? currentSong.title : ''"
          :currentsubTitle="getAlbumName(currentSong)"
          :currentSubSubTitle="defaultDetails.defaultSubSubtitle"
          :imgSrc="getImg(currentSong)"
          :defaultTitle="defaultDetails.defaultTitle"
          :defaultsubTitle="defaultDetails.defaultSubtitle"
          :defaultImgSrc="defaultDetails.defaultCover"
          :buttonGroup="detailsButtonGroup"
          @playAll="playAll"
          @addToQueue="addToQueue"
          @addToLibrary="addToLibrary"
        />
      </b-col>
    </b-row>
    <b-row class="no-gutters list-container">
      <SongList
        :songList="songList"
        :extrafields="[{ key: 'index' }, { key: 'title' }, { key: 'album' }, { key: 'artists' }]"
        :tableBusy="tableBusy"
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
import Colors from '@/utils/ui/mixins/Colors'
import { mixins } from 'vue-class-component'
import PlayerControls from '@/utils/ui/mixins/PlayerControls'
import ModelHelper from '@/utils/ui/mixins/ModelHelper'

@Component({
  components: {
    SongList,
    SongDetails
  }
})
export default class AllSongs extends mixins(Colors, PlayerControls, ModelHelper) {
  @Prop({ default: () => [] })
  private songList!: Song[]

  @Prop({ default: false })
  private tableBusy!: boolean

  private currentSong: Song | null = null

  @Prop({
    default: () => {
      return { defaultTitle: '', defaultSubtitle: '', defaultCover: '' }
    }
  })
  private defaultDetails!: SongDetailDefaults

  @Prop({
    default: () => {
      return {
        enableContainer: false,
        enableLibraryStore: false
      }
    }
  })
  private detailsButtonGroup!: SongDetailButtons

  private updateCoverDetails(items: Song[]) {
    if (items) this.currentSong = items[items.length - 1]
  }

  private getSongContextMenu(event: Event, item: Song) {
    this.$emit('onRowContext', event, item)
  }

  private playAll() {
    this.$emit('playAll')
  }

  private addToQueue() {
    this.$emit('addToQueue')
  }

  private addToLibrary() {
    this.$emit('addToLibrary')
  }
}
</script>

<style lang="sass" scoped>
@import "~bootstrap/scss/functions"
@import '~bootstrap/scss/variables'
@import "~bootstrap/scss/mixins"
@import "~bootstrap/scss/bootstrap"

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
