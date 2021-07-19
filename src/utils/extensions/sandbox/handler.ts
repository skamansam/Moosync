import { AbstractExtensionFinder, ExtensionFinder } from './extensionFinder';

import { AbstractExtensionManager } from '@/utils/extensions/sandbox/extensionManager';
import { ExtensionManager } from '@/utils/extensions/sandbox/extensionManager';
import { MoosyncExtensionTemplate } from '@moosync/moosync-types';
import { getVersion } from '@/utils/common';

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

  private isDuplicateExtension(ext: UnInitializedExtensionItem) {
    const matches = this.extensionManager.getExtensions({ packageName: ext.packageName })
    for (const oldExt of matches) {
      const oldVer = getVersion(oldExt.version)
      const newVer = getVersion(ext.version)
      if (newVer > oldVer) {
        this.extensionManager.deregister(oldExt.packageName)
        return false
      }
      return true
    }
    return false
  }

  public async registerPlugins(): Promise<void> {
    for await (const ext of this.extensionFinder.findExtensions()) {
      if (!this.isDuplicateExtension(ext)) {
        this.extensionManager.instantiateAndRegister(ext)
      }
    }
  }

  public startAll() {
    if (this.initialized) {
      for (const ext of this.extensionManager.getExtensions({ started: false })) {
        if (ext.instance.onStarted)
          ext.instance.onStarted()
        this.extensionManager.setStarted(ext.packageName, true)
      }
    } else {
      this.preInitializedCalls.push({ func: this.startAll })
    }
  }

  public sendEvent(event: extensionHostMessage) {
    let method: keyof MoosyncExtensionTemplate | undefined = undefined
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

  private toExtensionDetails(item: ExtensionItem): ExtensionDetails {
    return {
      name: item.name,
      desc: item.desc,
      packageName: item.packageName,
      version: item.version,
      hasStarted: item.hasStarted
    }
  }

  public getInstalledExtensions() {
    const extensions = this.extensionManager.getExtensions()
    const parsed: ExtensionDetails[] = []
    for (const e of extensions) {
      parsed.push(this.toExtensionDetails(e))
    }

    return parsed
  }

  public sendToAllExtensions(method: keyof MoosyncExtensionTemplate, args: any) {
    for (const ext of this.extensionManager.getExtensions()) {
      if (ext.instance[method])
        (ext.instance[method] as Function)(args)
    }
  }
}