import { ChildProcess, fork } from 'child_process'

import { SongDB } from '@/utils/main/db/index';
import { app } from 'electron'
import { async } from 'node-stream-zip'
import { extensionRequests } from '@/utils/extensions/constants';
import { extensionRequestsKeys } from '@/utils/extensions/constants';
import { promises as fsP } from 'fs'
import { getVersion } from '@/utils/common';
import { mainRequests } from '@/utils/extensions/constants';
import path from 'path'
import { v4 } from 'uuid';

export const defaultExtensionPath = path.join(app.getPath('appData'), app.getName(), 'extensions')

class MainHostIPCHandler {
  private sandboxProcess: ChildProcess
  private extensionRequestHandler: ExtensionRequestHandler
  private extensionResourceHandler = new ExtensionHandler()
  public mainRequestGenerator: MainRequestGenerator
  public extensionEventGenerator: ExtensionEventGenerator

  constructor() {
    this.sandboxProcess = this.createExtensionHost()
    this.extensionRequestHandler = new ExtensionRequestHandler(this.sandboxProcess)
    this.mainRequestGenerator = new MainRequestGenerator(this.sandboxProcess)
    this.extensionEventGenerator = new ExtensionEventGenerator(this.sandboxProcess)
    this.registerListeners()
  }

  private registerListeners() {
    this.sandboxProcess.on("message", this.parseMessage)
  }

  private createExtensionHost() {
    return fork(__dirname + '/sandbox.js', [defaultExtensionPath])
  }

  private isExtensionRequest(key: string) {
    return extensionRequestsKeys.includes(key as any)
  }

  private parseMessage(message: mainHostMessage) {
    if (this.isExtensionRequest(message.type)) {
      this.extensionRequestHandler.parseRequest(message as extensionRequestMessage)
    }
  }

  public async installExtension(zipPaths: string[]): Promise<installMessage> {
    const resp = await this.extensionResourceHandler.installExtension(zipPaths)
    await this.mainRequestGenerator.findNewExtensions()
    return resp
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

  private sendAsync<T>(type: mainRequests): Promise<T> {
    const channel = v4()
    return new Promise<T>(resolve => {
      let listener: (data: mainReplyMessage) => void
      this.sandboxProcess.on('message', listener = (data: mainReplyMessage) => {
        if (data.channel === channel) {
          this.sandboxProcess.off('message', listener)
          resolve(data.data)
        }
      })
      this.sandboxProcess.send({ type, channel } as mainRequestMessage)
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
  private sandboxProcess: ChildProcess

  constructor(process: ChildProcess) {
    this.sandboxProcess = process
  }

  public parseRequest(message: extensionRequestMessage) {
    if (message.type === 'get-all-songs') {
      SongDB.getAllSongs().then((songs) => this.send(message.type, message.channel, songs))
    }
  }

  private send(type: extensionRequests, channel: string, data: any) {
    this.sandboxProcess.send({ type, channel, data } as extensionReplyMessage)
  }
}

class ExtensionHandler {

  private async checkVersion(oldS: string, newS: string) {
    const oldV = getVersion(oldS)
    const newV = getVersion(newS)

    return newV > oldV
  }

  private async createDirIfNotExists(path: string) {
    try {
      await fsP.access(path)
    } catch (e) {
      await fsP.mkdir(path)
    }
  }

  private async isExistingExtension(packageName: string): Promise<string | undefined> {
    try {
      const extPath = path.join(defaultExtensionPath, packageName)
      await fsP.access(extPath)
      const manifest = JSON.parse(await fsP.readFile(path.join(extPath, 'package.json'), 'utf-8'))
      return manifest.version
    } catch (e) {
      undefined
    }
  }

  public async installExtension(zipPaths: string[]): Promise<installMessage> {
    for (const filePath of zipPaths) {
      const zip = new async({ file: filePath })
      const manifestRaw = await zip.entryData('package.json')
      const manifest = JSON.parse((manifestRaw.toString('utf-8')))
      if (this.validateManifest(manifest)) {
        const existingVersion = await this.isExistingExtension(manifest.packageName)
        if (existingVersion) {
          if (!(await this.checkVersion(existingVersion, manifest.version))) {
            return {
              success: false,
              message: `Duplicate extension ${manifest.packageName}. Can not install`
            }
          }
        }
        const installPath = path.join(defaultExtensionPath, manifest.packageName)
        await this.createDirIfNotExists(installPath)
        await zip.extract(null, installPath)
        return {
          success: true,
          message: "Extension installed successfully",
          extensionDescription: {
            name: manifest.name,
            desc: manifest.description,
            packageName: manifest.packageName,
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

  private validateManifest(manifest: any) {
    return !!(manifest.moosyncExtension && manifest.packageName && manifest.extensionEntry && manifest.name && manifest.version)
  }
}

export const extensionHost = new MainHostIPCHandler()
