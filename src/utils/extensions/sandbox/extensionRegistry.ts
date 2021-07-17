import { ExtensionItem } from "@moosync/moosync-types"

export abstract class AbstractExtensionRegistry {
  abstract register(extension: ExtensionItem): void;
  abstract getAll(): Iterable<ExtensionItem>
}

export class InMemoryRegistry extends AbstractExtensionRegistry {

  private extensionStore: ExtensionItem[] = []

  register(extension: ExtensionItem) {
    this.extensionStore.push(extension)
  }

  getAll(): Iterable<ExtensionItem> {
    return this.extensionStore
  }
}