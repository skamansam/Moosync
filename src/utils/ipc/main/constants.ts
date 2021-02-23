export enum IpcEvents {
  SCANNER = 'scanner',
  SONG = 'song',
  ALBUM = 'album',
  ARTIST = 'artist',
  PLAYLIST = 'playlist',
  CONTEXT_MENU = 'contextMenu',
}

export enum AlbumEvents {
  GET_ALL_ALBUMS = 'getAlbums',
  GET_ALBUM = 'getAlbum',
}

export enum ScannerEvents {
  SCAN_MUSIC = 'scanMusic',
}

export enum PlaylistEvents {
  CREATE_PLAYLIST = 'createPlaylist',
  ADD_TO_PLAYLIST = 'AddToPlaylist',
  GET_PLAYLISTS = 'getPlaylists',
  ADDED_PLAYLIST = 'addedPlaylist',
}

export enum ArtistEvents {
  GET_ALL_ARTISTS = 'getArtists',
  GET_ARTIST = 'getArtist',
}

export enum SongEvents {
  GET_ALL_SONGS = 'getAllSongs',
}

export enum EventBus {
  UPDATE_AUDIO_TIME = 'timestamp-update',
  SONG_SELECTED = 'song-select',
  COVER_SELECTED = 'cover-select',
}

export enum ContextMenuEvents {
  SONGS_MENU = 'songsMenu',
}
