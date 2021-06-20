import { Song } from '@/utils/models/songs'
import { vxm } from '@/mainWindow/store';
import { prefetchData } from '@/utils/ui/sync/syncHandler'
import { mutation, action } from 'vuex-class-component';
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
      const item = this.prefetch[index]
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

  @action
  async addToLocalQueue(song: Song) {
    const ytItem = await vxm.providers.spotifyProvider.spotifyToYoutube(song)
    if (ytItem) {
      song.url = ytItem._id
      song.duration = ytItem.duration
    } else {
      throw new Error('Could not convert song')
    }
    this.localQueue.push(song)
  }
}
