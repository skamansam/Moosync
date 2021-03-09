import {} from '../ipc/renderer'

import { Component } from 'vue-property-decorator'
import { EventBus } from '@/utils/ipc/main/constants'
import { IpcEvents } from '@/utils/ipc/main/constants'
import { MenuItem } from 'vue-context-menu-popup'
import PlayerControls from '@/utils/mixins/PlayerControls'
import { PlaylistEvents } from '@/utils/ipc/main/constants'
import { PlaylistModule } from '@/mainWindow/store/playlists'
import { Song } from '@/models/songs'
import { bus } from '@/mainWindow/main'
import { ipcRendererHolder } from '@/utils/ipc/renderer/index'
import { mixins } from 'vue-class-component'

@Component
export default class PlaylistConstextMenuMixin extends mixins(PlayerControls) {
  get playlists() {
    return PlaylistModule.playlists
  }

  private addToPlaylist(playlist_id: string, songs: Song[]) {
    ipcRendererHolder.send<void>(IpcEvents.PLAYLIST, {
      type: PlaylistEvents.ADD_TO_PLAYLIST,
      params: { playlist_id: playlist_id, song_ids: songs },
    })
  }

  private populatePlaylistMenu(item: Song[]): MenuItem[] {
    let menu: MenuItem[] = [
      {
        label: 'New Playlist',
        handler: () =>
          bus.$emit(EventBus.SHOW_NEW_PLAYLIST_MODAL, (playlist_id: string) => this.addToPlaylist(playlist_id, item)),
      },
    ]
    for (const [key, val] of Object.entries(this.playlists)) {
      menu.push({
        label: val,
        handler: () => {
          this.addToPlaylist(key, item)
        },
      })
    }
    return menu
  }

  public getSongContextMenu(event: Event, ...item: Song[]) {
    let items = [
      {
        label: 'Play Now',
        handler: () => {
          this.playTop(...item)
        },
      },
      {
        label: 'Add To Queue',
        handler: () => {
          this.queueSong(...item)
        },
      },
      {
        label: 'Add To Playlist',
        children: this.populatePlaylistMenu(item),
      },
    ]
    bus.$emit(EventBus.SHOW_CONTEXT, event, items)
  }
}
