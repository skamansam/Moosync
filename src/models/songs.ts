export interface Song {
  _id?: string
  path: string
  coverPath: string | undefined
  title: string
  album: string | undefined
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
  hash: string
}
