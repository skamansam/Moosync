import { IpcChannelInterface, IpcRequest } from '.'
import { IpcEvents, PlaylistEvents } from './constants'

import { SongDB } from '@/utils/db'

export class PlaylistsChannel implements IpcChannelInterface {
  name = IpcEvents.PLAYLIST
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case PlaylistEvents.ADD_TO_PLAYLIST:
        this.addToPlaylist(event, request)
        break
      case PlaylistEvents.CREATE_PLAYLIST:
        this.createPlaylist(event, request)
        break
      case PlaylistEvents.GET_PLAYLISTS:
        this.getAllPlaylists(event, request)
        break
    }
  }

  private getAllPlaylists(event: Electron.IpcMainEvent, request: IpcRequest) {
    SongDB.getPlaylists()
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }

  private createPlaylist(event: Electron.IpcMainEvent, request: IpcRequest) {
    SongDB.createPlaylist(request.params.name)
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }
  private addToPlaylist(event: Electron.IpcMainEvent, request: IpcRequest) {
    SongDB.addToPlaylist(request.params.playlist_id, ...request.params.song_ids)
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }
}
