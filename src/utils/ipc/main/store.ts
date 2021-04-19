import { IpcEvents } from './constants'
import { IpcChannelInterface, IpcRequest } from '.'
import { StoreEvents } from '@/utils/ipc/main/constants'
import { store } from '@/utils/db/preferences'

export class StoreChannel implements IpcChannelInterface {
  name = IpcEvents.STORE
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case StoreEvents.SET_DATA:
        this.setData(event, request)
        break
      case StoreEvents.GET_DATA:
        this.getData(event, request)
        break
    }
  }

  private setData(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.key) {
      store.set(request.params.key, request.params.value)
    }
    event.reply(request.responseChannel)
  }

  private getData(event: Electron.IpcMainEvent, request: IpcRequest) {
    event.reply(request.responseChannel, store.get(request.params.key))
  }
}
