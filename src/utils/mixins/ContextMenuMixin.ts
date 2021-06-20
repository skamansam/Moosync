import { Component } from 'vue-property-decorator'
import { EventBus } from '@/utils/ipc/main/constants'
import { MenuItem } from 'vue-context-menu-popup'
import PlayerControls from '@/utils/mixins/PlayerControls'
import { Song } from '@/models/songs'
import { bus } from '@/mainWindow/main'
import { mixins } from 'vue-class-component'
import { YoutubeItem } from '@/models/youtube'
import { toSong } from '@/models/youtube'
import { vxm } from '@/mainWindow/store'
import { Playlist } from '@/models/playlists'

export enum ContextTypes {
  SONGS = 'songsMenu',
  YOUTUBE = 'youtubeMenu',
  PLAYLIST = 'playlistMenu',
  GENERAL_PLAYLIST = 'generalPlaylistMenu',
  PLAYLIST_CONTENT = 'playlistContentContextMenu'
}

export type ContextMenuArgs = {
  type: ContextTypes.SONGS
  args: {
    exclude: string | undefined
    songs: Song[]
  }
} | {
  type: ContextTypes.YOUTUBE
  args: {
    ytItems: YoutubeItem[]
  }
} | {
  type: ContextTypes.PLAYLIST
  args: {
    playlist: Playlist
    refreshCallback: () => void
  }
} |
{
  type: ContextTypes.GENERAL_PLAYLIST
} | {
  type: ContextTypes.PLAYLIST_CONTENT,
  args: {
    isRemote: boolean,
    songs: Song[]
  }
}

@Component
export default class ContextMenuMixin extends mixins(PlayerControls) {
  get playlists() {
    return vxm.playlist.playlists
  }

  private async addToPlaylist(playlist_id: string, songs: Song[]) {
    window.DBUtils.addToPlaylist(playlist_id, ...songs)
  }

  private populatePlaylistMenu(item: Song[], exclude?: string): MenuItem[] {
    const menu: MenuItem[] = [
      {
        label: 'Create Playlist',
        handler: () => {
          bus.$emit(EventBus.SHOW_NEW_PLAYLIST_MODAL, item)
        }
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

  private getSongContextMenu(exclude: string | undefined, ...item: Song[]) {
    const items = [
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
    return items
  }

  private getYoutubeContextMenu(...item: YoutubeItem[]) {
    const items = [
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
    return items
  }

  private getPlaylistContextMenu(playlist: Playlist, refreshCallback: () => void) {
    const items = [
      {
        label: 'Remove Playlist',
        handler: () => {
          window.DBUtils.removePlaylist(playlist.playlist_id)
          refreshCallback()
        },
      }
    ]
    return items
  }

  private getPlaylistContentContextMenu(isRemote: boolean, ...item: Song[]) {
    const items = this.getSongContextMenu(undefined, ...item)
    if (isRemote) {
      items.push({
        label: 'Add Song to Library',
        handler: () => window.DBUtils.storeSongs(item),
      })
    }
    return items
  }

  private getGeneralPlaylistMenu() {
    const items = [
      {
        label: 'Add Playlist from URL',
        handler: () => {
          bus.$emit(EventBus.SHOW_ADD_PLAYLIST_MODAL)
        },
      }
    ]
    return items
  }

  public getContextMenu(event: Event, options: ContextMenuArgs) {
    let items: { label: string, handler?: () => void }[] = []
    switch (options.type) {
      case ContextTypes.SONGS:
        items = this.getSongContextMenu(options.args.exclude, ...options.args.songs)
        break
      case ContextTypes.YOUTUBE:
        items = this.getYoutubeContextMenu(...options.args.ytItems)
        break
      case ContextTypes.PLAYLIST:
        items = this.getPlaylistContextMenu(options.args.playlist, options.args.refreshCallback)
        break
      case ContextTypes.GENERAL_PLAYLIST:
        items = this.getGeneralPlaylistMenu()
        break
      case ContextTypes.PLAYLIST_CONTENT:
        items = this.getPlaylistContentContextMenu(options.args.isRemote, ...options.args.songs)
        break
    }
    this.emitMenu(event, items)
  }

  private emitMenu(event: Event, items: { label: string, handler?: () => void }[]) {
    bus.$emit(EventBus.SHOW_CONTEXT, event, items)
  }
}
