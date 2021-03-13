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

interface scannerUtils {
  scan: () => Promise<void>
}

interface preferenceUtils {
  load: () => Promise<Preferences>
  save: (preference: Preferences) => Promise<void>
}

interface windowUtils {
  openPreferenceWindow: () => Promise<Void>
  closePreferenceWindow: () => Promise<Void>
  minPreferenceWindow: () => Promise<Void>
  maxPreferenceWindow: () => Promise<Void>
  closeMainWindow: () => Promise<Void>
  minMainWindow: () => Promise<Void>
  maxMainWindow: () => Promise<Void>
  openFileBrowser: () => Promise<Void>
  toggleDevTools: () => Promise<Void>
}

declare global {
  interface Window {
    DBUtils: DBUtils
    SearchUtils: searchUtils
    ScannerUtils: scannerUtils
    PreferenceUtils: preferenceUtils
    WindowUtils: windowUtils
  }
}
