type ContextMenuArgs = {
  type: 'SONGS'
  args: {
    exclude: string | undefined
    refreshCallback: () => void
    songs: Song[]
    sortOptions?: sort
  }
} | {
  type: 'GENERAL_SONGS'
  args: {
    sortOptions?: sort
    refreshCallback: () => void
  }
} | {
  type: 'YOUTUBE'
  args: {
    ytItems: YoutubeItem[]
  }
} | {
  type: 'PLAYLIST'
  args: {
    playlist: Playlist
    deleteCallback: () => void
  }
} |
{
  type: 'GENERAL_PLAYLIST',
  args: {
    refreshCallback: () => void
  }
} | {
  type: 'PLAYLIST_CONTENT',
  args: {
    isRemote: boolean,
    refreshCallback: () => void
    sortOptions?: sort
    songs: Song[]
  }
} | {
  type: 'QUEUE_ITEM',
  args: {
    isRemote: boolean
    refreshCallback: () => void
    song: Song
  }
}

type sortOptions = import('@moosync/moosync-types').sortOptions
type sort = { callback: sortCallback, current: sortOptions }
type sortCallback = (options: sortOptions) => void