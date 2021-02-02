import { IpcChannelInterface, IpcRequest } from '.'
import { IpcEvents } from './constants'
import { CoverDB } from '../../db'

export class CoverChannel implements IpcChannelInterface {
  name = IpcEvents.GET_COVER
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    CoverDB.getByID(request.params as string)
      .then((data) => event.reply(request.responseChannel, data))
      .catch((e) => console.log(e))
  }
}
