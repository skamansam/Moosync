import fs from 'fs'
import path from 'path'
import * as mm from 'music-metadata'
import { Song, CoverImg } from '@/models/songs'
import { CoverDBInstance, SongDBInstance } from '../db/index'
import md5 from 'md5-file'
import { ExtendedIPicture } from '@/types/declarations/musicmetadata'
import base64js from 'base64-js'

const audioPatterns = new RegExp('.flac|.mp3|.ogg|.m4a|.webm|.wav|.wv', 'i')

function _arrayBufferToBase64(buffer: ArrayBuffer | undefined): string | undefined {
  if (buffer !== undefined) {
    return base64js.fromByteArray(new Uint8Array(buffer))
  }
}

export function parseMetadata(data: mm.IAudioMetadata, hash: string, filePath: string): [Song, CoverImg | undefined] {
  let tmp = (data.common.picture as unknown) as ExtendedIPicture[]
  return [
    {
      title: data.common.title ? data.common.title : path.basename(filePath),
      path: filePath,
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
    tmp.length > 0
      ? {
          data: _arrayBufferToBase64(tmp[0].data),
          description: tmp[0].description,
          mime: tmp[0].format,
          height: tmp[0].height,
          width: tmp[0].width,
          type: tmp[0].type,
        }
      : undefined,
  ]
}

export class MusicScanner {
  private paths: string[]

  constructor(...paths: string[]) {
    this.paths = paths
  }

  public async start(): Promise<void> {
    let dbSong = new SongDBInstance()
    let dbCover = new CoverDBInstance()
    for (let i in this.paths) {
      fs.readdir(this.paths[i], (err: NodeJS.ErrnoException | null, files: string[]) => {
        files.forEach(async (file) => {
          if (audioPatterns.exec(path.extname(file)) != null) {
            const filePath = path.join(this.paths[i], file)
            const metadata = await mm.parseFile(filePath)
            const md5Sum = await this.generateChecksum(filePath)
            const parsed = parseMetadata(metadata, md5Sum, filePath)
            await this.storeSong(parsed, filePath, dbSong, dbCover)
          }
        })
      })
    }
  }

  private async generateChecksum(file: string): Promise<string> {
    return md5(file)
  }

  private async storeSong(
    parsedData: [Song, CoverImg | undefined],
    path: string,
    dbSong: SongDBInstance,
    dbCover: CoverDBInstance
  ) {
    const count = await dbSong.countByHash(parsedData[0].hash)
    if (count == 0) {
      await dbSong.store(parsedData[0]).then(async (data) => {
        if (parsedData[1]) {
          let tmp = parsedData[1]
          tmp._id = data._id
          await dbCover.store(tmp)
        }
      })
    }
  }
}
