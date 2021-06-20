import { IpcEvents } from './constants'
import { StoreEvents } from '@/utils/main/ipc/constants'
import { store } from '@/utils/main/db/preferences'
import keytar from 'keytar'
import os from 'os'

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
      case StoreEvents.SET_SECURE:
        this.setKeytar(event, request)
        break
      case StoreEvents.GET_SECURE:
        this.getKeytar(event, request)
        break
      case StoreEvents.REMOVE_SECURE:
        this.removeKeytar(event, request)
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

  private async setKeytar(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.token && request.params.service) {
      await keytar.setPassword(request.params.service, os.userInfo().username, request.params.token)
      event.reply(request.responseChannel)
    }
  }

  private async removeKeytar(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.service) {
      await keytar.deletePassword(request.params.service, os.userInfo().username)
      event.reply(request.responseChannel)
    }
  }

  private async getKeytar(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.service) {
      const token = await keytar.getPassword(request.params.service, os.userInfo().username)
      event.reply(request.responseChannel, token)
    }
  }
}
