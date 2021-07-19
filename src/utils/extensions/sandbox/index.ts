import { ExtensionHandler } from '@/utils/extensions/sandbox/handler'
import { extensionEventsKeys } from '@/utils/extensions/constants';
import { extensionRequests } from '@/utils/extensions/constants';
import { mainRequestsKeys } from '@/utils/extensions/constants';
import { v4 } from 'uuid';

class ExtensionHostIPCHandler {
  private extensionHandler: ExtensionHandler
  private mainRequestHandler: MainRequestHandler
  private extensionRequestGenerator = new ExtensionRequestGenerator()

  constructor() {
    this.extensionHandler = new ExtensionHandler(process.argv)
    this.mainRequestHandler = new MainRequestHandler(this.extensionHandler)

    this.registerListeners()
    this.setGlobalMethods()
  }

  private isExtensionEvent(key: string) {
    return extensionEventsKeys.includes(key as any)
  }

  private isMainRequest(key: string) {
    return mainRequestsKeys.includes(key as any)
  }

  private registerListeners() {
    process.on('message', (message: extensionHostMessage) => {
      this.parseMessage(message)
    })
  }

  private setGlobalMethods() {
    global.getAllSongs = this.extensionRequestGenerator.getAllSongs
  }

  private parseMessage(message: extensionHostMessage) {
    if (this.isExtensionEvent(message.type)) {
      this.extensionHandler.sendEvent(message as extensionEventMessage)
      return
    }

    if (this.isMainRequest(message.type)) {
      this.mainRequestHandler.parseRequest(message as mainRequestMessage)
      return
    }
  }
}

class ExtensionRequestGenerator {

  public async getAllSongs() {
    return this.sendAsync<Song[]>('get-all-songs')
  }

  private sendAsync<T>(type: extensionRequests): Promise<T | undefined> {
    const channel = v4()
    return new Promise(resolve => {
      if (process.send) {
        let listener: (data: extensionReplyMessage) => void
        process.on('message', listener = function (data: extensionReplyMessage) {
          if (data.channel === channel) {
            process.off('message', listener)
            resolve(data.data)
          }
        })
        process.send({ type } as mainHostMessage)
      }
      resolve(undefined)
    })
  }
}

class MainRequestHandler {
  handler: ExtensionHandler

  constructor(handler: ExtensionHandler) {
    this.handler = handler
  }

  public parseRequest(message: mainRequestMessage) {
    if (message.type === 'find-new-extensions') {
      this.handler.registerPlugins()
        .then(() => this.handler.startAll())
        .finally(() => this.sendToMain(message.channel))
      return
    }

    if (message.type === 'get-installed-extensions') {
      this.sendToMain(message.channel, this.handler.getInstalledExtensions())
      return
    }
  }

  private sendToMain(channel: string, data?: any) {
    if (process.send) {
      process.send({ channel, data } as mainReplyMessage)
    }
  }
}

new ExtensionHostIPCHandler()