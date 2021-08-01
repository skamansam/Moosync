import { ChildProcess, fork } from 'child_process';
import { app, ipcMain } from 'electron';
import { extensionRequestsKeys, extensionUIRequestsKeys, mainRequests } from '@/utils/extensions/constants';
import { loadSelectivePreference, saveSelectivePreference } from '../main/db/preferences';

import { ExtensionHostEvents } from '@/utils/main/ipc/constants';
import { SongDB } from '@/utils/main/db/index';
import { WindowHandler } from '../main/windowManager';
import { async } from 'node-stream-zip';
import { promises as fsP } from 'fs';
import { getVersion } from '@/utils/common';
import path from 'path';
import { v4 } from 'uuid';

export const defaultExtensionPath = path.join(app.getPath('appData'), app.getName(), 'extensions')
const defaultLogPath = path.join(app.getPath('logs'))


class MainHostIPCHandler {
  private sandboxProcess: ChildProcess

  private extensionRequestHandler = new ExtensionRequestHandler()
  private extensionResourceHandler = new ExtensionHandler()
  public mainRequestGenerator: MainRequestGenerator
  public extensionEventGenerator: ExtensionEventGenerator

  constructor() {
    this.sandboxProcess = this.createExtensionHost()
    this.mainRequestGenerator = new MainRequestGenerator(this.sandboxProcess)
    this.extensionEventGenerator = new ExtensionEventGenerator(this.sandboxProcess)
    this.registerListeners()
  }

  private registerListeners() {
    this.sandboxProcess.on("message", this.parseMessage.bind(this))
  }

  private createExtensionHost() {
    return fork(__dirname + '/sandbox.js', ['extensionPath', defaultExtensionPath, 'logPath', defaultLogPath])
  }

  public mainWindowCreated() {
    this.extensionRequestHandler.mainWindowCreated()
  }

  private parseMessage(message: mainHostMessage) {
    if (extensionRequestsKeys.includes(message.type as any) || extensionUIRequestsKeys.includes(message.type as any)) {
      this.extensionRequestHandler.parseRequest(message as extensionRequestMessage).then(resp => this.sendToExtensionHost(resp))
    }
  }

  public async installExtension(zipPaths: string[]): Promise<installMessage> {
    const resp = await this.extensionResourceHandler.installExtension(zipPaths)
    await this.mainRequestGenerator.findNewExtensions()
    return resp
  }

  public async uninstallExtension(packageName: string): Promise<void> {
    await this.mainRequestGenerator.removeExtension(packageName)
    await this.extensionResourceHandler.uninstallExtension(packageName)
  }

  private sendToExtensionHost(data: any) {
    this.sandboxProcess.send(data)
  }
}

class MainRequestGenerator {
  private sandboxProcess: ChildProcess

  constructor(process: ChildProcess) {
    this.sandboxProcess = process
  }

  public async findNewExtensions() {
    await this.sendAsync<void>('find-new-extensions')
  }

  public async getInstalledExtensions() {
    return this.sendAsync<ExtensionDetails[]>('get-installed-extensions')
  }

  public async toggleExtensionStatus(packageName: string, enabled: boolean) {
    return this.sendAsync<void>('toggle-extension-status', { packageName, enabled })
  }

  public async removeExtension(packageName: string) {
    return this.sendAsync<void>('remove-extension', { packageName })
  }

  private sendAsync<T>(type: mainRequests, data?: any): Promise<T> {
    const channel = v4()
    return new Promise<T>(resolve => {
      let listener: (data: mainReplyMessage) => void
      this.sandboxProcess.on('message', listener = (data: mainReplyMessage) => {
        if (data.channel === channel) {
          this.sandboxProcess.off('message', listener)
          resolve(data.data)
        }
      })
      this.sandboxProcess.send({ type, channel, data } as mainRequestMessage)
    })
  }
}

class ExtensionEventGenerator {
  private sandboxProcess: ChildProcess

  constructor(process: ChildProcess) {
    this.sandboxProcess = process
  }

  public send(data: extensionEventMessage) {
    this.sandboxProcess.send(data)
  }
}

class ExtensionRequestHandler {
  private mainWindowCallsQueue: { func: Function, args: any[] }[] = []

  public mainWindowCreated() {
    for (const f of this.mainWindowCallsQueue) {
      f.func(...f.args)
    }
  }

  private requestFromMainWindow(message: extensionRequestMessage) {
    return new Promise(resolve => {
      let listener: (event: Electron.IpcMainEvent, data: extensionReplyMessage) => void
      ipcMain.on(ExtensionHostEvents.EXTENSION_REQUESTS, listener = (event, data: extensionReplyMessage) => {
        if (data.channel === message.channel) {
          ipcMain.off(ExtensionHostEvents.EXTENSION_REQUESTS, listener)
          resolve(data.data)
        }
      })

      // Defer call till mainWindow is created
      if (WindowHandler.getWindow(true))
        this.sendToMainWindow(message)
      else {
        this.mainWindowCallsQueue.push({ func: this.sendToMainWindow, args: [message] })
      }
    })
  }

  private sendToMainWindow(message: extensionRequestMessage) {
    WindowHandler.getWindow(true)?.webContents.send(ExtensionHostEvents.EXTENSION_REQUESTS, message)
  }

  private getPreferenceKey(packageName: string, key?: string) {
    let str = packageName
    if (key) str += "." + key
    return str
  }

  public async parseRequest(message: extensionRequestMessage): Promise<extensionReplyMessage | undefined> {
    const resp: extensionReplyMessage = { ...message, data: undefined }
    if (message.type === 'get-all-songs') {
      const songs = await SongDB.getAllSongs()
      resp.data = songs
    }

    if (message.type === 'get-preferences') {
      const { packageName, key, defaultValue }: { packageName: string, key?: string, defaultValue?: any } = message.data
      resp.data = await loadSelectivePreference(this.getPreferenceKey(packageName, key), true, defaultValue)
    }

    if (message.type === 'set-preferences') {
      const { packageName, key, value }: { packageName: string, key: string, value: any } = message.data
      resp.data = await saveSelectivePreference(this.getPreferenceKey(packageName, key), value, true)
    }

    if (extensionUIRequestsKeys.includes(message.type as any)) {
      const data = await this.requestFromMainWindow(message)
      resp.data = data
    }

    return resp
  }
}

class ExtensionHandler {

  private async checkVersion(oldS: string, newS: string) {
    const oldV = getVersion(oldS)
    const newV = getVersion(newS)

    return newV > oldV
  }

  private async createDirIfNotExists(path: string) {
    await fsP.rm(path, { recursive: true, force: true })
    await fsP.mkdir(path)
  }

  private async isExistingExtension(packageName: string): Promise<string | undefined> {
    try {
      const extPath = path.join(defaultExtensionPath, packageName)
      await fsP.access(extPath)
      const manifest = JSON.parse(await fsP.readFile(path.join(extPath, 'package.json'), 'utf-8'))
      return manifest.version
    } catch (e) {
      console.info(`No existing extension found with packageName: ${packageName}`)
      undefined
    }
  }

  public async installExtension(zipPaths: string[]): Promise<installMessage> {
    for (const filePath of zipPaths) {
      const zip = new async({ file: filePath })
      const manifestRaw = await zip.entryData('package.json')
      const manifest = JSON.parse((manifestRaw.toString('utf-8')))
      if (this.validateManifest(manifest)) {
        const existingVersion = await this.isExistingExtension(manifest.name)
        if (existingVersion) {
          if (!(await this.checkVersion(existingVersion, manifest.version))) {
            return {
              success: false,
              message: `Duplicate extension ${manifest.packageName}. Can not install`
            }
          }
          this.uninstallExtension(manifest.name)
        }
        const installPath = path.join(defaultExtensionPath, manifest.name)
        await this.createDirIfNotExists(installPath)
        await zip.extract(null, installPath)
        return {
          success: true,
          message: "Extension installed successfully",
          extensionDescription: {
            name: manifest.displayName,
            desc: manifest.description,
            packageName: manifest.name,
            ver: manifest.version,
            path: installPath
          }
        }
      }
    }
    return {
      success: false
    }
  }

  public async uninstallExtension(packageName: string) {
    if (await this.isExistingExtension(packageName)) {
      await fsP.rm(path.join(defaultExtensionPath, packageName), { recursive: true, force: true })
    }
  }

  private validateManifest(manifest: any) {
    return !!(manifest.moosyncExtension && manifest.displayName && manifest.extensionEntry && manifest.name && manifest.version)
  }
}

export const extensionHost = new MainHostIPCHandler()
