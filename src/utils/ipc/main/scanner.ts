import { IpcEvents, ScannerEvents } from './constants'

import { IpcChannelInterface } from '.'
import { IpcRequest } from './index'
import { app, IpcMainEvent } from 'electron'
import { spawn, Worker } from 'threads'
import { loadPreferences } from '@/utils/db/preferences'
import { SongDB } from '@/utils/db/index'
import { Song } from '@/models/songs'
import path from 'path'
import { ObservablePromise } from 'threads/dist/observable-promise'

import { artists } from '@/models/artists'
import { Preferences } from '@/utils/db/constants'
import { musicPaths } from '@/utils/db/constants'
import fs from 'fs'

enum scanning {
  UNDEFINED,
  SCANNING,
  QUEUED,
}

export class ScannerChannel implements IpcChannelInterface {
  name = IpcEvents.SCANNER
  private scanStatus: scanning = scanning.UNDEFINED
  handle(event: IpcMainEvent, request: IpcRequest) {
    switch (request.type) {
      case ScannerEvents.SCAN_MUSIC:
        if (this.scanStatus == scanning.SCANNING || this.scanStatus == scanning.QUEUED) {
          console.log('scan queued')
          this.scanStatus = scanning.QUEUED
          return
        }
        this.scanStatus = scanning.SCANNING
        this.ScanSongs(event, request)
        break
    }
  }
  private async storeSong(song: Song): Promise<void> {
    return SongDB.store(song)
  }

  private async checkDuplicate(song: Song) {
    const count = await SongDB.countByHash(song.hash!)
    if (count == 0) {
      this.storeSong(song)
    }
  }

  private scanSongs(preferences: Preferences, scan: (paths: musicPaths) => ObservablePromise<Song>) {
    return new Promise((resolve, reject) => {
      scan(preferences.musicPaths).subscribe(
        (result) => this.checkDuplicate(result),
        (err: Error) => reject(err),
        () => resolve(undefined)
      )
    })
  }

  private fetchMBID(allArtists: artists[], fetch: (artist: artists[]) => ObservablePromise<artists>) {
    return new Promise((resolve, reject) => {
      fetch(allArtists).subscribe(
        (result) => (result ? SongDB.updateArtists(result) : null),
        (err) => reject(err),
        () => resolve(undefined)
      )
    })
  }

  private async updateArtwork(result: artists) {
    if (result) {
      if (result.artist_coverPath == 'default') {
        result.artist_coverPath = await SongDB.getDefaultCoverByArtist(result.artist_id)
      }
      SongDB.updateArtists(result)
    }
  }

  private async fetchArtworks(allArtists: artists[], fetch: (artist: artists[], path: string) => ObservablePromise<artists>) {
    const artworkPath = (await loadPreferences()).artworkPath
    return new Promise((resolve, reject) => {
      fetch(allArtists, artworkPath).subscribe(
        this.updateArtwork,
        (err) => reject(err),
        () => resolve(undefined)
      )
    })
  }

  private async extractCovers(cover: (songPath: string, coverPath: string) => ObservablePromise<void>) {
    const songs = await SongDB.getAllSongs()
    const thumbPath = (await loadPreferences()).thumbnailPath
    for (const s of songs) {
      if (s.album && s.album.album_name) {
        const existingAlbum = await SongDB.getAlbumByName(s.album.album_name)
        if (!existingAlbum!.album_coverPath) {
          const coverPath = path.join(thumbPath, existingAlbum!.album_id + '.jpg')
          cover(s.path!, coverPath)
          await SongDB.updateAlbum({ album_id: existingAlbum!.album_id, album_coverPath: coverPath })
        }
      }
    }
  }

  private async updateCounts() {
    SongDB.updateSongCountAlbum()
    SongDB.updateSongCountArtists()
    SongDB.updateSongCountGenre()
    SongDB.updateSongCountPlaylists()
  }

  private async destructiveScan(paths: musicPaths) {
    const allSongs = await SongDB.getAllSongs()
    const regex = new RegExp(paths.join('|'))
    for (const s of allSongs) {
      if (s.type == 'LOCAL') {
        try {
          if (paths.length == 0 || !(s.path && s.path.match(regex)) || !s.path) {
            await SongDB.removeSong(s._id!)
            continue
          }
          await fs.promises.access(s.path!, fs.constants.F_OK)
        } catch (e) {
          await SongDB.removeSong(s._id!)
        }
      }
    }
  }

  private async scanAll(event: IpcMainEvent, request: IpcRequest) {
    const scanner = await spawn(new Worker('@/utils/workers/scanner.ts', { type: 'module' }))
    const cover = await spawn(new Worker('@/utils/workers/covers.ts', { type: 'module' }))

    const preferences = await loadPreferences()

    await this.destructiveScan(preferences.musicPaths)
    await this.scanSongs(preferences, scanner.start)

    this.updateCounts()

    this.extractCovers(cover.writeCover)

    const scraper = await spawn(new Worker('@/utils/workers/scraper.ts', { type: 'module' }))

    const allArtists = await SongDB.getAllArtists()
    await this.fetchMBID(allArtists, scraper.fetchMBID)

    await this.fetchArtworks(allArtists, scraper.fetchArtworks)

    event.reply(request.responseChannel, 'done')

    if (this.scanStatus == scanning.QUEUED) {
      console.log('scannign again')
      this.scanAll(event, request)
    }

    this.scanStatus = scanning.UNDEFINED
  }

  private ScanSongs(event: IpcMainEvent, request: IpcRequest) {
    this.scanAll(event, request).catch((err) => console.log(err))
  }
}
