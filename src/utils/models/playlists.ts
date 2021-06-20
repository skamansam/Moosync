import { Song } from '@/utils/models/songs'

export interface Playlist {
  playlist_id: string
  playlist_name: string
  playlist_coverPath: string | undefined
  playlist_songs?: Song[]
  playlist_song_count: number
}
