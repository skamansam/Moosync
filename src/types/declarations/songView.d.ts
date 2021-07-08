interface SongDetailDefaults {
  defaultTitle: string
  defaultSubtitle: any
  defaultCover: string
  defaultSubSubtitle: string
}

interface SongDetailButtons {
  enableContainer: boolean
  enableLibraryStore: boolean
}

type TableFields = 'index' | 'title' | 'album_name' | 'artist_name'