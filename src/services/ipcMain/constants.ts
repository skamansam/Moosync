export enum IpcEvents {
  SCAN_MUSIC = 'scanMusic',
  GET_ALL_SONGS = 'getAllSongs',
  GET_COVER = 'getCover',

  GOT_COVER = 'gotCover',
  GOT_ALL_SONGS = 'gotSongs',
}

export enum EventBus {
  UPDATE_AUDIO_TIME = 'timestamp-update',
  SONG_SELECTED = 'song-select',
  COVER_SELECTED = 'cover-select',
}
