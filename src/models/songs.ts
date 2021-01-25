export interface Song {
  _id?: string
  path: string
  title: string
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
  hash: string
}

export interface CoverImg {
  _id?: string
  data: string | undefined
  description: string | undefined
  mime: string | undefined
  height: number | undefined
  width: number | undefined
  type: string | undefined
}
