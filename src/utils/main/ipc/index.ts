import { BrowserWindowChannel } from './window'
import { ExtensionHostChannel } from './extensionHost'
import { IpcEvents } from './constants'
import { LoggerChannel } from './logger'
import { PlaylistsChannel } from './playlists'
import { PreferenceChannel } from './preferences'
import { ScannerChannel } from './scanner'
import { SearchChannel } from './search'
import { SongsChannel } from './songs'
import { StoreChannel } from './store'
import { WindowHandler } from '../windowManager'
import { ipcMain } from 'electron'

export const scannerChannel = new ScannerChannel()

export function registerIpcChannels() {
  const ipcChannels = [
    new SongsChannel(),
    scannerChannel,
    new PlaylistsChannel(),
    new BrowserWindowChannel(),
    new PreferenceChannel(),
    new SearchChannel(),
    new StoreChannel(),
    new LoggerChannel(),
    new ExtensionHostChannel()
  ]
  ipcChannels.forEach((channel) => ipcMain.on(channel.name, (event, request) => channel.handle(event, request)))
}

export function notifyRenderer(notif: NotificationObject) {
  WindowHandler.getWindow()?.webContents.send(IpcEvents.NOTIFIER, notif)
}


