import { IpcChannelInterface, IpcRequest } from '.'
import { IpcEvents, SongEvents } from './constants'
import { getDisabledPaths, loadPreferences } from '@/utils/db/preferences'

import { SongDB } from '../../db'

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
    loadPreferences().then((prefs) => {
      SongDB.getAllSongs(getDisabledPaths(prefs.musicPaths))
        .then((data) => event.reply(request.responseChannel, data))
        .catch((e) => console.log(e))
    })
  }
}
