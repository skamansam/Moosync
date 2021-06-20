import { BrowserWindow, dialog, shell } from 'electron'
import { IpcEvents, WindowEvents } from './constants'
import { createPreferenceWindow, mainWindow } from '@/background'

export class BrowserWindowChannel implements IpcChannelInterface {
  name = IpcEvents.BROWSER_WINDOWS
  preferenceWindow: BrowserWindow | null = null
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case WindowEvents.OPEN_PREF:
        this.openPreferenceWindow(event, request)
        break
      case WindowEvents.CLOSE_PREF:
        this.closePreferenceWindow(event, request)
        break
      case WindowEvents.MIN_PREF:
        this.minPreferenceWindow(event, request)
        break
      case WindowEvents.MAX_PREF:
        this.maxPreferenceWindow(event, request)
        break
      case WindowEvents.TOGGLE_DEV_TOOLS:
        this.toggleDevTools(event, request)
        break
      case WindowEvents.OPEN_FILE_BROWSER:
        this.getFolder(event, request)
        break
      case WindowEvents.CLOSE_MAIN:
        this.closeMainWindow(event, request)
        break
      case WindowEvents.MAX_MAIN:
        this.maxMainWindow(event, request)
        break
      case WindowEvents.MIN_MAIN:
        this.minMainWindow(event, request)
        break
      case WindowEvents.OPEN_URL_EXTERNAL:
        this.openUrl(event, request)
        break
    }
  }

  private async openPreferenceWindow(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (!this.preferenceWindow || this.preferenceWindow.isDestroyed())
      this.preferenceWindow = await createPreferenceWindow()
    event.reply(request.responseChannel, null)
  }

  private closePreferenceWindow(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (this.preferenceWindow && !this.preferenceWindow.isDestroyed() && this.preferenceWindow.isVisible) {
      // Hide window before to make it seem responsive
      this.preferenceWindow.hide()
      this.preferenceWindow.close()
      this.preferenceWindow = null
    }
    event.reply(request.responseChannel, null)
  }

  private maxPreferenceWindow(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (this.preferenceWindow && !this.preferenceWindow.isDestroyed() && this.preferenceWindow.maximizable) {
      if (this.preferenceWindow.isMaximized()) {
        this.preferenceWindow.restore()
      } else {
        this.preferenceWindow.maximize()
      }
    }
    event.reply(request.responseChannel, this.preferenceWindow ? this.preferenceWindow.isMaximized() : false)
  }

  private minPreferenceWindow(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (this.preferenceWindow && !this.preferenceWindow.isDestroyed() && this.preferenceWindow.minimizable) {
      this.preferenceWindow.minimize()
    }
    event.reply(request.responseChannel)
  }

  private toggleDevTools(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (mainWindow) {
      if (mainWindow.webContents.isDevToolsOpened()) mainWindow.webContents.closeDevTools()
      else mainWindow.webContents.openDevTools()
    }
    event.reply(request.responseChannel, null)
  }

  private getFolder(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (this.preferenceWindow) {
      dialog
        .showOpenDialog(this.preferenceWindow, {
          properties: ['openDirectory'],
        })
        .then((folders) => {
          event.reply(request.responseChannel, folders)
        })
    }
  }

  private closeMainWindow(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (mainWindow) {
      // Hide window before to make it seem responsive
      mainWindow.hide()
      mainWindow.close()
    }
    event.reply(request.responseChannel)
  }

  private maxMainWindow(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (mainWindow.maximizable) {
      if (mainWindow.isMaximized()) {
        mainWindow.restore()
      } else {
        mainWindow.maximize()
      }
    }
    event.reply(request.responseChannel, mainWindow.isMaximized())
  }

  private minMainWindow(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (mainWindow && mainWindow.minimizable) {
      mainWindow.minimize()
    }
    event.reply(request.responseChannel)
  }

  private openUrl(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.url)
      shell.openExternal(request.params.url).then(() => event.reply(request.responseChannel))
  }
}
