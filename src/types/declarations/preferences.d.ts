
type togglePaths = { path: string, enabled: boolean }[]

interface Preferences {
  musicPaths: togglePaths
  thumbnailPath: string
  artworkPath: string,
  systemSettings: {
    key: String,
    title: String,
    enabled: boolean
  }[]
}

