import { IpcRenderer } from 'electron'
import { IpcChannelInterface, IpcRequest } from '.'
import { SongDB } from '../../db'
import { IpcEvents } from './constants'

export class AllSongsChannel implements IpcChannelInterface {
  name = IpcEvents.GET_ALL_SONGS
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    SongDB.getAll()
      .then((data) => event.reply(request.responseChannel, data))
      .catch((e) => console.log(e))
  }
}
