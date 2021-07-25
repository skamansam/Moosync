export abstract class AbstractExtensionRegistry {
  abstract register(extension: ExtensionItem): void;
  abstract get(options?: getExtensionOptions): Iterable<ExtensionItem>
  abstract setStarted(packageName: string, status: boolean): void
}

export class InMemoryRegistry extends AbstractExtensionRegistry {

  private extensionStore: ExtensionItem[] = []

  register(extension: ExtensionItem) {
    this.extensionStore.push(extension)
  }

  deregister(packageName: string) {
    const ext = this.extensionStore.find(val => val.packageName === packageName)
    if (ext) {
      this.removeExtension(ext.entry)
      delete this.extensionStore[this.extensionStore.indexOf(ext)]
      this.extensionStore.splice(this.extensionStore.indexOf(ext), 1)
    }
  }

  private removeExtension(filePath: string) {
    const self = (__non_webpack_require__ as NodeRequire).cache[__non_webpack_require__.resolve(filePath)]
    if (self) {

      // https://github.com/sindresorhus/clear-module/blob/b4412fe5159e984aa864ef0fa01476483ca7c4fa/index.js

      // Delete itself from module parent

      let i = (__non_webpack_require__ as NodeRequire).main?.children.length
      if (i) {
        while (i--) {
          if ((__non_webpack_require__ as NodeRequire).main?.children[i].id === filePath) {
            delete (__non_webpack_require__ as NodeRequire).main?.children.splice(i, 1)[0];
          }
        }
      }

      // Remove all descendants from cache as well
      const { children } = self;

      // id is the filePath of module
      for (const { id } of children) {
        this.removeExtension(id);
      }

      // Delete module from caches
      delete __non_webpack_require__.cache[__non_webpack_require__.resolve(filePath)];
    }
  }

  private checkPackageName(packageName: string | undefined, item: ExtensionItem) {
    if (packageName) {
      return item.packageName === packageName
    }
    return true
  }

  private checkStarted(started: boolean | undefined, item: ExtensionItem) {
    if (started !== undefined) {
      return item.hasStarted === started
    }
    return true
  }

  get(options?: getExtensionOptions): Iterable<ExtensionItem> {
    return this.extensionStore.filter(val => options ? !!(this.checkPackageName(options.packageName, val) && this.checkStarted(options.started, val)) : true)
  }

  setStarted(packageName: string, status: boolean) {
    const extension = this.extensionStore.find(val => val.packageName === packageName)
    if (extension)
      extension.hasStarted = status
  }
}