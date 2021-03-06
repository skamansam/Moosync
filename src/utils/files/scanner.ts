import * as mm from 'music-metadata'

import { Song, image, stats } from '@/models/songs'
import fs, { promises as fsP } from 'fs'

import Jimp from 'jimp'
import PromiseThrottle from 'promise-throttle'
import { SongDB } from '../db/index'
import crypto from 'crypto'
import { musicPaths } from '../db/constants'
import os from 'os'
import path from 'path'
import { preferences } from '@/utils/db/preferences'
import { v4 } from 'uuid'

const audioPatterns = new RegExp('.flac|.mp3|.ogg|.m4a|.webm|.wav|.wv', 'i')
export async function writeBuffer(data: image) {
  return (await Jimp.read(data.data)).cover(320, 320).quality(80).writeAsync(data.path)
}

async function getInfo(data: mm.IAudioMetadata, stats: stats, coverPath?: string): Promise<Song> {
  let artists: string[] = []
  if (data.common.artists) {
    for (let a of data.common.artists) {
      artists.push(...a.split(/[,&]+/))
    }
  }

  return {
    title: data.common.title ? data.common.title : path.basename(stats.path).split('.').slice(0, -1).join('.').trim(),
    path: stats.path,
    size: stats.size,
    album: {
      album_name: data.common.album,
      album_coverPath: coverPath,
      album_song_count: 0,
      year: data.common.year,
    },
    artists: artists,
    date: data.common.date,
    year: data.common.year,
    genre: data.common.genre,
    lyrics: data.common.lyrics ? data.common.lyrics[0] : undefined,
    releaseType: data.common.releasetype,
    bitrate: data.format.bitrate,
    codec: data.format.codec,
    container: data.format.container,
    duration: data.format.duration || 0,
    sampleRate: data.format.sampleRate,
    hash: undefined,
    inode: stats.inode,
    deviceno: stats.deviceno,
    type: 'LOCAL',
  }
}

function getCover(data: mm.IAudioMetadata, filePath: string): image | undefined {
  if (data.common.picture) {
    let coverPath = path.join(path.dirname(filePath), v4() + '.jpg')
    return {
      path: coverPath,
      data: data.common.picture[0].data,
    }
  }
}

export class MusicScanner {
  private paths: musicPaths

  constructor(...paths: musicPaths) {
    this.paths = paths
  }

  private async scanFile(filePath: string): Promise<void> {
    let stats = await fsP.stat(filePath)
    return this.storeSong({
      path: filePath,
      inode: stats.ino.toString(),
      deviceno: stats.dev.toString(),
      size: stats.size.toString(),
    })
  }

  private async processFile(stats: stats) {
    const metadata = await mm.parseFile(stats.path)
    const cover = getCover(metadata, stats.path)
    const info = await getInfo(metadata, stats, cover ? cover.path : undefined)
    return { song: info, cover: cover }
  }

  private async destructiveScan() {
    let allSongs = await SongDB.getAllSongs()
    const regex = new RegExp(preferences.musicPaths.join('|'))
    for (let s of allSongs) {
      if (s.type == 'LOCAL' && s.path) {
        try {
          s.path.match(regex) ? await SongDB.removeSong(s._id!) : null
          await fs.promises.access(s.path!, fs.constants.F_OK)
        } catch (e) {
          await SongDB.removeSong(s._id!)
        }
      }
    }
  }

  private async updateCounts() {
    await SongDB.updateSongCountAlbum()
    await SongDB.updateSongCountArtists()
    await SongDB.updateSongCountGenre()
    await SongDB.updateSongCountPlaylists()
  }

  public async start() {
    var promisesThrottled = new PromiseThrottle({
      requestsPerSecond: os.cpus().length / 2,
      promiseImplementation: Promise,
    })
    var promises: Promise<void>[] = []
    await this.destructiveScan()
    for (let i in this.paths) {
      if (fs.existsSync(this.paths[i].path)) {
        let files = fs.readdirSync(this.paths[i].path)
        files.forEach((file) => {
          if (audioPatterns.exec(path.extname(file)) !== null) {
            promises.push(promisesThrottled.add(this.scanFile.bind(this, path.join(this.paths[i].path, file))))
          }
        })
      } else {
        console.log('invalid directory: ' + this.paths[i])
      }
    }
    await Promise.all(promises)
    await this.updateCounts()
  }
  private async generateChecksum(file: string): Promise<string> {
    return new Promise((resolve) => {
      var hash = crypto.createHash('md5')
      var fileStream = fs.createReadStream(file, { highWaterMark: 256 * 1024 })
      fileStream.on('data', (data) => {
        hash.update(data)
      })
      fileStream.on('end', function () {
        resolve(hash.digest('hex'))
      })
    })
  }

  private async storeSong(info: stats): Promise<void> {
    const songsBySize = await SongDB.getBySize(info.size)
    if (songsBySize.length > 0) {
      for (let i in songsBySize) {
        const SongInfo = (await SongDB.getInfoByID(songsBySize[i]._id))[0]
        if (info.deviceno === SongInfo.deviceno) {
          if (info.inode === SongInfo.inode) {
            return
          }
        } else {
          const hash1 = await this.generateChecksum(info.path)
          const hash2 = await this.generateChecksum(SongInfo.path)

          if (hash1 == hash2) return
        }
      }
    }
    let scanned = await this.processFile(info)
    if (scanned.cover) {
      await writeBuffer(scanned.cover)
    }
    let result = SongDB.store(scanned.song)
    console.log(scanned.song.title)
    return new Promise((resolve) => {
      resolve(result)
    })
  }
}
