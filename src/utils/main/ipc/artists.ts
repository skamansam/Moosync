import { ArtistEvents, IpcEvents } from './constants'
import { getDisabledPaths, loadPreferences } from '@/utils/main/db/preferences'

import { SongDB } from '@/utils/main/db'

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

  private async getAllArtists(event: Electron.IpcMainEvent, request: IpcRequest) {
    const preferences = await loadPreferences()
    SongDB.getAllArtists(getDisabledPaths(preferences.musicPaths))
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }

  private async getArtist(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.id) {
      const preferences = await loadPreferences()
      SongDB.getArtistSongs(request.params.id, getDisabledPaths(preferences.musicPaths))
        .then((data) => {
          event.reply(request.responseChannel, data)
        })
        .catch((e) => console.log(e))
    }
  }
}
