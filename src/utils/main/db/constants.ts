export type musicPaths = { path: string, enabled: boolean }[]
export interface Preferences {
  musicPaths: musicPaths
  thumbnailPath: string
  artworkPath: string
}
