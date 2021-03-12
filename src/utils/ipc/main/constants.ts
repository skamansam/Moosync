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
  SEARCH = 'search',
}

export enum SearchEvents {
  SEARCH_SONGS_COMPACT = 'searchCompact',
  SEARCH_ALL = 'searchAll',
  SEARCH_YT = 'searchYT',
}

export enum PreferenceEvents {
  SAVE_PREFERENCES = 'savePreferences',
  LOAD_PREFERENCES = 'loadPreferences',
  PREFERENCE_REFRESH = 'preferenceRefresh',
}

export enum WindowEvents {
  TOGGLE_DEV_TOOLS = 'toggleDevTools',
  OPEN_FILE_BROWSER = 'openFileBrowser',

  CLOSE_MAIN = 'closeMain',
  MAX_MAIN = 'maxMain',
  MIN_MAIN = 'minMain',

  OPEN_PREF = 'openPref',
  CLOSE_PREF = 'closePref',
  MAX_PREF = 'maxPref',
  MIN_PREF = 'minPref',
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
  STORE_SONG = 'storeSong',
  REMOVE_SONG = 'removeSong',
}

export enum EventBus {
  UPDATE_AUDIO_TIME = 'timestamp-update',
  SONG_SELECTED = 'song-select',
  COVER_SELECTED = 'cover-select',
  SHOW_CONTEXT = 'show-context',
  SHOW_NEW_PLAYLIST_MODAL = 'show-new-playlist-modal',
}
