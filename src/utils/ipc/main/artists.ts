import { ArtistEvents, IpcEvents } from './constants'
import { IpcChannelInterface, IpcRequest } from '.'

import { SongDB } from '@/utils/db'

export class ArtistsChannel implements IpcChannelInterface {
  name = IpcEvents.ARTIST
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case ArtistEvents.GET_ALL_ARTISTS:
        this.getAllArtists(event, request)
        break
    }
  }

  private getAllArtists(event: Electron.IpcMainEvent, request: IpcRequest) {
    SongDB.getAllArtists()
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }
}
