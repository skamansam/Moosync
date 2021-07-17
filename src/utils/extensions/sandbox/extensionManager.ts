import { ExtensionDescriptor, ExtensionFactory, ExtensionItem } from '@moosync/moosync-types';

import { InMemoryRegistry } from './extensionRegistry';
import { v4 } from 'uuid';

export abstract class AbstractExtensionManager {
  abstract instantiateAndRegister(description: ExtensionDescriptor): Promise<void>

  abstract getAllExtensions(): Iterable<ExtensionItem>
}

export class ExtensionManager extends AbstractExtensionManager {
  private extensionRegistry = new InMemoryRegistry();

  private register(extensionItem: ExtensionItem) {
    this.extensionRegistry.register(extensionItem)
  }

  async instantiateAndRegister(description: ExtensionDescriptor) {
    const uuid = v4()

    const instance = await description.factory.create()
    this.register({
      id: uuid,
      name: description.extensionName,
      desc: description.extensionDescription,
      instance: instance
    })

    console.info(`Registered ${description.extensionName} - ${description.extensionDescription}`)
  }

  getAllExtensions(): Iterable<ExtensionItem> {
    return this.extensionRegistry.getAll()
  }

}

