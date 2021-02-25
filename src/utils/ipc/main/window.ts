import { IpcChannelInterface, IpcRequest } from '.'
import { IpcEvents, WindowEvents } from './constants'
import { createPreferenceWindow, mainWindow } from '@/background'

import { BrowserWindow } from 'electron'

export class BrowserWindowChannel implements IpcChannelInterface {
  name = IpcEvents.BROWSER_WINDOWS
  preferenceWindow: BrowserWindow | null = null
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case WindowEvents.OPEN_PREFERENCE_WINDOW:
        this.openPreferenceWindow(event, request)
        break
      case WindowEvents.CLOSE_PREFERENCE_WINDOW:
        this.closePreferenceWindow(event, request)
        break
      case WindowEvents.TOGGLE_DEV_TOOLS:
        this.toggleDevTools(event, request)
        break
    }
  }

  private async openPreferenceWindow(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (!this.preferenceWindow || this.preferenceWindow.isDestroyed())
      this.preferenceWindow = await createPreferenceWindow()
    this.preferenceWindow.show()

    event.reply(request.responseChannel, null)
  }

  private closePreferenceWindow(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (this.preferenceWindow && !this.preferenceWindow.isDestroyed() && this.preferenceWindow.isVisible) {
      this.preferenceWindow.close()
      this.preferenceWindow = null
    }
    event.reply(request.responseChannel, null)
  }

  private toggleDevTools(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (mainWindow) {
      if (mainWindow.webContents.isDevToolsOpened()) mainWindow.webContents.closeDevTools()
      else mainWindow.webContents.openDevTools()
    }
    event.reply(request.responseChannel, null)
  }
}
