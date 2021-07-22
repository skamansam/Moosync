interface Album {
  album_id?: string
  album_name?: string
  album_coverPath?: string
  album_song_count?: number
  album_artist?: string
  year?: number
}

interface artists {
  artist_id: string
  artist_name?: string
  artist_mbid?: string
  artist_coverPath?: string
  artist_song_count?: number
}

interface Genre {
  genre_id: string
  genre_name: string
  genre_song_count: number
}

interface Playlist {
  playlist_id: string
  playlist_name: string
  playlist_coverPath: string | undefined
  playlist_songs?: Song[]
  playlist_song_count: number
  isRemote?: boolean
}

interface SearchResult {
  songs?: Song[]
  albums?: Album[]
  artists?: artists[]
  genres?: Genre[]
  playlists?: Playlist[]
  youtube?: YoutubeItem[]
}

interface Song {
  _id?: string
  path?: string
  size?: number
  title: string
  song_coverPath?: string
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

interface marshaledSong {
  _id: string
  path?: string
  size?: number
  title: string
  song_coverPath?: string
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

interface stats {
  path: string
  size: number
  inode: string
  deviceno: string
  hash?: string
}

interface image {
  path: string
  data: Buffer
}

interface YoutubeItem {
  _id: string
  yt_title: string
  yt_album?: string
  yt_artist?: string
  yt_coverImage?: string
  duration: number
}



