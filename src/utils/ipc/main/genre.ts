import { GenreEvents, IpcEvents } from './constants'
import { IpcChannelInterface, IpcRequest } from '.'
import { getDisabledPaths, preferences } from '@/utils/db/preferences'

import { SongDB } from '@/utils/db'

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

  private getAllGenres(event: Electron.IpcMainEvent, request: IpcRequest) {
    SongDB.getAllGenres()
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }

  private getGenre(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.id) {
      SongDB.getGenreSongs(request.params.id, getDisabledPaths(preferences.musicPaths))
        .then((data) => {
          event.reply(request.responseChannel, data)
        })
        .catch((e) => console.log(e))
    }
  }
}
