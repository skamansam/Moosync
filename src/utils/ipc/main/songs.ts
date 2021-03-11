import { IpcChannelInterface, IpcRequest } from '.'
import { IpcEvents, SongEvents } from './constants'

import { SongDB } from '../../db'
import { getDisabledPaths } from '@/utils/db/preferences'
import { preferences } from '../../db/preferences'
import { Song } from '@/models/songs'

export class SongsChannel implements IpcChannelInterface {
  name = IpcEvents.SONG
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case SongEvents.GET_ALL_SONGS:
        this.getAllSongs(event, request)
        break
      case SongEvents.STORE_SONG:
        this.storeSongs(event, request)
        break
      case SongEvents.REMOVE_SONG:
        this.removeSongs(event, request)
        break
    }
  }

  private getAllSongs(event: Electron.IpcMainEvent, request: IpcRequest) {
    SongDB.getAllSongs(getDisabledPaths(preferences.musicPaths))
      .then((data) => event.reply(request.responseChannel, data))
      .catch((e) => console.log(e))
  }

  private removeSongs(event: Electron.IpcMainEvent, request: IpcRequest) {
    let promises: Promise<void>[] = []
    if (request.params.songs) {
      const songs = request.params.songs as Song[]
      for (const s of songs) {
        promises.push(SongDB.removeSong(s._id!))
      }
    }
    Promise.all(promises)
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }

  private storeSongs(event: Electron.IpcMainEvent, request: IpcRequest) {
    let promises: Promise<void>[] = []
    if (request.params.songs) {
      const songs = request.params.songs as Song[]
      for (const s of songs) {
        promises.push(SongDB.store(s))
      }
    }
    Promise.all(promises)
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }
}
