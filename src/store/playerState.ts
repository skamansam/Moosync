import { VuexModule, Module, Mutation, Action } from 'vuex-class-modules'
import store from '.'
import { CoverImg, Song } from '@/models/songs'
import { ipcRenderer } from 'electron'
import { IpcRendererHolder } from '../services/ipc/renderer/index'
import { IpcEvents } from '@/services/ipc/main/constants'

export enum AudioType {
  STREAMING,
  LOCAL,
}

export enum PlayerState {
  PLAYING,
  PAUSED,
  STOPPED,
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

  public push(item: Song): void {
    if (!this.data[item._id!]) {
      this.order.push(item._id!)
      this.data[item._id!] = item
      return
    }
    this.order.push(item._id!)
  }

  public next() {
    if (this.index < this.order.length - 1) this.index += 1
    else this.index = 0
  }

  public prev() {
    if (this.index >= 0) this.index -= 1
    else this.index = this.order.length - 1
  }

  public pop(): Song | null {
    if (this.index > 0) {
      let id = this.order.pop()
      let elem = this.data[id!]
      delete this.data[id!]
      this.prev()
      return elem
    }
    return null
  }
}

@Module
class Player extends VuexModule {
  private state: PlayerState = PlayerState.PAUSED
  private currentSongDets: Song | null = null
  private currentSongCover: CoverImg | null = null
  private ipcHolder = new IpcRendererHolder(ipcRenderer)
  private songQueue = new Queue()

  get playerState() {
    return this.state
  }

  get currentSong() {
    return this.currentSongDets
  }

  get currentCover() {
    return this.currentSongCover
  }

  get queue() {
    return this.songQueue
  }

  @Mutation
  setState(state: PlayerState) {
    this.state = state
  }

  @Mutation
  setCover(id: string) {
    this.ipcHolder
      .send<CoverImg>(IpcEvents.GET_COVER, { params: id })
      .then((data) => {
        this.currentSongCover = data
      })
  }

  @Mutation
  setSong(song: Song | null) {
    this.currentSongDets = song
  }

  @Mutation
  loadInQueue(Song: Song) {
    this.songQueue.push(Song)
  }

  @Action
  pushInQueue(Song: Song) {
    this.loadInQueue(Song)
    if (this.currentSongDets == null) {
      this.nextSong()
    }
  }

  @Action
  nextSong() {
    this.songQueue.next()
    this.setSong(this.songQueue.top)
    if (this.currentSongDets) {
      this.setCover(this.currentSongDets._id!)
    }
  }
  @Action
  prevSong() {
    this.songQueue.prev()
    this.setSong(this.songQueue.top)
    if (this.currentSongDets) {
      this.setCover(this.currentSongDets._id!)
    }
  }
}

export const PlayerModule = new Player({ store, name: 'player' })
