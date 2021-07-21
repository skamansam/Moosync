import { IpcEvents, PlaylistEvents } from './constants'
import { getDisabledPaths, loadPreferences } from '@/utils/main/db/preferences'

import { SongDB } from '@/utils/main/db'
import fs from 'fs'
import path from 'path'
import { v4 } from 'uuid'

export class PlaylistsChannel implements IpcChannelInterface {
  name = IpcEvents.PLAYLIST
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case PlaylistEvents.ADD_TO_PLAYLIST:
        this.addToPlaylist(event, request)
        break
      case PlaylistEvents.CREATE_PLAYLIST:
        this.createPlaylist(event, request)
        break
      case PlaylistEvents.GET_ALL_PLAYLISTS:
        this.getAllPlaylists(event, request)
        break
      case PlaylistEvents.GET_PLAYLIST:
        this.getPlaylist(event, request)
        break
      case PlaylistEvents.SAVE_COVER:
        this.saveCoverToFile(event, request)
        break
      case PlaylistEvents.REMOVE_PLAYLIST:
        this.removePlaylist(event, request)
        break
    }
  }

  private async getPlaylist(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.id) {
      const preferences = await loadPreferences()
      SongDB.getPlaylistSongs(request.params.id, getDisabledPaths(preferences.musicPaths))
        .then((data) => {
          event.reply(request.responseChannel, data)
        })
        .catch((e) => console.error(e))
    }
  }

  private getAllPlaylists(event: Electron.IpcMainEvent, request: IpcRequest) {
    SongDB.getPlaylists()
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.error(e))
  }

  private createPlaylist(event: Electron.IpcMainEvent, request: IpcRequest) {
    SongDB.createPlaylist(request.params.name, request.params.desc, request.params.imgSrc)
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.error(e))
  }
  private addToPlaylist(event: Electron.IpcMainEvent, request: IpcRequest) {
    SongDB.addToPlaylist(request.params.playlist_id, ...request.params.song_ids)
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.error(e))
  }

  private async saveCoverToFile(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.b64) {
      const cacheDir = (await loadPreferences()).thumbnailPath
      const filePath = path.join(cacheDir, v4() + ".png")
      if (fs.existsSync(cacheDir)) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } else {
        fs.mkdirSync(cacheDir)
      }
      fs.writeFile(filePath, request.params.b64.replace(/^data:image\/png;base64,/, ""), 'base64', () => {
        event.reply(request.responseChannel, filePath)
      })
    }
  }

  private removePlaylist(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.playlist_id) {
      SongDB.removePlaylist(request.params.playlist_id).then(() => event.reply(request.responseChannel)
      )
    }
  }
}
