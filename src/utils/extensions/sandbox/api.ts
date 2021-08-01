import { extensionAPI } from "@moosync/moosync-types";
import { extensionRequests } from "../constants";
import { v4 } from 'uuid';

export class ExtensionRequestGenerator implements extensionAPI {
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

  public async getPlayerState() {
    return this.sendAsync<PlayerState>('get-player-state')
  }

  public async getPreferences(key?: string, defaultValue?: any) {
    return this.sendAsync<SongQueue>('get-preferences', { packageName: this.packageName, key, defaultValue })
  }

  public async setPreferences(key: string, value: any) {
    return this.sendAsync<void>('set-preferences', { packageName: this.packageName, key, value })
  }

  private sendAsync<T>(type: extensionRequests, data?: any): Promise<T | undefined> {
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
        process.send({ type, channel, data } as extensionRequestMessage)
        return
      }
      resolve(undefined)
    })
  }
}