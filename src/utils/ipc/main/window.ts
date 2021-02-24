import { IpcChannelInterface, IpcRequest } from '.'
import { IpcEvents, WindowEvents } from './constants'

import { preferenceWindow } from '@/background'

export class BrowserWindowChannel implements IpcChannelInterface {
  name = IpcEvents.BROWSER_WINDOWS
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case WindowEvents.OPEN_PREFERENCE_WINDOW:
        this.openPreferenceWindow(event, request)
        break
      case WindowEvents.CLOSE_PREFERENCE_WINDOW:
        this.closePreferenceWindow(event, request)
        break
    }
  }

  private openPreferenceWindow(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (preferenceWindow) {
      preferenceWindow.show()
    }
    event.reply(request.responseChannel, null)
  }

  private closePreferenceWindow(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (preferenceWindow && preferenceWindow.isVisible) {
      preferenceWindow.hide()
    }
    event.reply(request.responseChannel, null)
  }
}
