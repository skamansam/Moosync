<route>
{
  "props": true
}
</route>
<template>
  <b-container fluid>
    <b-row>
      <div>{{ playlist_name }}</div>
    </b-row>
    <b-row>
      <SongView :songList="songList" @onRowContext="getSongContextMenu" />
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import SongView from '@/mainWindow/components/SongView.vue'
import { ipcRendererHolder } from '@/utils/ipc/renderer'
import { IpcEvents, PlaylistEvents } from '@/utils/ipc/main/constants'
import { Song } from '@/models/songs'

import { mixins } from 'vue-class-component'
import PlaylistContextMenuMixin from '@/utils/mixins/PlaylistContextMenuMixin'
import { Playlist } from '@/models/playlists'

@Component({
  components: {
    SongView,
  },
})
export default class SinglePlaylistView extends mixins(PlaylistContextMenuMixin) {
  private playlist: Playlist | null = null
  private songList: Song[] = []

  @Prop({ default: '' })
  private playlist_id!: string

  @Prop({ default: '' })
  private playlist_name!: string

  @Prop({ default: '' })
  private playlist_coverPath!: string

  mounted() {
    this.fetchPlaylist()
  }

  private fetchPlaylist() {
    ipcRendererHolder
      .send<Song[]>(IpcEvents.PLAYLIST, {
        type: PlaylistEvents.GET_PLAYLIST,
        params: { id: this.playlist_id },
      })
      .then((data) => {
        this.songList = data
      })
  }
}
</script>
