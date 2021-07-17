import { ExtensionHostEvents, IpcEvents } from './constants'

import { extensionHost } from '@/utils/extensions/index';

export class ExtensionHostChannel implements IpcChannelInterface {
  name = IpcEvents.EXTENSION_HOST
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case ExtensionHostEvents.EVENT_TRIGGER:
        this.sendData(event, request)
        break
    }
  }

  private sendData(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.data)
      extensionHost.send(request.params.data)
    event.reply(request.responseChannel)
  }
}
