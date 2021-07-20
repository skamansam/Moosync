type extensionEventMessage = {
  type: import('@/utils/extensions/constants').extensionEvents
  data: any
}

type extensionRequestMessage = {
  type: import('@/utils/extensions/constants').extensionRequests
  channel: string
}

type extensionReplyMessage = {
  type: import('@/utils/extensions/constants').extensionRequests
  channel: string
  data: any
}

type extensionHostMessage = extensionEventMessage | mainRequestMessage


type mainRequestMessage = {
  type: import('@/utils/extensions/constants').mainRequests
  channel: string
}

type mainReplyMessage = {
  type: import('@/utils/extensions/constants').mainRequests
  channel: string
  data: any
}

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
}

interface ExtensionItem extends ExtensionDetails {
  instance: MoosyncExtensionTemplate
}

interface UnInitializedExtensionItem {
  name: string,
  packageName: string,
  desc: string,
  version: string
  factory: import('@moosync/moosync-types/index').ExtensionFactory
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
    api: extensionAPI
  }
}