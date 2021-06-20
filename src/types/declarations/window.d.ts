import { Song } from '@/utils/models/songs'
import { Album } from '@/utils/models/albums'
import { artists } from '@/utils/models/artists'
import { Genre } from '@/utils/models/genre'
import { Playlist } from '@/utils/models/playlists'

import { YoutubeItem } from '@/utils/models/youtube'
import { SearchResult } from '@/utils/models/searchResult'

interface DBUtils {
  getAllSongs: () => Promise<Song[]>
  removeSongs: (songs: Song[]) => Promise<void>
  storeSongs: (songs: Song[]) => Promise<void>
  getAllAlbums: () => Promise<Album[]>
  getSingleAlbum: (albumID: string) => Promise<Song[]>
  getAllArtists: () => Promise<artists[]>
  getSingleArtist: (artistID: string) => Promise<Song[]>
  getAllGenres: () => Promise<Genre[]>
  getSingleGenre: (genreID: string) => Promise<Song[]>
  getAllPlaylists: () => Promise<Playlist[]>
  getSinglePlaylist: (PlaylistID: string) => Promise<Song[]>
  createPlaylist: (name: string, desc: string, imgSrc: string) => Promise<string>
  addToPlaylist: (playlistID: string, ...songIDs: Song[]) => Promise<void>
  removePlaylist: (playlistID: string) => Promise<void>
}

interface providerUtils {
  login: () => Promise<void>
}

interface searchUtils {
  searchCompact: (term: string) => Promise<SearchResult>
  searchAll: (term: string) => Promise<SearchResult>
  searchYT: (term: string) => Promise<YoutubeItem[]>
}

interface fileUtils {
  scan: () => Promise<void>
  saveAudioTOFile: (path: string, blob: Buffer) => Promise<string>
  saveImageToFile: (path: string, blob: Buffer) => Promise<string>
  savePlaylistCover: (b64: string) => Promise<string>
  isAudioExists: (path: string) => Promise<string | null>
  isImageExists: (path: string) => Promise<string | null>
}

interface preferenceUtils {
  load: () => Promise<Preferences>
  save: (preference: Preferences) => Promise<void>
}

interface store {
  get: (key: string) => Promise<any>
  set: (key: string, value: string) => Promise<void>
  getSecure: (key: string) => Promise<string | null>
  setSecure: (key: string, value: string) => Promise<void>
  removeSecure: (key: string) => Promise<void>
}

interface windowUtils {
  openPreferenceWindow: () => Promise<void>
  closePreferenceWindow: () => Promise<void>
  minPreferenceWindow: () => Promise<void>
  maxPreferenceWindow: () => Promise<boolean>
  closeMainWindow: () => Promise<void>
  minMainWindow: () => Promise<void>
  maxMainWindow: () => Promise<boolean>
  openFileBrowser: () => Promise<Electron.OpenDialogReturnValue>
  toggleDevTools: () => Promise<void>
  setMainWindowResizeListener: (callback: () => void) => void
  openExternal: (url: string) => Promise<void>
  registerOAuthCallback: (callback: (data: string) => void) => void
  deregisterOAuthCallback: () => void
}

declare global {
  interface Window {
    DBUtils: DBUtils
    SearchUtils: searchUtils
    FileUtils: fileUtils
    PreferenceUtils: preferenceUtils
    WindowUtils: windowUtils
    ProviderUtils: providerUtils
    Store: store
  }
}
