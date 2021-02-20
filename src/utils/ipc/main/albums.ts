import { IpcChannelInterface, IpcRequest } from '.'

import { IpcEvents } from './constants'
import { SongDB } from '@/utils/db'

export class AllAlbumsChannel implements IpcChannelInterface {
  name = IpcEvents.GET_ALL_ALBUMS
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    SongDB.getAllAlbums()
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }
}

export class SingleAlbumChannel implements IpcChannelInterface {
  name = IpcEvents.GET_ALBUM
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    if (request.params.id) {
      SongDB.getAlbumSongs(request.params.id)
        .then((data) => {
          event.reply(request.responseChannel, data)
        })
        .catch((e) => console.log(e))
    }
  }
}
