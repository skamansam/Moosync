<template>
  <b-container fluid class="song-container h-100">
    <b-row align-v="center" class="w-100 no-gutters details-background">
      <SongDetails
        class="details-container h-100"
        :currentTitle="currentSong ? currentSong.title : ''"
        :currentsubTitle="getAlbumName(currentSong)"
        :currentSubSubTitle="defaultDetails.defaultSubSubtitle"
        :currentType="currentSong ? currentSong.type : 'LOCAL'"
        :imgSrc="getImgSrc(getValidImageHigh(currentSong))"
        :defaultTitle="defaultDetails.defaultTitle"
        :defaultsubTitle="defaultDetails.defaultSubtitle"
        :defaultImgSrc="defaultDetails.defaultCover"
        :buttonGroup="detailsButtonGroup"
        @playAll="playAll"
        @addToQueue="addToQueue"
        @addToLibrary="addToLibrary"
      />
    </b-row>
    <b-row class="no-gutters list-container">
      <SongList
        :songList="songList"
        :extrafields="[
          { key: 'index', label: 'Sr. No' },
          { key: 'title', label: 'Title' },
          { key: 'album_name', label: 'Album' },
          { key: 'artist_name', label: 'Artists' }
        ]"
        :tableBusy="tableBusy"
        @onRowDoubleClicked="queueSong"
        @onRowContext="getSongContextMenu"
        @onRowSelected="updateCoverDetails"
        @onRowSelectionClear="clearSelection"
      />
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import SongList from '@/mainWindow/components/generic/SongList.vue'
import SongDetails from '@/mainWindow/components/generic/SongDetails.vue'
import { mixins } from 'vue-class-component'
import PlayerControls from '@/utils/ui/mixins/PlayerControls'
import ModelHelper from '@/utils/ui/mixins/ModelHelper'
import RemoteSong from '@/utils/ui/mixins/remoteSongMixin'
import ImgLoader from '@/utils/ui/mixins/ImageLoader'

@Component({
  components: {
    SongList,
    SongDetails
  }
})
export default class AllSongs extends mixins(PlayerControls, ModelHelper, RemoteSong, ImgLoader) {
  @Prop({ default: () => [] })
  private songList!: Song[]

  @Prop({ default: false })
  private tableBusy!: boolean

  private selected: Song[] | null = null
  private selectedCopy: Song[] | null = null

  private currentSong: Song | null | undefined = null

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

  private clearSelection() {
    this.currentSong = null
    this.selected = this.selectedCopy
    this.selectedCopy = null
  }

  private updateCoverDetails(items: Song[]) {
    if (items) this.currentSong = items[items.length - 1]
    this.selected = items
    this.selectedCopy = items
  }

  private getSongContextMenu(event: Event, item: Song) {
    this.$emit('onRowContext', event, item)
  }

  private playAll() {
    this.playTop(this.selected ?? this.songList)
    this.selected = this.selectedCopy
  }

  private addToQueue() {
    this.queueSong(this.selected ?? this.songList)
    this.selected = this.selectedCopy
  }

  private addToLibrary() {
    this.addSongsToLibrary(...(this.selected ?? this.songList))
    this.selected = this.selectedCopy
  }
}
</script>

<style lang="sass" scoped>
.song-container
  overflow-y: hidden

.details-container
  width: 100%
  padding-top: 15px
  padding-bottom: 15px

.list-container
  height: 75%

.details-background
  height: 25%
  max-height: 200px
  margin-top: 15px
  width: calc(100% - 30px)
  border-radius: 28px
  background: var(--secondary)
</style>
