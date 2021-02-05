import { IpcChannelInterface, IpcRequest } from '.'
import { SongDB } from '../../db'
import { IpcEvents } from './constants'

export class AllSongsChannel implements IpcChannelInterface {
  name = IpcEvents.GET_ALL_SONGS
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    SongDB.getAllSongs()
      .then((data) => event.reply(request.responseChannel, data))
      .catch((e) => console.log(e))
  }
}

export class AllAlbumsChannel implements IpcChannelInterface {
  name = IpcEvents.GET_ALBUMS
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    SongDB.getAllAlbums()
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }
}
