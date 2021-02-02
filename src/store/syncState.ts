import { Song } from '@/models/songs'
import { VuexModule, Module, Mutation, Action } from 'vuex-class-modules'
import store from '.'

export enum PeerMode {
  WATCHER,
  BROADCASTER,
  UNDEFINED,
}

@Module
class Sync extends VuexModule {
  mode: PeerMode = PeerMode.WATCHER
  currentSongDets: Song | null = null
  currentCover: Blob | null = null
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
  setCover(cover: Blob) {
    this.currentCover = cover
  }
}

export const SyncModule = new Sync({ store, name: 'sync' })
