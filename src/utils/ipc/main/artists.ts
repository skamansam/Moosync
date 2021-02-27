import { ArtistEvents, IpcEvents } from './constants'
import { IpcChannelInterface, IpcRequest } from '.'
import { getDisabledPaths, preferences } from '@/utils/db/preferences'

import { SongDB } from '@/utils/db'

export class ArtistsChannel implements IpcChannelInterface {
  name = IpcEvents.ARTIST
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case ArtistEvents.GET_ALL_ARTISTS:
        this.getAllArtists(event, request)
        break
      case ArtistEvents.GET_ARTIST:
        this.getArtist(event, request)
        break
    }
  }

  private getAllArtists(event: Electron.IpcMainEvent, request: IpcRequest) {
    SongDB.getAllArtists(getDisabledPaths(preferences.musicPaths))
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }

  private getArtist(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.id) {
      SongDB.getArtistSongs(request.params.id, getDisabledPaths(preferences.musicPaths))
        .then((data) => {
          event.reply(request.responseChannel, data)
        })
        .catch((e) => console.log(e))
    }
  }
}
