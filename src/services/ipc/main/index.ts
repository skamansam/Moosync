import { ipcMain, IpcMainEvent } from 'electron'
import { AllAlbumsChannel, AllArtistsChannel, AllSongsChannel } from './songs'
import { ScannerChannel } from './scanner'
import { AddToPlaylistsChannel, AllPlaylistsChannel, CreatePlaylistsChannel } from './playlists'

export function registerIpcChannels() {
  const ipcChannels = [
    new AllSongsChannel(),
    new AllAlbumsChannel(),
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
