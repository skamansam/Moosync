import { ExtensionFactory } from '@moosync/moosync-types';
import { promises as fsP } from 'fs';
import path from 'path';

export abstract class AbstractExtensionFinder {
  abstract findExtensions(): AsyncGenerator<UnInitializedExtensionItem>
}

export class ExtensionFinder extends AbstractExtensionFinder {

  private searchPaths: string[]

  constructor(searchPaths: string[]) {
    super()
    this.searchPaths = searchPaths
  }

  private async loadExtension(entryFilePath: string) {
    return import( /* webpackIgnore: true */ 'file://' + entryFilePath)
  }


  private async parseJson(filePath: string) {
    const raw = await fsP.readFile(filePath, 'utf-8')
    return JSON.parse(raw)
  }

  private async checkExtensionValidity(modulePath: string, packageMetadata: any): Promise<ExtensionFactory | undefined> {
    if (packageMetadata.moosyncExtension) {
      const moduleEntryPath = packageMetadata.extensionEntry
      try {
        const extension = await this.loadExtension(path.join(modulePath, moduleEntryPath))
        if (typeof extension.default !== 'function') {
          return
        }

        const instance = new extension.default()

        if (!Array.isArray(instance.extensionDescriptors)) {
          return
        }

        for (const factory of instance.extensionDescriptors) {
          if (factory.create)
            return factory as ExtensionFactory
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  public async * findExtensions() {
    for (const searchPath of this.searchPaths) {
      try {
        const dirents = await fsP.readdir(searchPath, { withFileTypes: true })
        const filtered = dirents.filter(val => val.isDirectory())
        for (const folder of filtered) {
          const extDir = await fsP.readdir(path.join(searchPath, folder.name), { withFileTypes: true })
          const possibleManifests = extDir.filter(val => val.isFile() && val.name === 'package.json')
          if (possibleManifests.length > 0) {
            const manifest = await this.parseJson(path.join(searchPath, folder.name, possibleManifests[0].name))
            const instance = await this.checkExtensionValidity(path.join(searchPath, folder.name), manifest)

            if (instance) {
              yield { name: manifest.name, packageName: manifest.packageName, desc: manifest.description, version: manifest.version, factory: instance }
            }
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
  }
}