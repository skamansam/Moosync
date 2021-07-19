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

function sendInstalledExtensions(items: ExtensionDetails[]) {
  if (process.send)
    process.send({ type: 'get-installed-extensions', data: items } as mainHostMessage)
}

function parseEventType(message: extensionHostMessage) {
  switch (message.type) {
    case 'find-new-extensions':
      manager?.registerPlugins().then(() => manager?.startAll())
      break
    case 'app-path':
      manager = new ExtensionHandler([message.data])
      manager.startAll()
      break
    case 'get-installed-extensions':
      if (manager)
        sendInstalledExtensions(manager.getInstalledExtensions())
      break
    default:
      manager?.sendEvent(message)
  }
}