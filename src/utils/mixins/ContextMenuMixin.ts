import { Component } from 'vue-property-decorator'
import { EventBus } from '@/utils/ipc/main/constants'
import { MenuItem } from 'vue-context-menu-popup'
import PlayerControls from '@/utils/mixins/PlayerControls'
import { PlaylistModule } from '@/mainWindow/store/playlists'
import { Song } from '@/models/songs'
import { bus } from '@/mainWindow/main'
import { mixins } from 'vue-class-component'
import { YoutubeItem } from '@/models/youtube'
import { toSong } from '@/models/youtube'

@Component
export default class ContextMenuMixin extends mixins(PlayerControls) {
  get playlists() {
    return PlaylistModule.playlists
  }

  private async addToPlaylist(playlist_id: string, songs: Song[]) {
    window.DBUtils.addToPlaylist(playlist_id, ...songs)
  }

  private populatePlaylistMenu(item: Song[], exclude?: string): MenuItem[] {
    let menu: MenuItem[] = [
      {
        label: 'New Playlist',
        handler: () =>
          bus.$emit(EventBus.SHOW_NEW_PLAYLIST_MODAL, (playlist_id: string) => this.addToPlaylist(playlist_id, item)),
      },
    ]
    for (const [key, val] of Object.entries(this.playlists)) {
      if (key == exclude) {
        continue
      }
      menu.push({
        label: val,
        handler: () => {
          this.addToPlaylist(key, item)
        },
      })
    }
    return menu
  }

  public getSongContextMenu(exclude: string | undefined, event: Event, ...item: Song[]) {
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
        children: this.populatePlaylistMenu(item, exclude),
      },
    ]
    bus.$emit(EventBus.SHOW_CONTEXT, event, items)
  }

  public getYoutubeContextMenu(event: Event, ...item: YoutubeItem[]) {
    let items = [
      {
        label: 'Play Now',
        handler: () => {
          this.playTop(...toSong(...item))
        },
      },
      {
        label: 'Add To Queue',
        handler: () => {
          this.queueSong(...toSong(...item))
        },
      },
      {
        label: 'Add To Library',
        handler: () => window.DBUtils.storeSongs(toSong(...item)),
      },
      {
        label: 'Add To Playlist',
        children: this.populatePlaylistMenu(toSong(...item)),
      },
    ]
    bus.$emit(EventBus.SHOW_CONTEXT, event, items)
  }
}
