
type togglePaths = { path: string, enabled: boolean }[]

type songMenu = "compact" | "classic"

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

