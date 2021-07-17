import { ExtensionHandler } from '@/utils/extensions/sandbox/handler'

setGlobalMethods()

let manager: ExtensionHandler | undefined

process.on('message', (message: extensionHostMessage) => {
  parseEventType(message)
})

function get<T>(key: mainHostMessage): Promise<T> {
  if (process.send) {
    process.send({ type: 'get-all-songs' } as mainHostMessage)
    return new Promise(resolve => {
      let listener: (data: extensionHostMessage) => void
      process.on('message', listener = function (data: extensionHostMessage) {
        if (data.type === key.type) {
          process.off('message', listener)
          resolve(data.data as any)
        }
      })
    })
  }
  return Promise.resolve() as Promise<any>
}

function setGlobalMethods() {
  global.getAllSongs = () => get<Song[]>({ type: 'get-all-songs' } as mainHostMessage)
}

function parseEventType(message: extensionHostMessage) {
  switch (message.type) {
    case 'app-path':
      console.log('got path', message.data)
      manager = new ExtensionHandler([message.data])
      manager.startAll()
      break
    default:
      manager?.sendEvent(message)
  }
}