import { IpcChannelInterface, IpcRequest } from '.'
import { IpcEvents, SearchEvents } from './constants'
import { getDisabledPaths, preferences } from '@/utils/db/preferences'

import { SongDB } from '@/utils/db'

export class SearchChannel implements IpcChannelInterface {
  name = IpcEvents.SEARCH
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case SearchEvents.SEARCH_SONGS:
        this.searchSongs(event, request)
        break
    }
  }

  private searchSongs(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params && request.params.searchTerm) {
      SongDB.searchSongs(request.params.searchTerm, getDisabledPaths(preferences.musicPaths))
        .then((data) => event.reply(request.responseChannel, data))
        .catch((e) => console.log(e))
    }
  }
}
