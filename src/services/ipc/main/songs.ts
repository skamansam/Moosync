import { IpcRenderer } from 'electron'
import { IpcChannelInterface, IpcRequest } from '.'
import { CoverDBInstance, SongDBInstance } from '../../db'
import { IpcEvents } from './constants'

export class AllSongsChannel implements IpcChannelInterface {
  name = IpcEvents.GET_ALL_SONGS
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    const dbInstance = new SongDBInstance()
    dbInstance
      .getAll()
      .then((data) => event.reply(request.responseChannel, data))
      .catch((e) => console.log(e))
  }
}
