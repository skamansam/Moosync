<route>
{
  "props": true
}
</route>
<template>
  <b-container fluid>
    <b-row>
      <div>{{ album_name }}</div>
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
import { vxm } from '@/mainWindow/store'

@Component({
  components: {
    SongView
  }
})
export default class SingleAlbumView extends mixins(ContextMenuMixin) {
  private album: Album | null = null
  private songList: Song[] = []

  @Prop({ default: '' })
  private album_id!: string

  @Prop({ default: '' })
  private album_name!: string

  @Prop({ default: '' })
  private album_coverPath!: string

  get playlists() {
    return vxm.playlist.playlists
  }

  get defaultDetails(): SongDetailDefaults {
    return {
      defaultTitle: this.album_name,
      defaultSubtitle: this.album ? this.album.album_song_count : 0,
      defaultCover: this.album_coverPath
    }
  }

  mounted() {
    this.fetchAlbum()
  }

  private async fetchAlbum() {
    this.songList = await window.DBUtils.getSingleAlbum(this.album_id)
  }

  private getSongMenu(event: Event, songs: Song[], exclude: string | undefined) {
    this.getContextMenu(event, { type: 'SONGS', args: { songs: songs, exclude: exclude } })
  }
}
</script>
