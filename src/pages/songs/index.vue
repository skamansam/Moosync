<template>
  <div>
    <SongView :songList="songList" @onRowContext="getSongContextMenu" />
    <NewPlaylistModal :id="'NewPlaylistModal'" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import SongView from '@/components/SongView.vue'

import { Song } from '@/models/songs'
import { IpcEvents } from '@/utils/ipc/main/constants'
import { PlaylistModule } from '@/store/playlists'
import NewPlaylistModal from '@/components/generic/NewPlaylistModal.vue'
import { ipcRendererHolder } from '@/utils/ipc/renderer'

@Component({
  components: {
    SongView,
    NewPlaylistModal,
  },
})
export default class AllSongs extends Vue {
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
      .send<Song[]>(IpcEvents.GET_ALL_SONGS, { responseChannel: IpcEvents.GOT_ALL_SONGS })
      .then((data) => {
        this.songList = data
      })
  }

  private addSongToPlaylist(playlist_id: string, song: Song) {
    ipcRendererHolder.send<void>(IpcEvents.ADD_TO_PLAYLIST, {
      responseChannel: IpcEvents.ADDED_TO_PLAYLIST,
      params: {
        playlist_id: playlist_id,
        song_ids: [song],
      },
    })
  }

  private getSongContextMenu(item: Song) {
    console.log(item)
  }
}
</script>
