import { TransferDescriptor, expose } from 'threads';

import Jimp from 'jimp'

expose({
  async writeCover(buffer: TransferDescriptor<Buffer>, coverPath: string) {
    return writeBuffer(buffer, coverPath)
  },
})

async function writeBuffer(bufferDesc: TransferDescriptor<Buffer>, coverPath: string) {
  try {
    await (await Jimp.read(Buffer.from(bufferDesc.send))).cover(800, 800).quality(80).writeAsync(coverPath)
    return coverPath
  } catch (e) {
    console.error(e)
  }
}
