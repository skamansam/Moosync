import { extensionEventsKeys, extensionRequests, mainRequestsKeys } from '@/utils/extensions/constants';

import { ExtensionHandler } from '@/utils/extensions/sandbox/extensionHandler';
import { Logger } from 'winston';
import { createLogger } from './logger';
import { v4 } from 'uuid';

class ExtensionHostIPCHandler {
  private extensionHandler: ExtensionHandler
  private mainRequestHandler: MainRequestHandler
  private logger: Logger

  constructor() {
    let extensionPath = ""
    let logsPath = ""
    for (const [index, arg] of process.argv.entries()) {
      if (process.argv[index + 1]) {
        if (arg === 'extensionPath') {
          extensionPath = process.argv[index + 1]
        }

        if (arg === 'logPath') {
          logsPath = process.argv[index + 1]
        }
      }
    }
    this.logger = createLogger(logsPath)
    this.overrideConsole()

    this.extensionHandler = new ExtensionHandler([extensionPath], this.logger)
    this.mainRequestHandler = new MainRequestHandler(this.extensionHandler)

    this.registerListeners()
    this.setGlobalMethods()
    this.extensionHandler.startAll()
  }

  private overrideConsole() {
    const preservedConsoleInfo = console.info;
    const preservedConsoleError = console.error;

    console.info = (...args: any[]) => {
      if (process.env.NODE_ENV !== 'production')
        preservedConsoleInfo.apply(console, args);
      this.logger.info(args.toString(), { label: 'Main' })
    }

    console.error = (...args: any[]) => {
      if (process.env.NODE_ENV !== 'production')
        preservedConsoleError.apply(console, args);
      this.logger.error(args.toString(), { label: 'Main' })
    }
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
    global.api = new ExtensionRequestGenerator()
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

  public async getCurrentSong() {
    return this.sendAsync<Song>('get-current-song')
  }

  public async getVolume() {
    return this.sendAsync<number>('get-volume')
  }

  public async getTime() {
    return this.sendAsync<number>('get-time')
  }

  public async getQueue() {
    return this.sendAsync<SongQueue>('get-queue')
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
        process.send({ type, channel } as mainHostMessage)
        return
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

const handler = new ExtensionHostIPCHandler()