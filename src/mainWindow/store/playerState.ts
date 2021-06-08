import { Song } from '@/models/songs'

import { action, mutation } from 'vuex-class-component'
import { VuexModule } from './module'

export enum AudioType {
  STREAMING,
  LOCAL,
}

export enum PlayerState {
  PLAYING,
  PAUSED,
  STOPPED,
  LOADING,
}

export enum PlayerType {
  LOCAL,
  YOUTUBE,
}

class Queue {
  data: { [id: string]: Song } = {}
  order: string[] = []
  index: number = -1

  get top(): Song | null {
    if (this.index > -1 && this.data) {
      return this.data[this.order[this.index]]
    }
    return null
  }

  private addSong(item: Song) {
    if (!this.data[item._id!]) {
      this.data[item._id!] = item
    }
  }

  public push(item: Song): void {
    this.addSong(item)
    this.order.push(item._id!)
  }

  public pushAtIndex(item: Song): void {
    this.addSong(item)
    this.order.splice(this.index + 1, 0, item._id!)
  }

  public next() {
    if (this.index < this.order.length - 1) this.index += 1
    else this.index = 0
  }

  public prev() {
    if (this.index > 0) this.index -= 1
    else this.index = this.order.length - 1
  }

  public pop(): Song | null {
    if (this.index > 0) {
      const id = this.order.pop()
      return this.data[id!]
    }
    return null
  }

  // https://stackoverflow.com/a/12646864
  private randomizeArray() {
    for (let i: number = this.order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = this.order[i]
      this.order[i] = this.order[j]
      this.order[j] = temp
    }
  }

  public shuffle(): void {
    const currentSong = this.order[this.index]
    this.order.splice(this.index, 1)
    this.randomizeArray()
    this.order.unshift(currentSong)
    this.index = 0
  }
}

export class PlayerStore extends VuexModule.With({ namespaced: 'player' }) {
  public state: PlayerState = PlayerState.PAUSED
  public currentSong: Song | null = null
  private songQueue = new Queue()
  public repeat: boolean = false
  public volume: number = 50

  get playerState() {
    return this.state
  }

  get queue() {
    return this.songQueue
  }

  get Repeat() {
    return this.repeat
  }

  @mutation
  loadInQueue(Song: Song) {
    this.songQueue.push(Song)
  }

  @mutation
  loadInQueueTop(Song: Song) {
    this.songQueue.pushAtIndex(Song)
  }

  @mutation
  shuffle() {
    this.songQueue.shuffle()
  }

  @action async loadSong(song: Song | null) {
    this.currentSong = song
  }

  @action async pushInQueue(Song: Song) {
    this.loadInQueue(Song)
    if (this.currentSong == null) {
      this.nextSong()
    }
  }

  @action async pushInQueueTop(Song: Song) {
    this.loadInQueueTop(Song)
  }

  @action async nextSong() {
    this.songQueue.next()
    this.loadSong(this.songQueue.top)
  }

  @action async prevSong() {
    this.songQueue.prev()
    this.loadSong(this.songQueue.top)
  }
}
