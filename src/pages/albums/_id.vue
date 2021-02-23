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
      <SongView :songList="songList" @onRowContext="getSongContextMenu" />
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import SongView from '@/components/SongView.vue'
import { Album } from '@/models/albums'
import { ipcRendererHolder } from '@/utils/ipc/renderer'
import { AlbumEvents, IpcEvents } from '@/utils/ipc/main/constants'
import { Song } from '@/models/songs'
import { PlaylistModule } from '@/store/playlists'

import { mixins } from 'vue-class-component'
import PlaylistContextMenuMixin from '@/utils/mixins/PlaylistContextMenuMixin'

@Component({
  components: {
    SongView,
  },
})
export default class SingleAlbumView extends mixins(PlaylistContextMenuMixin) {
  private album: Album | null = null
  private songList: Song[] = []

  @Prop({ default: '' })
  private album_id!: string

  @Prop({ default: '' })
  private album_name!: string

  @Prop({ default: '' })
  private album_coverPath!: string

  get playlists() {
    return PlaylistModule.playlists
  }

  mounted() {
    this.fetchAlbum()
  }

  private fetchAlbum() {
    ipcRendererHolder
      .send<Song[]>(IpcEvents.ALBUM, {
        type: AlbumEvents.GET_ALBUM,
        params: { id: this.album_id },
      })
      .then((data) => {
        this.songList = data
      })
  }
}
</script>
