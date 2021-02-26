export enum IpcEvents {
  SCANNER = 'scanner',
  SONG = 'song',
  ALBUM = 'album',
  ARTIST = 'artist',
  PLAYLIST = 'playlist',
  GENRE = 'genre',
  CONTEXT_MENU = 'contextMenu',
  BROWSER_WINDOWS = 'browserWindows',
  PREFERENCES = 'preferences',
}

export enum PreferenceEvents {
  SAVE_PREFERENCES = 'savePreferences',
  LOAD_PREFERENCES = 'loadPreferences',
}

export enum WindowEvents {
  OPEN_PREFERENCE_WINDOW = 'openPreferencesWindow',
  CLOSE_PREFERENCE_WINDOW = 'closePreferencesWindow',
  TOGGLE_DEV_TOOLS = 'toggleDevTools',
  OPEN_FILE_BROWSER = 'openFileBrowser',
}

export enum AlbumEvents {
  GET_ALL_ALBUMS = 'getAlbums',
  GET_ALBUM = 'getAlbum',
}

export enum GenreEvents {
  GET_ALL_GENRE = 'getAllGenre',
  GET_GENRE = 'getGenre',
}

export enum ScannerEvents {
  SCAN_MUSIC = 'scanMusic',
}

export enum PlaylistEvents {
  CREATE_PLAYLIST = 'createPlaylist',
  ADD_TO_PLAYLIST = 'AddToPlaylist',
  GET_ALL_PLAYLISTS = 'getPlaylists',
  GET_PLAYLIST = 'getPlaylist',
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
