import fs, { promises as fsP } from 'fs'
import path from 'path'
import * as mm from 'music-metadata'
import { image, Song, stats } from '@/models/songs'
import { SongDB } from '../db/index'
import Jimp from 'jimp'
import { v4 } from 'uuid'
import crypto from 'crypto'

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
    title: data.common.title ? data.common.title : path.basename(stats.path),
    path: stats.path,
    size: stats.size,
    album: {
      album_name: data.common.album,
      album_coverPath: coverPath,
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
    duration: data.format.duration,
    sampleRate: data.format.sampleRate,
    hash: undefined,
    inode: stats.inode,
    deviceno: stats.deviceno,
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
  private paths: string[]

  constructor(...paths: string[]) {
    this.paths = paths
  }

  private async scanFile(filePath: string): Promise<void> {
    return new Promise((resolve) => {
      fsP.stat(filePath).then((stats) => {
        resolve(
          this.storeSong({
            path: filePath,
            inode: stats.ino.toString(),
            deviceno: stats.dev.toString(),
            size: stats.size.toString(),
          })
        )
      })
    })
  }

  private async processFile(stats: stats) {
    const metadata = await mm.parseFile(stats.path)
    const cover = getCover(metadata, stats.path)
    const info = await getInfo(metadata, stats, cover ? cover.path : undefined)
    return { song: info, cover: cover }
  }

  public async start() {
    let promises: Promise<void>[] = []
    for (let i in this.paths) {
      let files = fs.readdirSync(this.paths[i])
      files.forEach((file) => {
        if (audioPatterns.exec(path.extname(file)) !== null) {
          promises.push(this.scanFile(path.join(this.paths[i], file)))
        }
      })
    }
    return Promise.all(promises)
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
