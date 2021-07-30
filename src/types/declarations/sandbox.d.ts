type extensionEventMessage = {
  type: keyof import('@moosync/moosync-types').MoosyncExtensionTemplate
  data: any
  packageName?: string
}

type extensionRequestMessage = {
  type: import('@/utils/extensions/constants').extensionRequests
  channel: string,
  data: any
}

type extensionReplyMessage = extensionRequestMessage

type extensionHostMessage = extensionEventMessage | mainRequestMessage


type mainRequestMessage = {
  type: import('@/utils/extensions/constants').mainRequests
  channel: string
  data: any
}

type mainReplyMessage = mainRequestMessage

type mainHostMessage = mainReplyMessage | extensionRequestMessage

interface installedExtensionDesc {
  name: string
  desc: string
  packageName: string
  ver: string
  path: string

}
interface installMessage {
  success: boolean
  message?: string
  extensionDescription?: installedExtensionDesc
}

type mainHostMessage = {
  type: 'get-all-songs'
  data: undefined
} | {
  type: 'get-installed-extensions'
  data: ExtensionDetails[]
}

interface ExtensionDetails {
  name: string
  packageName: string
  desc: string
  version: string
  hasStarted: boolean
  entry: string
  preferences: import('@moosync/moosync-types/index').ExtensionPreferenceGroup[]
}

interface ExtensionItem extends ExtensionDetails {
  instance: import('@moosync/moosync-types/index').MoosyncExtensionTemplate
  preferences: import('@moosync/moosync-types/index').ExtensionPreferenceGroup[]
  vm: import('vm')
}

interface UnInitializedExtensionItem {
  name: string,
  packageName: string,
  desc: string,
  version: string
  entry: string
}

interface getExtensionOptions {
  started?: boolean
  packageName?: string
}

interface extensionAPI {
  getAllSongs(): Promise<Song[] | undefined>
  getCurrentSong(): Promise<Song | undefined>
  getVolume(): Promise<number | undefined>
  getTime(): Promise<number | undefined>
  getQueue(): Promise<SongQueue | undefined>
}

declare module NodeJS {
  interface Global {
    logger: import('winston').Logger
  }
}

interface NodeRequire {
  (dependencies: string[], callback: (...args: any[]) => any, errorback?: (err: any) => void): any;
  config(data: any): any;
  onError: Function;
  __$__nodeRequire<T>(moduleName: string): T;
  getStats(): ReadonlyArray<LoaderEvent>;
  hasDependencyCycle(): boolean;
  define(amdModuleId: string, dependencies: string[], callback: (...args: any[]) => any): any;
}