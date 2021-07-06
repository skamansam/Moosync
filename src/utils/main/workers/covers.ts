import * as mm from 'music-metadata'

import Jimp from 'jimp'
import { expose } from 'threads'

expose({
  async writeCover(songPath: string, coverPath: string) {
    return writeBuffer(songPath, coverPath)
  },
})

async function getCover(filePath: string | undefined): Promise<Buffer | undefined> {
  if (filePath) {
    const data = await mm.parseFile(filePath)
    if (data.common.picture) {
      return data.common.picture[0].data
    }
  }
}

async function writeBuffer(songPath: string, coverPath: string) {
  const buffer = await getCover(songPath)
  if (buffer) {
    (await Jimp.read(buffer)).cover(800, 800).quality(80).writeAsync(coverPath)
    return coverPath
  }
}
