import { IpcEvents, SearchEvents } from './constants'
import { getDisabledPaths, loadPreferences } from '@/utils/main/db/preferences'

import { SongDB } from '@/utils/main/db'
import { ytScraper } from '@/utils/main/fetchers/searchYT'

export class SearchChannel implements IpcChannelInterface {
  name = IpcEvents.SEARCH
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case SearchEvents.SEARCH_SONGS_BY_OPTIONS:
        this.searchSongByOptions(event, request)
        break
      case SearchEvents.SEARCH_ALL:
        this.searchAll(event, request)
        break
      case SearchEvents.SEARCH_YT:
        this.searchYT(event, request)
        break
      case SearchEvents.SEARCH_ENTITY_BY_OPTIONS:
        this.searchEntityByOptions(event, request)
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
        .catch((e) => console.error(e))
    }
  }

  private searchYT(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params && request.params.searchTerm) {
      ytScraper
        .searchTerm(request.params.searchTerm)
        .then((data) => event.reply(request.responseChannel, data))
        .catch((e) => console.error(e))
    }
  }

  private async searchSongByOptions(event: Electron.IpcMainEvent, request: IpcRequest) {
    const preferences = loadPreferences()
    SongDB.getSongByOptions(
      request.params.options,
      getDisabledPaths(preferences.musicPaths))
      .then((data) => event.reply(request.responseChannel, data))
      .catch((e) => console.error(e))
  }

  private async searchEntityByOptions(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params && request.params.options) {
      SongDB.getEntityByOptions(request.params.options)
        .then((data) => event.reply(request.responseChannel, data))
        .catch((e) => console.error(e))
    }
  }
}
