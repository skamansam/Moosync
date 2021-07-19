import { ChildProcess, fork } from 'child_process'

import { SongDB } from '@/utils/main/db/index';
import { app } from 'electron'
import { async } from 'node-stream-zip'
import { promises as fsP } from 'fs'
import { getVersion } from '@/utils/common';
import path from 'path'

export const defaultExtensionPath = path.join(app.getPath('appData'), app.getName(), 'extensions')

class ExtensionHost {
  private sandboxProcess: ChildProcess

  constructor() {
    this.sandboxProcess = this.createExtensionHost()
    this.registerListeners()
  }

  private createExtensionHost() {
    return fork(__dirname + '/sandbox.js')
  }

  private registerListeners() {
    this.sandboxProcess.on("message", this.parseMessage)
    this.send({
      type: 'app-path',
      data: defaultExtensionPath
    })
  }

  private parseMessage(data: mainHostMessage) {
    if (data.type === 'get-all-songs') {
      SongDB.getAllSongs().then((songs) => this.send({ type: data.type, data: songs }))
    }
  }

  public send(message: extensionHostMessage) {
    this.sandboxProcess.send(message)
  }

  // TODO: setup better method for communications
  public sendAsync(message: extensionHostMessage) {
    return new Promise(resolve => {
      let listener: (data: mainHostMessage) => void
      this.sandboxProcess.on('message', listener = (data: mainHostMessage) => {
        if (data.type === message.type) {
          this.sandboxProcess.off('message', listener)
          resolve(data.data)
        }
      })
      this.sandboxProcess.send(message)
    })
  }

  public async checkVersion(oldS: string, newS: string) {
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

  public async isExistingExtension(packageName: string): Promise<string | undefined> {
    try {
      const extPath = path.join(defaultExtensionPath, packageName)
      await fsP.access(extPath)
      const manifest = JSON.parse(await fsP.readFile(path.join(extPath, 'package.json'), 'utf-8'))
      return manifest.version
    } catch (e) {
      console.log('Seems like new extensions')
    }
  }

  private findNewPlugins() {
    this.send({ type: 'find-new-extensions', data: undefined })
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
              success: false
            }
          }
        }
        const installPath = path.join(defaultExtensionPath, manifest.packageName)
        await this.createDirIfNotExists(installPath)
        await zip.extract(null, installPath)
        this.findNewPlugins()
        return {
          success: true,
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

export const extensionHost = new ExtensionHost()

