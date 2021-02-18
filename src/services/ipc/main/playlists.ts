import { SongDB } from '@/services/db'
import { IpcChannelInterface, IpcRequest } from '.'
import { IpcEvents } from './constants'

export class AllPlaylistsChannel implements IpcChannelInterface {
  name = IpcEvents.GET_PLAYLISTS
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    SongDB.getPlaylists()
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }
}

export class CreatePlaylistsChannel implements IpcChannelInterface {
  name = IpcEvents.CREATE_PLAYLIST
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    SongDB.createPlaylist(request.params.name)
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }
}

export class AddToPlaylistsChannel implements IpcChannelInterface {
  name = IpcEvents.ADD_TO_PLAYLIST
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    console.log('adding to playlist')
    SongDB.addToPlaylist(request.params.playlist_id, ...request.params.song_ids)
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }
}
