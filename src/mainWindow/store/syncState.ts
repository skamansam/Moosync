import { Song } from '@/models/songs'
import { prefetchData } from '@/utils/sync/syncHandler'
import { mutation } from 'vuex-class-component'
import { VuexModule } from './module'

export enum PeerMode {
  WATCHER,
  BROADCASTER,
  UNDEFINED,
}
export class SyncStore extends VuexModule.With({ namespaced: 'sync' }) {
  mode: PeerMode = PeerMode.UNDEFINED
  currentSongDets: Song | null = null
  currentCover: string = ''
  prefetch: prefetchData[] = []
  currentFetchSong: string = ''
  roomID: string = ''
  isReadyRequested: boolean = false
  queueOrder: string[] = []
  queueIndex: number = 0
  localQueue: Song[] = []

  @mutation
  setMode(mode: PeerMode) {
    this.mode = mode
  }

  @mutation
  setRoom(id: string) {
    this.roomID = id
  }

  @mutation
  setSong(song: Song | null) {
    this.currentSongDets = song
  }

  @mutation
  addToPrefetch(prefetch: prefetchData) {
    this.prefetch.push(prefetch)
  }

  @mutation
  setPrefetch(prefetch: prefetchData[]) {
    this.prefetch = prefetch
  }

  @mutation
  prioritize(index: number) {
    if (index < this.prefetch.length) {
      let item = this.prefetch[index]
      this.prefetch.splice(index, 1)
      this.prefetch.unshift(item)
    }
  }

  @mutation
  setCover(cover: string) {
    this.currentCover = cover
  }

  @mutation
  setReadyRequested(value: boolean) {
    this.isReadyRequested = value
  }

  @mutation
  setCurrentFetchSong(id: string) {
    this.currentFetchSong = id
  }

  @mutation
  addQueueItem(value: string) {
    this.queueOrder.push(value)
  }

  @mutation
  setQueueItem(value: string[]) {
    this.queueOrder = value
  }

  @mutation
  setQueueIndex(value: number) {
    if (this.queueIndex < 0) this.queueIndex = this.queueOrder.length - 1
    else this.queueIndex = value
  }

  @mutation
  addToLocalQueue(value: Song) {
    this.localQueue.push(value)
  }
}
