interface IpcRequest {
  type: string
  responseChannel?: string
  params?: any
}

interface IpcChannelInterface {
  name: string
  handle(event: IpcMainEvent, request: IpcRequest): void
}