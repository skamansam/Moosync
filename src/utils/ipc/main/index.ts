import { AddToPlaylistsChannel, AllPlaylistsChannel, CreatePlaylistsChannel } from './playlists'
import { AllAlbumsChannel, SingleAlbumChannel } from './albums'
import { AllArtistsChannel, AllSongsChannel } from './songs'
import { IpcMainEvent, ipcMain } from 'electron'

import { ScannerChannel } from './scanner'

export function registerIpcChannels() {
  const ipcChannels = [
    new AllSongsChannel(),
    new AllAlbumsChannel(),
    new SingleAlbumChannel(),
    new AllArtistsChannel(),
    new ScannerChannel(),
    new AllPlaylistsChannel(),
    new CreatePlaylistsChannel(),
    new AddToPlaylistsChannel(),
  ]
  ipcChannels.forEach((channel) => ipcMain.on(channel.name, (event, request) => channel.handle(event, request)))
}

export interface IpcRequest {
  responseChannel?: string
  params?: any
}

export interface IpcChannelInterface {
  name: string
  handle(event: IpcMainEvent, request: IpcRequest): void
}
