import { GenreEvents, IpcEvents } from './constants'
import { getDisabledPaths, loadPreferences } from '@/utils/main/db/preferences'

import { SongDB } from '@/utils/main/db'

export class GenreChannel implements IpcChannelInterface {
  name = IpcEvents.GENRE
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case GenreEvents.GET_ALL_GENRE:
        this.getAllGenres(event, request)
        break
      case GenreEvents.GET_GENRE:
        this.getGenre(event, request)
        break
    }
  }

  private async getAllGenres(event: Electron.IpcMainEvent, request: IpcRequest) {
    const preferences = await loadPreferences()
    SongDB.getAllGenres(getDisabledPaths(preferences.musicPaths))
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }

  private async getGenre(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.id) {
      const preferences = await loadPreferences()
      SongDB.getGenreSongs(request.params.id, getDisabledPaths(preferences.musicPaths))
        .then((data) => {
          event.reply(request.responseChannel, data)
        })
        .catch((e) => console.log(e))
    }
  }
}
