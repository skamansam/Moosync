export interface Song {
  _id?: string
  title: string | undefined
  album: string | undefined
  artists: string[] | undefined
  date: string | undefined
  year: number | undefined
  genre: string[] | undefined
  lyrics: string[] | undefined
  releaseType: string[] | undefined
  bitrate: number | undefined
  codec: string | undefined
  container: string | undefined
  duration: number | undefined
  sampleRate: number | undefined
  cover: CoverImg | undefined
  hash: string
}

export interface miniSong {
  _id?: string
  title: string | undefined
  album: string | undefined
  artists: string[] | undefined
}

export interface CoverImg {
  data: string | undefined
  description: string | undefined
  mime: string | undefined
  height: number | undefined
  width: number | undefined
  type: string | undefined
}
