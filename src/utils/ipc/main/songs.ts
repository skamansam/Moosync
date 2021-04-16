import { IpcChannelInterface, IpcRequest } from '.'
import { IpcEvents, SongEvents } from './constants'

import { SongDB } from '../../db'
import { getDisabledPaths } from '@/utils/db/preferences'
import { preferences } from '../../db/preferences'
import { Song } from '@/models/songs'
import fs from 'fs'
import path from 'path'
import { app } from 'electron'

export class SongsChannel implements IpcChannelInterface {
  name = IpcEvents.SONG
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case SongEvents.GET_ALL_SONGS:
        this.getAllSongs(event, request)
        break
      case SongEvents.STORE_SONG:
        this.storeSongs(event, request)
        break
      case SongEvents.REMOVE_SONG:
        this.removeSongs(event, request)
        break
      case SongEvents.SAVE_AUDIO_TO_FILE:
        this.saveAudioToFile(event, request)
        break
      case SongEvents.SAVE_IMAGE_TO_FILE:
        this.saveImageToFile(event, request)
        break
      case SongEvents.AUDIO_EXISTS:
        this.fileExists(event, request, 'audio')
        break
      case SongEvents.IMAGE_EXISTS:
        this.fileExists(event, request, 'image')
        break
    }
  }

  private getAllSongs(event: Electron.IpcMainEvent, request: IpcRequest) {
    SongDB.getAllSongs(getDisabledPaths(preferences.musicPaths))
      .then((data) => event.reply(request.responseChannel, data))
      .catch((e) => console.log(e))
  }

  private removeSongs(event: Electron.IpcMainEvent, request: IpcRequest) {
    let promises: Promise<void>[] = []
    if (request.params.songs) {
      const songs = request.params.songs as Song[]
      for (const s of songs) {
        promises.push(SongDB.removeSong(s._id!))
      }
    }
    Promise.all(promises)
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }

  private storeSongs(event: Electron.IpcMainEvent, request: IpcRequest) {
    let promises: Promise<void>[] = []
    if (request.params.songs) {
      const songs = request.params.songs as Song[]
      for (const s of songs) {
        promises.push(SongDB.store(s))
      }
    }
    Promise.all(promises)
      .then((data) => {
        event.reply(request.responseChannel, data)
      })
      .catch((e) => console.log(e))
  }

  private saveAudioToFile(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.path && request.params.blob) {
      const cacheDir = path.join(app.getPath('cache'), app.getName(), 'audioCache')
      const filePath = path.join(cacheDir, request.params.path)
      if (fs.existsSync(cacheDir)) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } else {
        fs.mkdirSync(cacheDir)
      }
      fs.writeFile(filePath, request.params.blob, () => {
        event.reply(request.responseChannel, filePath)
      })
    }
  }

  private saveImageToFile(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.path && request.params.blob) {
      const cacheDir = path.join(app.getPath('cache'), app.getName(), 'imageCache')
      const filePath = path.join(cacheDir, request.params.path)
      if (fs.existsSync(cacheDir)) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } else {
        fs.mkdirSync(cacheDir)
      }
      fs.writeFile(filePath, request.params.blob, () => {
        event.reply(request.responseChannel, filePath)
      })
    }
  }

  private fileExists(event: Electron.IpcMainEvent, request: IpcRequest, type: 'audio' | 'image') {
    if (request.params.path) {
      switch (type) {
        case 'audio':
          var filePath = path.join(app.getPath('cache'), app.getName(), 'audioCache', request.params.path)
          event.reply(request.responseChannel, fs.existsSync(filePath) ? filePath : null)
          break
        case 'image':
          var filePath = path.join(app.getPath('cache'), app.getName(), 'imageCache', request.params.path)
          event.reply(request.responseChannel, fs.existsSync(filePath) ? filePath : null)
          break
      }
    }
  }
}
