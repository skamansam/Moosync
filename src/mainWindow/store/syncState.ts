import { Module, Mutation, VuexModule } from 'vuex-class-modules'

import { Song } from '@/models/songs'
import store from '@/commonStore'
import { prefetchData } from '@/utils/sync/syncHandler'

export enum PeerMode {
  WATCHER,
  BROADCASTER,
  UNDEFINED,
}

@Module
class Sync extends VuexModule {
  mode: PeerMode = PeerMode.UNDEFINED
  currentSongDets: Song | null = null
  currentCover: Blob | null = null
  prefetch: prefetchData[] = []
  currentFetchSong: string = ''
  roomID: string = ''

  @Mutation
  setMode(mode: PeerMode) {
    this.mode = mode
  }

  @Mutation
  setRoom(id: string) {
    this.roomID = id
  }

  @Mutation
  setSong(song: Song) {
    this.currentSongDets = song
  }

  @Mutation
  addToPrefetch(prefetch: prefetchData) {
    this.prefetch.push(prefetch)
  }

  @Mutation
  setPrefetch(prefetch: prefetchData[]) {
    this.prefetch = prefetch
  }

  @Mutation
  prioritize(index: number) {
    if (index < this.prefetch.length) {
      let item = this.prefetch[index]
      this.prefetch.splice(index, 1)
      this.prefetch.unshift(item)
    }
  }

  @Mutation
  setCover(cover: Blob) {
    this.currentCover = cover
  }

  @Mutation
  setCurrentFetchSong(id: string) {
    this.currentFetchSong = id
  }
}

export const SyncModule = new Sync({ store, name: 'sync' })
