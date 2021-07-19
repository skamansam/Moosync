import { ExtensionHostEvents, IpcEvents } from './constants'

import { extensionHost } from '@/utils/extensions/index';

export class ExtensionHostChannel implements IpcChannelInterface {
  name = IpcEvents.EXTENSION_HOST
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case ExtensionHostEvents.EVENT_TRIGGER:
        this.sendData(event, request)
        break
      case ExtensionHostEvents.INSTALL:
        this.installExt(event, request)
        break
      case ExtensionHostEvents.GET_ALL_EXTENSIONS:
        this.getAllExtensions(event, request)
        break
    }
  }

  private installExt(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.path) {
      extensionHost.installExtension(request.params.path).then((result) => event.reply(request.responseChannel, result))
      return
    }
    event.reply(request.responseChannel, { success: false })
  }

  private getAllExtensions(event: Electron.IpcMainEvent, request: IpcRequest) {
    extensionHost.sendAsync({ type: 'get-installed-extensions', data: undefined }).then((data) => event.reply(request.responseChannel, data))
  }

  private sendData(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.data)
      extensionHost.send(request.params.data)
    event.reply(request.responseChannel)
  }
}
