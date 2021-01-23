import fs from 'fs'
import path from 'path'
import * as mm from 'music-metadata'
import { Song, miniSong } from '@/models/songs'
import { MiniSongDbInstance, SongDBInstance } from '../db/index'
import md5 from 'md5-file'
import { ExtendedIPicture } from '@/types/declarations/musicmetadata'
import base64js from 'base64-js'

const audioPatterns = new RegExp('.flac|.mp3|.ogg|.m4a|.webm|.wav|.wv', 'i')

function _arrayBufferToBase64(buffer: ArrayBuffer | undefined): string | undefined {
  if (buffer !== undefined) {
    return base64js.fromByteArray(new Uint8Array(buffer))
  }
}

export function parseMetadata(data: mm.IAudioMetadata, hash: string): [Song, miniSong] {
  let coverDetails: ExtendedIPicture[] | undefined = (data.common.picture as unknown) as ExtendedIPicture[]
  return [
    {
      title: data.common.title,
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
      cover:
        data.common.picture !== undefined && data.common.picture.length > 0
          ? {
              data: _arrayBufferToBase64(coverDetails[0].data),
              description: coverDetails[0].description,
              mime: coverDetails[0].format,
              height: coverDetails[0].height,
              width: coverDetails[0].width,
              type: coverDetails[0].type,
            }
          : undefined,
    },
    {
      title: data.common.title,
      album: data.common.album,
      artists: data.common.artists,
    },
  ]
}

export class MusicScanner {
  private paths: string[]

  constructor(...paths: string[]) {
    this.paths = paths
  }

  public async start(): Promise<void> {
    let dbSong = new SongDBInstance()
    let dbMini = new MiniSongDbInstance()
    for (let i in this.paths) {
      fs.readdir(this.paths[i], (err: NodeJS.ErrnoException | null, files: string[]) => {
        files.forEach(async (file) => {
          if (audioPatterns.exec(path.extname(file)) != null) {
            const metadata = await mm.parseFile(path.join(this.paths[i], file))
            const md5Sum = await this.generateChecksum(path.join(this.paths[i], file))
            const parsed = parseMetadata(metadata, md5Sum)
            await this.storeSong(parsed, dbSong, dbMini)
          }
        })
      })
    }
  }

  private async generateChecksum(file: string): Promise<string> {
    return md5(file)
  }

  private async storeSong(parsedData: [Song, miniSong], dbSong: SongDBInstance, dbMini: MiniSongDbInstance) {
    const count = await dbSong.countByHash(parsedData[0].hash)
    if (count == 0) {
      await dbSong.store(parsedData[0]).then(async (data) => {
        let tmp = parsedData[1]
        tmp._id = data._id
        await dbMini.store(tmp)
      })
    }
    console.log('not added')
  }
}
