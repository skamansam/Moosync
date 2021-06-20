import { IpcRequest } from '@/utils/main/ipc'
import { IpcRenderer } from 'electron'
import { v4 } from 'uuid';

export class IpcRendererHolder {
  ipcRenderer: IpcRenderer

  constructor(renderer: IpcRenderer) {
    this.ipcRenderer = renderer
  }

  public send<T>(channel: string, request: IpcRequest): Promise<T> {
    if (!request.responseChannel) {
      request.responseChannel = v4()
    }
    this.ipcRenderer.send(channel, request)

    return new Promise((resolve) => {
      this.ipcRenderer.once(request.responseChannel!, (_, response) => resolve(response))
    })
  }

  public on<T>(channel: string, callback: (...args: T[]) => void) {
    this.ipcRenderer.on(channel, (_, ...args: any[]) => callback(...args))
  }

  public removeAllListener<T>(channel: string) {
    this.ipcRenderer.removeAllListeners(channel)
  }
}
