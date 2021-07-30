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
      @onRowContext="getSongMenu(arguments[0], arguments[1], undefined)"
      @playAll="playArtist"
      @addToQueue="addArtistToQueue"
      :detailsButtonGroup="buttonGroups"
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
export default class SingleArtistView extends mixins(ContextMenuMixin) {
  private songList: Song[] = []

  @Prop({ default: '' })
  private artist_id!: string

  @Prop({ default: '' })
  private artist_name!: string

  @Prop({ default: '' })
  private artist_coverPath!: string

  @Prop({ default: '' })
  private artist_song_count!: string

  mounted() {
    this.fetchArtist()
  }
  private defaultDetails: SongDetailDefaults = {
    defaultTitle: this.artist_name,
    defaultSubtitle: `${this.artist_song_count} Songs`,
    defaultSubSubtitle: '',
    defaultCover: this.artist_coverPath
  }

  get buttonGroups(): SongDetailButtons {
    return {
      enableContainer: true,
      enableLibraryStore: false
    }
  }

  private async fetchArtist() {
    this.songList = await window.DBUtils.getSingleArtist(this.artist_id)
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

  private playArtist() {
    this.playTop(this.songList)
  }

  private addArtistToQueue() {
    this.queueSong(this.songList)
  }
}
</script>
