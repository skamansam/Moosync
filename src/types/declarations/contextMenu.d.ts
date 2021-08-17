type ContextMenuArgs = {
  type: 'SONGS'
  args: {
    exclude: string | undefined
    refreshCallback: () => void
    songs: Song[]
  }
} | {
  type: 'GENERAL_SONGS'
  args: {
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