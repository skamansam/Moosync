import { playlistInfo } from '@/store/playlists'
import { remote } from 'electron'

export function getPlaylistsMenu(
  playlists: playlistInfo,
  onClick: (playlist_id: string) => void,
  onNewPlaylist: () => void
) {
  let menu = new remote.Menu()
  for (let p in playlists) {
    menu.append(
      new remote.MenuItem({
        label: playlists[p],
        click: () => onClick(p),
      })
    )
  }
  menu.append(
    new remote.MenuItem({
      label: 'New Playlist',
      click: onNewPlaylist,
    })
  )
  return menu
}
