export type ipcRendererRestricted = {
  send: (channel: string, request: IpcRequest) => void
  once: (responseChannel: string, listener: (response: any) => any) => void
  on: (responseChannel: string, listener: (...args: any) => any) => void
}

declare global {
  interface Window {
    ipcRenderer: ipcRendererRestricted
  }
}
