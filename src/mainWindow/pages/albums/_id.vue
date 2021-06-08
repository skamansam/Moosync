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
    <b-row>
      <SongView :songList="songList" @onRowContext="getSongContextMenu(undefined, arguments[0], ...arguments[1])" />
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import SongView from '@/mainWindow/components/SongView.vue'
import { Album } from '@/models/albums'
import { Song } from '@/models/songs'

import { mixins } from 'vue-class-component'
import ContextMenuMixin from '@/utils/mixins/ContextMenuMixin'
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

  mounted() {
    this.fetchAlbum()
  }

  private async fetchAlbum() {
    this.songList = await window.DBUtils.getSingleAlbum(this.album_id)
  }
}
</script>
