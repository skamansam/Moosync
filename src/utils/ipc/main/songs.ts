import { IpcChannelInterface, IpcRequest } from '.'

import { IpcEvents } from './constants'
import { SongDB } from '../../db'

export class AllSongsChannel implements IpcChannelInterface {
  name = IpcEvents.GET_ALL_SONGS
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    SongDB.getAllSongs()
      .then((data) => event.reply(request.responseChannel, data))
      .catch((e) => console.log(e))
  }
}

export class AllArtistsChannel implements IpcChannelInterface {
  name = IpcEvents.GET_ALL_ARTISTS
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    SongDB.getAllArtists()
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }
}
