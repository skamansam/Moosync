import { AlbumEvents, IpcEvents } from './constants'
import { IpcChannelInterface, IpcRequest } from '.'
import { getDisabledPaths, loadPreferences } from '@/utils/main/db/preferences'

import { SongDB } from '@/utils/main/db'

export class AlbumsChannel implements IpcChannelInterface {
  name = IpcEvents.ALBUM
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case AlbumEvents.GET_ALL_ALBUMS:
        this.getAllAlbums(event, request)
        break
      case AlbumEvents.GET_ALBUM:
        this.getSingleAlbum(event, request)
        break
    }
  }

  private async getAllAlbums(event: Electron.IpcMainEvent, request: IpcRequest) {
    const preferences = await loadPreferences()
    SongDB.getAllAlbums(getDisabledPaths(preferences.musicPaths))
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }

  private async getSingleAlbum(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.id) {
      const preferences = await loadPreferences()
      SongDB.getAlbumSongs(request.params.id, getDisabledPaths(preferences.musicPaths))
        .then((data) => {
          event.reply(request.responseChannel, data)
        })
        .catch((e) => console.log(e))
    }
  }
}
