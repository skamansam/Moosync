import { AlbumsChannel } from './albums'
import { ArtistsChannel } from './artists'
import { BrowserWindowChannel } from './window'
import { ExtensionHostChannel } from './extensionHost'
import { GenreChannel } from './genre'
import { IpcEvents } from './constants';
import { LoggerChannel } from './logger'
import { PlaylistsChannel } from './playlists'
import { PreferenceChannel } from './preferences'
import { ScannerChannel } from './scanner'
import { SearchChannel } from './search'
import { SongsChannel } from './songs'
import { StoreChannel } from './store'
import { ipcMain } from 'electron'
import { mainWindow } from '@/background'

export const scannerChannel = new ScannerChannel()

export function registerIpcChannels() {
  const ipcChannels = [
    new SongsChannel(),
    new AlbumsChannel(),
    scannerChannel,
    new PlaylistsChannel(),
    new ArtistsChannel(),
    new GenreChannel(),
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
  mainWindow.webContents.send(IpcEvents.NOTIFIER, notif)
}


