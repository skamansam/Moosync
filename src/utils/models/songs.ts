import { Album } from '@/utils/models/albums'
export interface Song {
  _id?: string
  path?: string
  size?: number
  title: string
  album?: Album
  artists?: string[]
  date?: string
  year?: number
  genre?: string[]
  lyrics?: string
  releaseType?: string[]
  bitrate?: number
  codec?: string
  container?: string
  duration: number
  sampleRate?: number
  hash?: string
  inode?: string
  deviceno?: string
  url?: string
  type: 'LOCAL' | 'YOUTUBE' | 'SPOTIFY'
}

export interface marshaledSong {
  _id: string
  path?: string
  size?: number
  title: string
  album_id?: string
  album_name?: string
  album_coverPath?: string
  album_song_count?: number
  lyrics?: string
  artist_name?: string
  artists_id?: string
  artist_coverPath?: string
  genre_name?: string
  genere_id?: string
  date?: string
  year?: number
  bitrate?: number
  codec?: string
  container?: string
  duration: number
  sampleRate?: number
  hash?: string
  inode?: string
  deviceno?: string
  url?: string
  type: 'LOCAL' | 'YOUTUBE' | 'SPOTIFY'
}

export interface stats {
  path: string
  size: number
  inode: string
  deviceno: string
  hash?: string
}

export interface image {
  path: string
  data: Buffer
}
