import { Album } from '@/models/albums'
export interface Song {
  _id?: string
  path: string
  size: string
  title: string
  album: Album
  artists: string[] | undefined
  date: string | undefined
  year: number | undefined
  genre: string[] | undefined
  lyrics: string | undefined
  releaseType: string[] | undefined
  bitrate: number | undefined
  codec: string | undefined
  container: string | undefined
  duration: number | undefined
  sampleRate: number | undefined
  hash: string | undefined
  inode: string
  deviceno: string
}

export interface marshaledSong {
  _id: string
  path: string
  size: string
  title: string
  album_id?: string | undefined
  album_name?: string | undefined
  album_coverPath?: string
  lyrics: string | undefined
  artist_name?: string
  artists_id?: string
  artist_coverPath?: string
  genre_name?: string
  genere_id?: string
  date: string | undefined
  year: number | undefined
  bitrate: number | undefined
  codec: string | undefined
  container: string | undefined
  duration: number | undefined
  sampleRate: number | undefined
  hash: string | undefined
  inode: string
  deviceno: string
}

export interface stats {
  path: string
  size: string
  inode: string
  deviceno: string
}

export interface image {
  path: string
  data: Buffer
}
