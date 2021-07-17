import { AbstractExtensionFinder, ExtensionFinder } from './extensionFinder';

import { AbstractExtensionManager } from '@/utils/extensions/sandbox/extensionManager';
import { ExtensionManager } from '@/utils/extensions/sandbox/extensionManager';

export class ExtensionHandler {

  private extensionManager: AbstractExtensionManager
  private extensionFinder: AbstractExtensionFinder
  private initialized: boolean = false
  private preInitializedCalls: { func: Function, args?: any[] }[]

  constructor(searchPaths: string[]) {
    this.preInitializedCalls = []
    this.extensionManager = new ExtensionManager()
    this.extensionFinder = new ExtensionFinder(searchPaths)

    this.registerPlugins().then(() => {
      this.initialized = true
      for (const [index, f] of this.preInitializedCalls.entries()) {
        if (f.args) {
          f.func.bind(this)(...f.args)
        } else
          f.func.bind(this)()

        this.preInitializedCalls.splice(index)
      }
    })
  }

  private async registerPlugins(): Promise<void> {
    for await (const ext of this.extensionFinder.findExtensions()) {
      this.extensionManager.instantiateAndRegister(ext)
    }
  }

  public startAll() {
    if (this.initialized) {
      for (const ext of this.extensionManager.getAllExtensions()) {
        console.log(ext.name, ext.instance.onStarted)
        if (ext.instance.onStarted)
          ext.instance.onStarted()
      }
    } else {
      this.preInitializedCalls.push({ func: this.startAll })
    }
  }

  public sendEvent(event: extensionHostMessage) {
    let method: extensionMethods | undefined = undefined
    if (this.initialized) {
      switch (event.type) {
        case 'song-change':
          method = 'onSongChanged'
          break
        case 'playerState-change':
          method = 'onPlayerStateChanged'
          break
        case 'volume-change':
          method = 'onVolumeChanged'
          break
        case 'songQueue-change':
          method = 'onSongQueueChanged'
          break
      }
      method && this.sendToAllExtensions(method, event.data)
    } else {
      this.preInitializedCalls.push({ func: this.sendEvent, args: [event] })
    }
  }

  public sendToAllExtensions(method: extensionMethods, args: any) {
    for (const ext of this.extensionManager.getAllExtensions()) {
      if (ext.instance[method])
        (ext.instance[method] as Function)(args)
    }
  }
}