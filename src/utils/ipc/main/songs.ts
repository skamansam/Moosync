import { IpcChannelInterface, IpcRequest } from '.'
import { IpcEvents, SongEvents } from './constants'

import { SongDB } from '../../db'
import { getDisabledPaths } from '@/utils/db/preferences'
import { preferences } from '../../db/preferences'

export class SongsChannel implements IpcChannelInterface {
  name = IpcEvents.SONG
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case SongEvents.GET_ALL_SONGS:
        this.getAllSongs(event, request)
        break
    }
  }

  private getAllSongs(event: Electron.IpcMainEvent, request: IpcRequest) {
    SongDB.getAllSongs(getDisabledPaths(preferences.musicPaths))
      .then((data) => event.reply(request.responseChannel, data))
      .catch((e) => console.log(e))
  }
}
