import { ExtensionFactory } from '@moosync/moosync-types';
import { ExtensionRequestGenerator } from './api';
import { InMemoryRegistry } from './extensionRegistry';
import { NodeVM } from 'vm2';
import path from 'path';

export abstract class AbstractExtensionManager {
  abstract instantiateAndRegister(extension: UnInitializedExtensionItem): Promise<void>
  abstract deregister(packageName: string): void
  abstract getExtensions(options?: getExtensionOptions): Iterable<ExtensionItem>
  abstract setStarted(packageName: string, status: boolean): void
}

export class ExtensionManager extends AbstractExtensionManager {
  private extensionRegistry = new InMemoryRegistry();

  private register(extensionItem: ExtensionItem) {
    this.extensionRegistry.register(extensionItem)
  }

  deregister(packageName: string) {
    this.extensionRegistry.deregister(packageName)
  }

  private getVM(entryFilePath: string) {
    const vm = new NodeVM({
      console: 'inherit',
      sandbox: {},
      require: {
        external: {
          modules: ['*'],
          transitive: true
        },
        builtin: ['fs', 'path'],
        root: path.dirname(entryFilePath)
      }
    })

    return vm
  }

  private getGlobalObject(packageName: string) {
    const child = global.logger.child({ label: packageName })
    return {
      api: new ExtensionRequestGenerator(packageName),
      logger: child
    }
  }

  private checkExtValidityAndGetInstance(modulePath: string): { vm: NodeVM, factory: ExtensionFactory } | undefined {
    try {
      const vm = this.getVM(modulePath)
      const extension = vm.runFile(modulePath)

      if (typeof extension !== 'function') {
        return
      }

      const instance = new extension()

      if (!Array.isArray(instance.extensionDescriptors)) {
        return
      }

      for (const factory of instance.extensionDescriptors) {
        if (factory.create) {
          return { factory: factory, vm }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  private setGlobalObjectToVM(vm: NodeVM, packageName: string) {
    const globalObj = this.getGlobalObject(packageName)
    vm.freeze(globalObj.api, 'api')
    vm.freeze(globalObj.logger, 'logger')
  }

  async instantiateAndRegister(extension: UnInitializedExtensionItem) {
    const vmObj = this.checkExtValidityAndGetInstance(extension.entry)
    if (vmObj) {
      this.setGlobalObjectToVM(vmObj.vm, extension.packageName)

      const preferences = vmObj.factory.registerPreferences ? await vmObj.factory.registerPreferences() : []
      const instance = await vmObj.factory.create()
      this.register({
        name: extension.name,
        desc: extension.desc,
        packageName: extension.packageName,
        version: extension.version,
        hasStarted: false,
        entry: extension.entry,
        vm: vmObj.vm,
        preferences,
        instance
      })
    }

    console.info(`Registered ${extension.name} - ${extension.desc}`)
  }

  getExtensions(options?: getExtensionOptions): Iterable<ExtensionItem> {
    return this.extensionRegistry.get(options)
  }

  setStarted(packageName: string, status: boolean) {
    this.extensionRegistry.setStarted(packageName, status)
  }
}

