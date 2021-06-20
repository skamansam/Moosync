type ContextMenuArgs = {
  type: 'SONGS'
  args: {
    exclude: string | undefined
    songs: Song[]
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
    refreshCallback: () => void
  }
} |
{
  type: 'GENERAL_PLAYLIST'
} | {
  type: 'PLAYLIST_CONTENT',
  args: {
    isRemote: boolean,
    songs: Song[]
  }
}