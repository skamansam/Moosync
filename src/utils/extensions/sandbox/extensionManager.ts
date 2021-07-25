import { InMemoryRegistry } from './extensionRegistry';
import { Logger } from 'winston';

export abstract class AbstractExtensionManager {
  abstract instantiateAndRegister(extension: UnInitializedExtensionItem): Promise<void>
  abstract deregister(packageName: string): void
  abstract getExtensions(options?: getExtensionOptions): Iterable<ExtensionItem>
  abstract setStarted(packageName: string, status: boolean): void
}

export class ExtensionManager extends AbstractExtensionManager {
  private extensionRegistry = new InMemoryRegistry();
  private logger: Logger

  constructor(logger: Logger) {
    super()
    this.logger = logger
  }

  private register(extensionItem: ExtensionItem) {
    this.extensionRegistry.register(extensionItem)
  }

  deregister(packageName: string) {
    this.extensionRegistry.deregister(packageName)
  }

  async instantiateAndRegister(extension: UnInitializedExtensionItem) {
    const instance = await extension.factory.create(this.logger.child({ label: extension.packageName }))
    const preferences = extension.factory.registerPreferences ? await extension.factory.registerPreferences() : []
    console.log(preferences)
    this.register({
      name: extension.name,
      desc: extension.desc,
      packageName: extension.packageName,
      version: extension.version,
      hasStarted: false,
      entry: extension.entry,
      preferences,
      instance
    })

    console.info(`Registered ${extension.name} - ${extension.desc}`)
  }

  getExtensions(options?: getExtensionOptions): Iterable<ExtensionItem> {
    return this.extensionRegistry.get(options)
  }

  setStarted(packageName: string, status: boolean) {
    this.extensionRegistry.setStarted(packageName, status)
  }
}

