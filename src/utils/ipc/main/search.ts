import { IpcChannelInterface, IpcRequest } from '.'
import { IpcEvents, SearchEvents } from './constants'
import { getDisabledPaths, preferences } from '@/utils/db/preferences'

import { SongDB } from '@/utils/db'
import { ytScraper } from '@/utils/fetchers/searchYT'

export class SearchChannel implements IpcChannelInterface {
  name = IpcEvents.SEARCH
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case SearchEvents.SEARCH_SONGS_COMPACT:
        this.searchCompact(event, request)
        break
      case SearchEvents.SEARCH_ALL:
        this.searchAll(event, request)
        break
      case SearchEvents.SEARCH_YT:
        this.searchYT(event, request)
        break
    }
  }

  private searchAll(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params && request.params.searchTerm) {
      SongDB.searchAll(request.params.searchTerm, getDisabledPaths(preferences.musicPaths))
        .then((data) => {
          event.reply(request.responseChannel, data)
        })
        .catch((e) => console.log(e))
    }
  }

  private searchYT(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params && request.params.searchTerm) {
      ytScraper
        .searchTerm(request.params.searchTerm)
        .then((data) => event.reply(request.responseChannel, data))
        .catch((e) => console.log(e))
    }
  }

  private searchCompact(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params && request.params.searchTerm) {
      SongDB.searchSongsCompact(request.params.searchTerm, getDisabledPaths(preferences.musicPaths))
        .then((data) => event.reply(request.responseChannel, data))
        .catch((e) => console.log(e))
    }
  }
}
