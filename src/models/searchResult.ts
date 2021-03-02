import { Album } from './albums'
import { Genre } from './genre'
import { Playlist } from './playlists'
import { Song } from './songs'
import { artists } from './artists'

export interface SearchResult {
  songs: Song[]
  albums?: Album[]
  artists?: artists[]
  genres?: Genre[]
  playlists?: Playlist[]
}
