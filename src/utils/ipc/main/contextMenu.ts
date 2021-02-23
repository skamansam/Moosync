import { ContextMenuEvents, IpcEvents } from './constants'
import { IpcChannelInterface, IpcRequest } from '.'
import { Menu, MenuItem } from 'electron'

import { SongDB } from '@/utils/db'
import { playlistInfo } from '@/store/playlists'

function getPlaylistsMenu(playlists: playlistInfo, onClick: (playlist_id: string) => void, onNewPlaylist: () => void) {
  let menu = new Menu()
  for (let p in playlists) {
    menu.append(
      new MenuItem({
        label: playlists[p],
        click: () => onClick(p),
      })
    )
  }
  menu.append(
    new MenuItem({
      label: 'New Playlist',
      click: onNewPlaylist,
    })
  )
  return menu
}

function getSongContextMenu(playlists: playlistInfo, onClick: (p: string) => void, onNewPlaylist: () => void) {
  let menu = new Menu()
  menu.append(
    new MenuItem({
      label: 'Add to playlist',
      submenu: getPlaylistsMenu(playlists, (p: string) => onClick(p), onNewPlaylist),
    })
  )
  menu.popup()
}

export class ContextMenuChannel implements IpcChannelInterface {
  name = IpcEvents.CONTEXT_MENU
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case ContextMenuEvents.SONGS_MENU:
        this.addToPlaylist(event, request)
        break
    }
  }

  private addToPlaylist(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.playlists && request.params.song) {
      getSongContextMenu(
        request.params.playlists,
        (p: string) => {
          SongDB.addToPlaylist(p, ...[request.params.song])
            .then((data) => {
              event.reply(request.responseChannel, { type: 'addedToPlaylist', data: data })
            })
            .catch((e) => console.log(e))
        },
        () => event.reply(request.responseChannel, { type: 'newPlaylist' })
      )
    }
  }
}
