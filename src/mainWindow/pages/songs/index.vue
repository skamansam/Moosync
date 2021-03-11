<template>
  <div class="w-100">
    <SongView :songList="songList" @onRowContext="getSongContextMenu(undefined, ...arguments)" />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import SongView from '@/mainWindow/components/SongView.vue'

import { Song } from '@/models/songs'
import { IpcEvents, PlaylistEvents, SongEvents } from '@/utils/ipc/main/constants'
import { PlaylistModule } from '@/mainWindow/store/playlists'
import { ipcRendererHolder } from '@/utils/ipc/renderer'

import { mixins } from 'vue-class-component'
import ContextMenuMixin from '@/utils/mixins/ContextMenuMixin'

@Component({
  components: {
    SongView,
  },
})
export default class AllSongs extends mixins(ContextMenuMixin) {
  private songList: Song[] = []
  private currentSong: Song | null = null

  get playlists() {
    return PlaylistModule.playlists
  }

  mounted() {
    this.requestSongs()
  }

  private async requestSongs() {
    ipcRendererHolder
      .send<Song[]>(IpcEvents.SONG, { type: SongEvents.GET_ALL_SONGS })
      .then((data) => {
        this.songList = data
      })
  }

  private addSongToPlaylist(playlist_id: string, song: Song) {
    ipcRendererHolder.send<void>(IpcEvents.PLAYLIST, {
      type: PlaylistEvents.ADD_TO_PLAYLIST,
      params: {
        playlist_id: playlist_id,
        song_ids: [song],
      },
    })
  }
}
</script>
