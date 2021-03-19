import { Module, Mutation, VuexModule } from 'vuex-class-modules'

import { Song } from '@/models/songs'
import store from '@/commonStore'

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
  prefetch: { [key: string]: Song[] } = {}
  prefetchChange: boolean = false
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
  addToPrefetch(arg: { id: string; song: Song }) {
    this.prefetch[arg.id] ? this.prefetch[arg.id].push(arg.song) : (this.prefetch[arg.id] = [arg.song])
  }

  @Mutation
  setPrefetch(prefetch: { [key: string]: Song[] }) {
    this.prefetch = prefetch
  }

  @Mutation
  setPrefetchChange() {
    this.prefetchChange = !this.prefetchChange
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
