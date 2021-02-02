import fs from 'fs'
import path from 'path'
import * as mm from 'music-metadata'
import { Song } from '@/models/songs'
import { SongDB } from '../db/index'
import md5 from 'md5-file'
import { base64 } from 'rfc4648'

import { ExtendedIPicture } from '@/types/declarations/musicmetadata'
import { app } from 'electron'
import { Databases } from '../db/constants'
import Jimp from 'jimp'
import { v4 } from 'uuid'

const audioPatterns = new RegExp('.flac|.mp3|.ogg|.m4a|.webm|.wav|.wv', 'i')
async function _arrayBufferToBase64(img: Buffer, path: string) {
  if (img) {
    return (await Jimp.read(img)).cover(320, 320).quality(80).writeAsync(path)
  }
}

function parseMetadata(data: mm.IAudioMetadata, hash: string, filePath: string): [Song, Buffer | undefined] {
  let tmp = (data.common.picture as unknown) as ExtendedIPicture[]
  let coverPath = tmp ? path.join(path.dirname(filePath), v4() + '.jpg') : undefined
  return [
    {
      title: data.common.title ? data.common.title : path.basename(filePath),
      path: filePath,
      coverPath: coverPath,
      album: data.common.album,
      artists: data.common.artists,
      date: data.common.date,
      year: data.common.year,
      genre: data.common.genre,
      lyrics: data.common.lyrics,
      releaseType: data.common.releasetype,
      bitrate: data.format.bitrate,
      codec: data.format.codec,
      container: data.format.container,
      duration: data.format.duration,
      sampleRate: data.format.sampleRate,
      hash: hash,
    },
    tmp ? tmp[0].data : undefined,
  ]
}

export class MusicScanner {
  private paths: string[]

  constructor(...paths: string[]) {
    this.paths = paths
  }

  public async start(): Promise<void> {
    for (let i in this.paths) {
      fs.readdir(this.paths[i], async (err: NodeJS.ErrnoException | null, files: string[]) => {
        files.forEach(async (file) => {
          if (audioPatterns.exec(path.extname(file)) != null) {
            const filePath = path.join(this.paths[i], file)
            const metadata = await mm.parseFile(filePath)
            const md5Sum = await this.generateChecksum(filePath)
            const parsed = await parseMetadata(metadata, md5Sum, filePath)
            await this.storeSong(parsed, filePath)
          }
        })
      })
    }
  }

  private async generateChecksum(file: string): Promise<string> {
    return md5(file)
  }

  private async storeSong(parsedData: [Song, Buffer | undefined], path: string) {
    const count = await SongDB.countByHash(parsedData[0].hash)
    if (count == 0) {
      await SongDB.store(parsedData[0]).then(async (data) => {
        if (parsedData[1]) {
          if (parsedData[1]) {
            await _arrayBufferToBase64(parsedData[1], data.coverPath!)
          }
        }
      })
    }
  }
}
