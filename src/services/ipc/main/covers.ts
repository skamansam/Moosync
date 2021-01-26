import { CoverDBInstance } from '@/services/db'
import { IpcChannelInterface, IpcRequest } from '.'
import { IpcEvents } from './constants'

export class CoverChannel implements IpcChannelInterface {
  name = IpcEvents.GET_COVER
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    const dbInstance = new CoverDBInstance()
    dbInstance
      .getByID(request.params as string)
      .then((data) => event.reply(request.responseChannel, data))
      .catch((e) => console.log(e))
  }
}
