/*
 *  constants.ts is a part of Moosync.
 *
 *  Copyright 2021-2022 by Sahil Gupte <sahilsachingupte@gmail.com>. All rights reserved.
 *  Licensed under the GNU General Public License.
 *
 *  See LICENSE in the project root for license information.
 */

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
  EXTENSION_HOST = 'extensionHost',
  UPDATE = 'update'
}

export enum StoreEvents {
  SET_DATA = 'setData',
  GET_DATA = 'getData',
  SET_SECURE = 'setSecure',
  GET_SECURE = 'getSecure',
  REMOVE_SECURE = 'removeSecure'
}

export enum SearchEvents {
  SEARCH_SONGS_BY_OPTIONS = 'searchSongsByOptions',
  SEARCH_ENTITY_BY_OPTIONS = 'searchEntityByOptions',
  SEARCH_ALL = 'searchAll',
  SEARCH_YT = 'searchYT',
  YT_SUGGESTIONS = 'YTSuggestions',
  SCRAPE_LASTFM = 'scrapeLastFM',
  SCRAPE_LYRICS = 'scrapeLyrics',
  REQUEST_INVIDIOUS = 'requestInvidious'
}

export enum PreferenceEvents {
  SAVE_SELECTIVE_PREFERENCES = 'saveSelectivePreferences',
  LOAD_SELECTIVE_PREFERENCES = 'loadSelectivePreferences',
  PREFERENCE_REFRESH = 'preferenceRefresh',
  SET_THEME = 'setTheme',
  GET_THEME = 'getTheme',
  REMOVE_THEME = 'removeTheme',
  SET_ACTIVE_THEME = 'setActiveTheme',
  GET_ACTIVE_THEME = 'getActiveTheme',
  GET_ALL_THEMES = 'getAllThemes',
  SET_SONG_VIEW = 'setSongView',
  GET_SONG_VIEW = 'getSongView',
  THEME_REFRESH = 'themeRefresh',
  SONG_VIEW_REFRESH = 'songViewRefresh'
}

export enum WindowEvents {
  TOGGLE_DEV_TOOLS = 'toggleDevTools',
  OPEN_FILE_BROWSER = 'openFileBrowser',

  CLOSE_MAIN = 'closeMain',
  MAX_MAIN = 'maxMain',
  MIN_MAIN = 'minMain',

  OPEN_WIN = 'openPref',
  CLOSE_WIN = 'closePref',
  MAX_WIN = 'maxPref',
  MIN_WIN = 'minPref',
  OPEN_URL_EXTERNAL = 'openUrlExternal',
  REGISTER_OAUTH_CALLBACK = 'registerOAuthCallback',
  DEREGISTER_OAUTH_CALLBACK = 'deregisterOAuthCallback',
  MAIN_WINDOW_HAS_MOUNTED = 'mainWindowsHasMounted',

  DRAG_FILE = 'dragFile',

  IS_MAXIMIZED = 'isMaximized',
  HAS_FRAME = 'hasFrame',
  SHOW_TITLEBAR_ICONS = 'showTitlebarIcons',

  GOT_EXTRA_ARGS = 'gotExtraArgs',

  AUTOMATE_SPOTIFY = 'automateSpotify',

  RESTART_APP = 'restartApp',

  UPDATE_ZOOM = 'updateZoom'
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
  SCAN_MUSIC = 'scanMusic',
  GET_PROGRESS = 'getProgress',

  PROGRESS_CHANNEL = 'progressChannel'
}

export enum PlaylistEvents {
  CREATE_PLAYLIST = 'createPlaylist',
  ADD_TO_PLAYLIST = 'AddToPlaylist',
  GET_ALL_PLAYLISTS = 'getPlaylists',
  GET_PLAYLIST = 'getPlaylist',
  ADDED_PLAYLIST = 'addedPlaylist',
  REMOVE_PLAYLIST = 'removePlaylist',
  SAVE_COVER = 'saveCover',
  EXPORT = 'export'
}

export enum ArtistEvents {
  GET_ALL_ARTISTS = 'getArtists',
  GET_ARTIST = 'getArtist'
}

export enum SongEvents {
  GET_ALL_SONGS = 'getAllSongs',
  STORE_SONG = 'storeSong',
  REMOVE_SONG = 'removeSong',
  UPDATE_LYRICS = 'updateLyrics',
  SAVE_AUDIO_TO_FILE = 'saveAudioToFile',
  SAVE_IMAGE_TO_FILE = 'saveImageToFile',
  AUDIO_EXISTS = 'fileExists',
  IMAGE_EXISTS = 'imageExists',
  GOT_FILE_PATH = 'gotSongPath'
}

export enum LoggerEvents {
  INFO = 'info',
  ERROR = 'error',
  DEBUG = 'debug',
  WARN = 'warn',
  TRACE = 'trace'
}

export enum ExtensionHostEvents {
  EVENT_TRIGGER = 'eventTrigger',
  GET_ALL_EXTENSIONS = 'getAllExtensions',
  INSTALL = 'install',
  EXTENSION_REQUESTS = 'extensionRequests',
  TOGGLE_EXT_STATUS = 'toggleExtStatus',
  REMOVE_EXT = 'removeExt',
  GET_EXTENSION_ICON = 'getExtensionIcon',
  SEND_EXTRA_EVENT = 'sendExtraEvent'
}

export enum ServiceProviderEvents {
  LOGIN = 'login'
}

export enum UpdateEvents {
  CHECK_UPDATES = 'checkUpdates',
  GOT_UPDATE = 'gotUpdate',
  UPDATE_NOW = 'updateNow'
}

export enum EventBus {
  UPDATE_AUDIO_TIME = 'timestamp-update',
  SONG_SELECTED = 'song-select',
  COVER_SELECTED = 'cover-select',
  SHOW_CONTEXT = 'show-context',
  SHOW_NEW_PLAYLIST_MODAL = 'show-new-playlist-modal',
  SHOW_DELETE_MODAL = 'show-delete-modal',
  SHOW_SONG_FROM_URL_MODAL = 'show-song-from-url',
  SHOW_PLAYLIST_FROM_URL_MODAL = 'show-playlist-from-url',
  SHOW_SETUP_MODAL = 'show-setup-modal',
  SHOW_SONG_INFO_MODAL = 'show-song-info-modal',
  SHOW_OAUTH_MODAL = 'show-oauth-modal',
  HIDE_OAUTH_MODAL = 'hide-oauth-modal',
  SHOW_FORM_MODAL = 'show-form-modal',
  REFRESH_USERNAMES = 'refresh-usernames',
  REFRESH_PAGE = 'refresh-page'
}
