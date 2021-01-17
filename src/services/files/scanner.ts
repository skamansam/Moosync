import fs from 'fs'
import path from 'path'
import * as mm from 'music-metadata'
import { Song } from '@/services/files/info'
import { parseMetadata } from './info'
import { SongDBInstance } from '../db/index'
import md5 from 'md5-file'

const audioPatterns = new RegExp('.flac|.mp3|.ogg|.m4a|.webm|.wav|.wv', 'i')

export class MusicScanner {
  private paths: string[]

  constructor(...paths: string[]) {
    this.paths = paths
  }

  public async start(): Promise<void> {
    let db = new SongDBInstance()
    for (let i in this.paths) {
      fs.readdir(this.paths[i], (err: NodeJS.ErrnoException | null, files: string[]) => {
        files.forEach(async (file) => {
          if (audioPatterns.exec(path.extname(file)) != null) {
            const metadata = await mm.parseFile(path.join(this.paths[i], file))
            const md5Sum = await this.generateChecksum(path.join(this.paths[i], file))
            const parsed = parseMetadata(metadata, md5Sum)
            await this.store(parsed, db)
          }
        })
      })
    }
  }

  private async generateChecksum(file: string): Promise<string> {
    return md5(file)
  }

  private async store(parsedData: Song, dbInstance: SongDBInstance) {
    const count = await dbInstance.countByHash(parsedData.hash)
    if (count == 0) {
      let tmp = await dbInstance.store(parsedData)
    }
    console.log('not added')
  }
}
