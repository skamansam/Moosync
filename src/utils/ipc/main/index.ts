import { IpcMainEvent, ipcMain } from 'electron'

import { AlbumsChannel } from './albums'
import { ArtistsChannel } from './artists'
import { BrowserWindowChannel } from './window'
import { GenreChannel } from './genre'
import { PlaylistsChannel } from './playlists'
import { PreferenceChannel } from './preferences'
import { ScannerChannel } from './scanner'
import { SearchChannel } from './search'
import { SongsChannel } from './songs'
import { StoreChannel } from './store'

export function registerIpcChannels() {
  const ipcChannels = [
    new SongsChannel(),
    new AlbumsChannel(),
    new ScannerChannel(),
    new PlaylistsChannel(),
    new ArtistsChannel(),
    new GenreChannel(),
    new BrowserWindowChannel(),
    new PreferenceChannel(),
    new SearchChannel(),
    new StoreChannel(),
  ]
  ipcChannels.forEach((channel) => ipcMain.on(channel.name, (event, request) => channel.handle(event, request)))
}

export interface IpcRequest {
  type: string
  responseChannel?: string
  params?: any
}

export interface IpcChannelInterface {
  name: string
  handle(event: IpcMainEvent, request: IpcRequest): void
}
