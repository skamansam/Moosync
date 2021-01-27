import { VuexModule, Module, Mutation, Action } from 'vuex-class-modules'
import store from '../'

export enum PeerMode {
  WATCHER,
  BROADCASTER,
  UNDEFINED,
}

@Module
class Sync extends VuexModule {
  mode: PeerMode = PeerMode.WATCHER
  roomID: string = ''

  @Mutation
  setMode(mode: PeerMode) {
    this.mode = mode
  }

  @Mutation
  setRoom(id: string) {
    this.roomID = id
  }
}

export const SyncModule = new Sync({ store, name: 'sync' })
