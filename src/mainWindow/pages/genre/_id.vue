<route>
{
  "props": true
}
</route>
<template>
  <div class="w-100">
    <SongView
      :defaultDetails="defaultDetails"
      :songList="songList"
      :detailsButtonGroup="buttonGroups"
      @onRowContext="getSongMenu(arguments[0], arguments[1], undefined)"
      @playAll="playArtist"
      @addToQueue="addArtistToQueue"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import SongView from '@/mainWindow/components/SongView.vue'

import { mixins } from 'vue-class-component'
import ContextMenuMixin from '@/utils/ui/mixins/ContextMenuMixin'
import { arrayDiff } from '@/utils/common'

@Component({
  components: {
    SongView
  }
})
export default class SingleAlbumView extends mixins(ContextMenuMixin) {
  private songList: Song[] = []

  @Prop({ default: '' })
  private genre_id!: string

  @Prop({ default: '' })
  private genre_name!: string

  @Prop({ default: '' })
  private genre_coverPath!: string

  @Prop({ default: '' })
  private genre_song_count!: string

  mounted() {
    this.fetchgenre()
  }

  private defaultDetails: SongDetailDefaults = {
    defaultTitle: this.genre_name,
    defaultSubtitle: `${this.genre_song_count} Songs`,
    defaultSubSubtitle: '',
    defaultCover: this.genre_coverPath
  }

  get buttonGroups(): SongDetailButtons {
    return {
      enableContainer: true,
      enableLibraryStore: false
    }
  }

  private async fetchgenre() {
    this.songList = await window.DBUtils.getSingleGenre(this.genre_id)
  }

  private getSongMenu(event: Event, songs: Song[], exclude: string | undefined) {
    this.getContextMenu(event, {
      type: 'SONGS',
      args: {
        songs: songs,
        exclude: exclude,
        refreshCallback: () => (this.songList = arrayDiff(this.songList, songs))
      }
    })
  }
}
</script>
