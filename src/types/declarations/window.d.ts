import { Song } from '@/models/songs'
import { Album } from '@/models/albums'
import { artists } from '@/models/artists'
import { Genre } from '@/models/genre'
import { Playlist } from '@/models/playlists'

import { YoutubeItem } from '@/models/youtube'
import { SearchResult } from '@/models/searchResult'
import { Preferences } from '@/utils/db/constants'

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
  createPlaylist: (name: string) => Promise<string>
  addToPlaylist: (playlistID: string, ...songIDs: Song[]) => Promise<void>
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
}

declare global {
  interface Window {
    DBUtils: DBUtils
    SearchUtils: searchUtils
    FileUtils: fileUtils
    PreferenceUtils: preferenceUtils
    WindowUtils: windowUtils
    Store: store
  }
}
