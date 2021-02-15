import { Song } from '@/models/songs'

export interface Playlist {
  playlist_id: string
  name: string
  coverPath: string | undefined
  songs?: Song[]
}
