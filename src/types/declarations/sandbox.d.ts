type extensionHostMessage = {
  type: 'app-path',
  data: string
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
}

type mainHostMessage = {
  type: 'get-all-songs'
}

type extensionMethods = 'onSongChanged' | 'onPlayerStateChanged' | 'onVolumeChanged' | 'onSongQueueChanged'

declare module NodeJS {
  interface Global {
    getAllSongs(): Promise<Song[]>
  }
}