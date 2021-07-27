import { extensionRequests } from "../constants"
import { v4 } from 'uuid';

export class ExtensionRequestGenerator {
  private packageName: string

  constructor(packageName: string) {
    this.packageName = packageName
  }

  public async getAllSongs() {
    return this.sendAsync<Song[]>('get-all-songs')
  }

  public async getCurrentSong() {
    return this.sendAsync<Song>('get-current-song')
  }

  public async getVolume() {
    return this.sendAsync<number>('get-volume')
  }

  public async getTime() {
    return this.sendAsync<number>('get-time')
  }

  public async getQueue() {
    return this.sendAsync<SongQueue>('get-queue')
  }

  private sendAsync<T>(type: extensionRequests): Promise<T | undefined> {
    const channel = v4()
    return new Promise(resolve => {
      if (process.send) {
        let listener: (data: extensionReplyMessage) => void
        process.on('message', listener = function (data: extensionReplyMessage) {
          if (data.channel === channel) {
            process.off('message', listener)
            resolve(data.data)
          }
        })
        process.send({ type, channel } as mainHostMessage)
        return
      }
      resolve(undefined)
    })
  }
}