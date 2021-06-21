<route>
{
  "props": true
}
</route>
<template>
  <b-container fluid>
    <b-row>
      <div>{{ genre_name }}</div>
    </b-row>
    <b-row class="h-100">
      <SongView
        :defaultDetails="defaultDetails"
        :songList="songList"
        @onRowContext="getSongMenu(arguments[0], arguments[1], undefined)"
      />
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import SongView from '@/mainWindow/components/SongView.vue'

import { mixins } from 'vue-class-component'
import ContextMenuMixin from '@/utils/ui/mixins/ContextMenuMixin'

@Component({
  components: {
    SongView
  }
})
export default class SingleAlbumView extends mixins(ContextMenuMixin) {
  private genre: Genre | null = null
  private songList: Song[] = []

  @Prop({ default: '' })
  private genre_id!: string

  @Prop({ default: '' })
  private genre_name!: string

  @Prop({ default: '' })
  private genre_coverPath!: string

  mounted() {
    this.fetchgenre()
  }

  get defaultDetails(): SongDetailDefaults {
    return {
      defaultTitle: this.genre_name,
      defaultSubtitle: this.genre ? this.genre.genre_song_count : 0,
      defaultCover: this.genre_coverPath
    }
  }

  private async fetchgenre() {
    this.songList = await window.DBUtils.getSingleGenre(this.genre_id)
  }

  private getSongMenu(event: Event, songs: Song[], exclude: string | undefined) {
    this.getContextMenu(event, { type: 'SONGS', args: { songs: songs, exclude: exclude } })
  }
}
</script>
