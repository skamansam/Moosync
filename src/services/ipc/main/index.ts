import { ipcMain, IpcMainEvent } from 'electron'
import { AllSongsChannel } from './songs'
import { ScannerChannel } from './scanner'
import { CoverChannel } from './covers'

export function registerIpcChannels() {
  const ipcChannels = [new AllSongsChannel(), new ScannerChannel(), new CoverChannel()]
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
