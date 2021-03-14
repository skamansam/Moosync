import { contextBridge, ipcRenderer } from 'electron'
import { IpcRendererHolder } from '@/utils/ipc/renderer/index'
import {
  WindowEvents,
  IpcEvents,
  AlbumEvents,
  ArtistEvents,
  GenreEvents,
  PlaylistEvents,
  PreferenceEvents,
  ScannerEvents,
  SearchEvents,
  SongEvents,
} from '@/utils/ipc/main/constants'
import { Song } from './models/songs'
import { Preferences } from './utils/db/constants'

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
  createPlaylist: (name: string) =>
    ipcRendererHolder.send(IpcEvents.PLAYLIST, { type: PlaylistEvents.CREATE_PLAYLIST, params: { name: name } }),
  addToPlaylist: (playlistID: string, ...songIDs: Song[]) =>
    ipcRendererHolder.send(IpcEvents.PLAYLIST, {
      type: PlaylistEvents.ADD_TO_PLAYLIST,
      params: { playlist_id: playlistID, song_ids: songIDs },
    }),

  getAllSongs: () => ipcRendererHolder.send(IpcEvents.SONG, { type: SongEvents.GET_ALL_SONGS }),
  storeSongs: (songs: Song[]) =>
    ipcRendererHolder.send(IpcEvents.SONG, { type: SongEvents.STORE_SONG, params: { songs: songs } }),
  removeSong: (songs: Song[]) =>
    ipcRendererHolder.send(IpcEvents.SONG, { type: SongEvents.REMOVE_SONG, params: { songs: songs } }),
})

contextBridge.exposeInMainWorld('PreferenceUtils', {
  load: () => ipcRendererHolder.send(IpcEvents.PREFERENCES, { type: PreferenceEvents.LOAD_PREFERENCES }),
  save: (preferences: Preferences) =>
    ipcRendererHolder.send(IpcEvents.PREFERENCES, {
      type: PreferenceEvents.SAVE_PREFERENCES,
      params: { preferences: preferences },
    }),
})

contextBridge.exposeInMainWorld('ScannerUtils', {
  scan: () => ipcRendererHolder.send(IpcEvents.SCANNER, { type: ScannerEvents.SCAN_MUSIC }),
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
  closeMainWindow: () => ipcRendererHolder.send(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.CLOSE_MAIN }),
  minMainWindow: () => ipcRendererHolder.send(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.MIN_MAIN }),
  maxMainWindow: () => ipcRendererHolder.send(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.MAX_MAIN }),
  openFileBrowser: () => ipcRendererHolder.send(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.OPEN_FILE_BROWSER }),
  toggleDevTools: () => ipcRendererHolder.send(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.TOGGLE_DEV_TOOLS }),
})
