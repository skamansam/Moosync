type extensionHostMessage = {
  type: 'app-path',
  data: string
} | {
  type: 'find-new-extensions',
  data: undefined
} | {
  type: 'song-change'
  data: Song
} | {
  type: 'playerState-change'
  data: PlayerState
} | {
  type: 'volume-change'
  data: number
} | {
  type: 'songQueue-change'
  data: SongQueue
} | {
  type: 'get-all-songs'
  data: Song[]
} | {
  type: 'get-installed-extensions'
  data: undefined
}

interface installedExtensionDesc {
  name: string
  desc: string
  packageName: string
  ver: string
  path: string

}
interface installMessage {
  success: boolean
  extensionDescription?: installedExtensionDesc
}

type mainHostMessage = {
  type: 'get-all-songs'
  data: undefined
} | {
  type: 'get-installed-extensions'
  data: ExtensionDetails[]
}
declare module NodeJS {
  interface Global {
    getAllSongs(): Promise<Song[]>
  }
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