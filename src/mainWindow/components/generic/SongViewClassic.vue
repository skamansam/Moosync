<template>
  <div class="w-100 details-background">
    <b-row align-v="center" class="h-100">
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
        v-on="$listeners"
      />
    </b-row>
    <b-row class="list-container">
      <SongList
        :songList="songList"
        :extrafields="[
          { key: 'index', label: 'Sr. No' },
          { key: 'title', label: 'Title' },
          { key: 'album_name', label: 'Album' },
          { key: 'artist_name', label: 'Artists' }
        ]"
        :tableBusy="tableBusy"
        v-on="$listeners"
      />
    </b-row>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import ImgLoader from '@/utils/ui/mixins/ImageLoader'
import SongList from './SongList.vue'
import SongDetails from './SongDetails.vue'
import ModelHelper from '@/utils/ui/mixins/ModelHelper'

@Component({
  components: {
    SongList,
    SongDetails
  }
})
export default class SongViewClassic extends mixins(ImgLoader, ModelHelper) {
  @Prop({ default: () => [] })
  private songList!: Song[]

  @Prop({ default: false })
  private currentSong!: Song | undefined | null

  @Prop({ default: false })
  private tableBusy!: boolean

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
}
</script>