import { Component, Vue } from 'vue-property-decorator'
import { ContextMenuEvents, IpcEvents } from '../ipc/main/constants'

import { PlaylistModule } from '@/store/playlists'
import { Song } from '@/models/songs'
import { ipcRendererHolder } from '../ipc/renderer'

interface PlaylistCallbacks {
  type: string
  data?: any
}

@Component
export default class PlaylistContextMenuMixin extends Vue {
  get playlists() {
    return PlaylistModule.playlists
  }

  public getSongContextMenu(item: Song) {
    ipcRendererHolder
      .send<PlaylistCallbacks>(IpcEvents.CONTEXT_MENU, {
        type: ContextMenuEvents.SONGS_MENU,
        params: { playlists: this.playlists, song: item },
      })
      .then((status: PlaylistCallbacks) => {
        console.log(status)
        PlaylistModule.setUpdated(true)
        switch (status.type) {
          case 'newPlaylist':
            this.$bvModal.show('NewPlaylistModal')
            break
          default:
            break
        }
      })
  }
}
