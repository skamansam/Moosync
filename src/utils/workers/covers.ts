import Jimp from 'jimp'
import { expose } from 'threads'
import * as mm from 'music-metadata'

expose({
  async writeCover(songPath: string, coverPath: string) {
    await writeBuffer(songPath, coverPath)
  },
})

async function getCover(filePath: string): Promise<Buffer | undefined> {
  const data = await mm.parseFile(filePath)
  if (data.common.picture) {
    return data.common.picture[0].data
  }
}

async function writeBuffer(songPath: string, coverPath: string) {
  const buffer = await getCover(songPath)
  if (buffer) return (await Jimp.read(buffer)).cover(800, 800).quality(80).writeAsync(coverPath)
}
