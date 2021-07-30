import {
  AlbumEvents,
  ArtistEvents,
  ExtensionHostEvents,
  GenreEvents,
  IpcEvents,
  LoggerEvents,
  PlaylistEvents,
  PreferenceEvents,
  ScannerEvents,
  SearchEvents,
  ServiceProviderEvents,
  SongEvents,
  StoreEvents,
  WindowEvents
} from '@/utils/main/ipc/constants';
import { contextBridge, ipcRenderer } from 'electron';

import { IpcRendererHolder } from '@/utils/preload/ipc/index';

const ipcRendererHolder = new IpcRendererHolder(ipcRenderer)

contextBridge.exposeInMainWorld('DBUtils', {
  getAllAlbums: () => ipcRendererHolder.send(IpcEvents.ALBUM, { type: AlbumEvents.GET_ALL_ALBUMS }),
  getSingleAlbum: (albumID: string) =>
    ipcRendererHolder.send(IpcEvents.ALBUM, { type: AlbumEvents.GET_ALBUM, params: { id: albumID } }),

  getAllArtists: () => ipcRendererHolder.send(IpcEvents.ARTIST, { type: ArtistEvents.GET_ALL_ARTISTS }),
  getSingleArtist: (artistID: string) =>
    ipcRendererHolder.send(IpcEvents.ARTIST, { type: ArtistEvents.GET_ARTIST, params: { id: artistID } }),

  getAllGenres: () => ipcRendererHolder.send(IpcEvents.GENRE, { type: GenreEvents.GET_ALL_GENRE }),
  getSingleGenre: (genreID: string) =>
    ipcRendererHolder.send(IpcEvents.GENRE, { type: GenreEvents.GET_GENRE, params: { id: genreID } }),

  getAllPlaylists: () => ipcRendererHolder.send(IpcEvents.PLAYLIST, { type: PlaylistEvents.GET_ALL_PLAYLISTS }),
  getSinglePlaylist: (playlistID: string) =>
    ipcRendererHolder.send(IpcEvents.PLAYLIST, { type: PlaylistEvents.GET_PLAYLIST, params: { id: playlistID } }),
  createPlaylist: (name: string, desc: string, imgSrc: string) =>
    ipcRendererHolder.send(IpcEvents.PLAYLIST, { type: PlaylistEvents.CREATE_PLAYLIST, params: { name: name, desc: desc, imgSrc: imgSrc } }),
  addToPlaylist: (playlistID: string, ...songIDs: Song[]) =>
    ipcRendererHolder.send(IpcEvents.PLAYLIST, {
      type: PlaylistEvents.ADD_TO_PLAYLIST,
      params: { playlist_id: playlistID, song_ids: songIDs },
    }),
  removePlaylist: (playlistID: string) => ipcRendererHolder.send(IpcEvents.PLAYLIST, { type: PlaylistEvents.REMOVE_PLAYLIST, params: { playlist_id: playlistID } }),
  getAllSongs: () => ipcRendererHolder.send(IpcEvents.SONG, { type: SongEvents.GET_ALL_SONGS }),
  storeSongs: (songs: Song[]) =>
    ipcRendererHolder.send(IpcEvents.SONG, { type: SongEvents.STORE_SONG, params: { songs: songs } }),
  removeSongs: (songs: Song[]) =>
    ipcRendererHolder.send(IpcEvents.SONG, { type: SongEvents.REMOVE_SONG, params: { songs: songs } }),
})

contextBridge.exposeInMainWorld('PreferenceUtils', {
  load: () => ipcRendererHolder.send(IpcEvents.PREFERENCES, { type: PreferenceEvents.LOAD_PREFERENCES }),
  save: (preferences: Preferences) =>
    ipcRendererHolder.send(IpcEvents.PREFERENCES, {
      type: PreferenceEvents.SAVE_PREFERENCES,
      params: { preferences: preferences },
    }),
  saveSelective: (key: string, value: any, isExtension?: boolean) => ipcRendererHolder.send(IpcEvents.PREFERENCES, { type: PreferenceEvents.SAVE_SELECTIVE_PREFERENCES, params: { key, value, isExtension } }),
  loadSelective: (key: string, isExtension?: boolean) => ipcRendererHolder.send(IpcEvents.PREFERENCES, { type: PreferenceEvents.LOAD_SELECTIVE_PREFERENCES, params: { key, isExtension } }),
})

contextBridge.exposeInMainWorld('ProviderUtils', {
  login: () => ipcRendererHolder.send(IpcEvents.SERVICE_PROVIDERS, { type: ServiceProviderEvents.LOGIN }),
})

contextBridge.exposeInMainWorld('Store', {
  get: (key: string) => ipcRendererHolder.send(IpcEvents.STORE, { type: StoreEvents.GET_DATA, params: { key: key } }),
  set: (key: string, value: any) =>
    ipcRendererHolder.send(IpcEvents.STORE, { type: StoreEvents.SET_DATA, params: { key: key, value: value } }),
  getSecure: (key: string) => ipcRendererHolder.send(IpcEvents.STORE, { type: StoreEvents.GET_SECURE, params: { service: key } }),
  setSecure: (key: string, value: string) => ipcRendererHolder.send(IpcEvents.STORE, { type: StoreEvents.SET_SECURE, params: { service: key, token: value } }),
  removeSecure: (key: string) => ipcRendererHolder.send(IpcEvents.STORE, { type: StoreEvents.REMOVE_SECURE, params: { service: key } }),
})

contextBridge.exposeInMainWorld('FileUtils', {
  scan: () => ipcRendererHolder.send(IpcEvents.SCANNER, { type: ScannerEvents.SCAN_MUSIC }),
  saveAudioTOFile: (path: string, blob: Buffer) =>
    ipcRendererHolder.send(IpcEvents.SONG, { type: SongEvents.SAVE_AUDIO_TO_FILE, params: { path: path, blob: blob } }),
  saveImageToFile: (path: string, blob: Buffer) =>
    ipcRendererHolder.send(IpcEvents.SONG, { type: SongEvents.SAVE_IMAGE_TO_FILE, params: { path: path, blob: blob } }),
  isAudioExists: (path: string) =>
    ipcRendererHolder.send(IpcEvents.SONG, { type: SongEvents.AUDIO_EXISTS, params: { path: path } }),
  isImageExists: (path: string) =>
    ipcRendererHolder.send(IpcEvents.SONG, { type: SongEvents.IMAGE_EXISTS, params: { path: path } }),
  savePlaylistCover: (b64: string) => ipcRendererHolder.send(IpcEvents.PLAYLIST, { type: PlaylistEvents.SAVE_COVER, params: { b64: b64 } })
})

contextBridge.exposeInMainWorld('SearchUtils', {
  searchCompact: (term: string) =>
    ipcRendererHolder.send(IpcEvents.SEARCH, { type: SearchEvents.SEARCH_SONGS_COMPACT, params: { searchTerm: term } }),
  searchAll: (term: string) =>
    ipcRendererHolder.send(IpcEvents.SEARCH, { type: SearchEvents.SEARCH_ALL, params: { searchTerm: term } }),
  searchYT: (term: string) =>
    ipcRendererHolder.send(IpcEvents.SEARCH, { type: SearchEvents.SEARCH_YT, params: { searchTerm: term } }),
})

contextBridge.exposeInMainWorld('WindowUtils', {
  openPreferenceWindow: () => ipcRendererHolder.send(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.OPEN_PREF }),
  closePreferenceWindow: () => ipcRendererHolder.send(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.CLOSE_PREF }),
  minPreferenceWindow: () => ipcRendererHolder.send(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.MIN_PREF }),
  maxPreferenceWindow: () => ipcRendererHolder.send(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.MAX_PREF }),
  setMainWindowResizeListener: (callback: () => void) => {
    ipcRendererHolder.on(WindowEvents.MAX_MAIN, callback)
    ipcRendererHolder.on(WindowEvents.MIN_MAIN, callback)
  },
  closeMainWindow: () => ipcRendererHolder.send(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.CLOSE_MAIN }),
  minMainWindow: () => ipcRendererHolder.send(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.MIN_MAIN }),
  maxMainWindow: () => ipcRendererHolder.send(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.MAX_MAIN }),
  openFileBrowser: (file: boolean, filters?: Electron.FileFilter[]) => ipcRendererHolder.send(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.OPEN_FILE_BROWSER, params: { file, filters } }),
  toggleDevTools: () => ipcRendererHolder.send(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.TOGGLE_DEV_TOOLS }),
  openExternal: (url: string) => ipcRendererHolder.send(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.OPEN_URL_EXTERNAL, params: { url: url } }),
  registerOAuthCallback: (callback: (data: string) => void) => ipcRendererHolder.on(WindowEvents.LISTEN_OAUTH_EVENT, callback),
  deregisterOAuthCallback: () => ipcRendererHolder.removeAllListener(WindowEvents.LISTEN_OAUTH_EVENT)
})

contextBridge.exposeInMainWorld('LoggerUtils', {
  info: (message: any) =>
    ipcRendererHolder.send(IpcEvents.LOGGER, { type: LoggerEvents.INFO, params: { message: message } }),
  error: (message: any) =>
    ipcRendererHolder.send(IpcEvents.LOGGER, { type: LoggerEvents.ERROR, params: { message: message } })
})

contextBridge.exposeInMainWorld('NotifierUtils', {
  registerMainProcessNotifier: (callback: (obj: NotificationObject) => void) => ipcRendererHolder.on(IpcEvents.NOTIFIER, callback)
})

contextBridge.exposeInMainWorld('ExtensionUtils', {
  install: (...path: string[]) => ipcRendererHolder.send(IpcEvents.EXTENSION_HOST, { type: ExtensionHostEvents.INSTALL, params: { path: path } }),
  uninstall: (packageName: string) => ipcRendererHolder.send(IpcEvents.EXTENSION_HOST, { type: ExtensionHostEvents.REMOVE_EXT, params: { packageName } }),
  sendEvent: (data: extensionHostMessage) => ipcRendererHolder.send(IpcEvents.EXTENSION_HOST, { type: ExtensionHostEvents.EVENT_TRIGGER, params: { data: data } }),
  getAllExtensions: () => ipcRendererHolder.send(IpcEvents.EXTENSION_HOST, { type: ExtensionHostEvents.GET_ALL_EXTENSIONS }),
  listenRequests: (callback: (request: extensionRequestMessage) => void) => ipcRendererHolder.on(ExtensionHostEvents.EXTENSION_REQUESTS, callback),
  replyToRequest: (data: extensionReplyMessage) => ipcRenderer.send(ExtensionHostEvents.EXTENSION_REQUESTS, data),
  toggleExtStatus: (packageName: string, enabled: boolean) => ipcRendererHolder.send(IpcEvents.EXTENSION_HOST, { type: ExtensionHostEvents.TOGGLE_EXT_STATUS, params: { packageName, enabled } }),
})
