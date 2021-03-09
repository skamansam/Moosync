// import { IpcChannelInterface, IpcRequest } from '.'
// import { Menu, MenuItem } from 'electron'

// import { IpcEvents } from './constants'
// import { SongDB } from '@/utils/db'
// import { playlistInfo } from '@/mainWindow/store/playlists'

// function getPlaylistsMenu(playlists: playlistInfo, onClick: (playlist_id: string) => void, onNewPlaylist: () => void) {
//   let menu = new Menu()
//   for (let p in playlists) {
//     menu.append(
//       new MenuItem({
//         label: playlists[p],
//         click: () => onClick(p),
//       })
//     )
//   }
//   menu.append(
//     new MenuItem({
//       label: 'New Playlist',
//       click: onNewPlaylist,
//     })
//   )
//   return menu
// }

// function getSongContextMenu(playlists: playlistInfo, onClick: (p: string) => void, onNewPlaylist: () => void) {
//   let menu = new Menu()
//   menu.append(
//     new MenuItem({
//       label: 'Add to playlist',
//       submenu: getPlaylistsMenu(playlists, (p: string) => onClick(p), onNewPlaylist),
//     })
//   )
//   menu.popup()
// }
