import { IpcEvents } from './constants'
import { StoreEvents } from '@/utils/main/ipc/constants'
import keytar from 'keytar'
import os from 'os'

export class StoreChannel implements IpcChannelInterface {
  name = IpcEvents.STORE
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
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

  private async setKeytar(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.token && request.params.service) {
      try {
        await keytar.setPassword(request.params.service, os.userInfo().username, request.params.token)
      } catch (e) {
        console.error(e)
      }
    }
    event.reply(request.responseChannel)
  }

  private async removeKeytar(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.service) {
      try {
        await keytar.deletePassword(request.params.service, os.userInfo().username)
      } catch (e) {
        console.error(e)
      }
    }
    event.reply(request.responseChannel)
  }

  private async getKeytar(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.service) {
      try {
        const token = await keytar.getPassword(request.params.service, os.userInfo().username)
        event.reply(request.responseChannel, token)
      } catch (e) {
        console.error(e)
      }
    }
    event.reply(request.responseChannel)
  }
}
