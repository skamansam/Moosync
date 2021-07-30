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
  STORE = 'store',
  SERVICE_PROVIDERS = 'serviceProviders',
  LOGGER = 'logger',
  NOTIFIER = 'notifier',
  EXTENSION_HOST = "extensionHost"
}

export enum StoreEvents {
  SET_DATA = 'setData',
  GET_DATA = 'getData',
  SET_SECURE = 'setSecure',
  GET_SECURE = 'getSecure',
  REMOVE_SECURE = 'removeSecure'
}

export enum SearchEvents {
  SEARCH_SONGS_COMPACT = 'searchCompact',
  SEARCH_ALL = 'searchAll',
  SEARCH_YT = 'searchYT'
}

export enum PreferenceEvents {
  SAVE_PREFERENCES = 'savePreferences',
  SAVE_SELECTIVE_PREFERENCES = 'saveSelectivePreferences',
  LOAD_SELECTIVE_PREFERENCES = 'loadSelectivePreferences',
  LOAD_PREFERENCES = 'loadPreferences',
  PREFERENCE_REFRESH = 'preferenceRefresh'
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
  OPEN_URL_EXTERNAL = 'openUrlExternal',
  LISTEN_OAUTH_EVENT = 'listenOauthEvent',

  MAIN_WINDOW_HAS_MOUNTED = 'mainWindowsHasMounted'
}

export enum AlbumEvents {
  GET_ALL_ALBUMS = 'getAlbums',
  GET_ALBUM = 'getAlbum'
}

export enum GenreEvents {
  GET_ALL_GENRE = 'getAllGenre',
  GET_GENRE = 'getGenre'
}

export enum ScannerEvents {
  SCAN_MUSIC = 'scanMusic'
}

export enum PlaylistEvents {
  CREATE_PLAYLIST = 'createPlaylist',
  ADD_TO_PLAYLIST = 'AddToPlaylist',
  GET_ALL_PLAYLISTS = 'getPlaylists',
  GET_PLAYLIST = 'getPlaylist',
  ADDED_PLAYLIST = 'addedPlaylist',
  REMOVE_PLAYLIST = 'removePlaylist',
  SAVE_COVER = 'saveCover'
}

export enum ArtistEvents {
  GET_ALL_ARTISTS = 'getArtists',
  GET_ARTIST = 'getArtist'
}

export enum SongEvents {
  GET_ALL_SONGS = 'getAllSongs',
  STORE_SONG = 'storeSong',
  REMOVE_SONG = 'removeSong',
  SAVE_AUDIO_TO_FILE = 'saveAudioToFile',
  SAVE_IMAGE_TO_FILE = 'saveImageToFile',
  AUDIO_EXISTS = 'fileExists',
  IMAGE_EXISTS = 'imageExists',
  GOT_FILE_PATH = 'gotSongPath'
}

export enum LoggerEvents {
  INFO = 'info',
  ERROR = 'error'
}

export enum ExtensionHostEvents {
  EVENT_TRIGGER = "eventTrigger",
  GET_ALL_EXTENSIONS = 'getAllExtensions',
  INSTALL = 'install',
  EXTENSION_REQUESTS = 'extensionRequests',
  TOGGLE_EXT_STATUS = 'toggleExtStatus',
  REMOVE_EXT = 'removeExt'
}

export enum ServiceProviderEvents {
  LOGIN = 'login'
}

export enum EventBus {
  UPDATE_AUDIO_TIME = 'timestamp-update',
  SONG_SELECTED = 'song-select',
  COVER_SELECTED = 'cover-select',
  SHOW_CONTEXT = 'show-context',
  SHOW_NEW_PLAYLIST_MODAL = 'show-new-playlist-modal',
  SHOW_ADD_PLAYLIST_MODAL = 'show-add-playlist-modal',
  SHOW_DELETE_MODAL = 'show-delete-modal',
}
