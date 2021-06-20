import { IpcEvents, SearchEvents } from './constants'
import { getDisabledPaths, loadPreferences } from '@/utils/main/db/preferences'

import { SongDB } from '@/utils/main/db'
import { ytScraper } from '@/utils/main/fetchers/searchYT'

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

  private async searchAll(event: Electron.IpcMainEvent, request: IpcRequest) {
    const preferences = await loadPreferences()
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

  private async searchCompact(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params && request.params.searchTerm) {
      const preferences = await loadPreferences()
      SongDB.searchSongsCompact(request.params.searchTerm, getDisabledPaths(preferences.musicPaths))
        .then((data) => event.reply(request.responseChannel, data))
        .catch((e) => console.log(e))
    }
  }
}
