import { VuexModule, Module, Mutation, Action } from 'vuex-class-modules'
import store from '../'

export enum AudioType {
  STREAMING,
  LOCAL,
}

export enum PlayerState {
  PLAYING,
  PAUSED,
  STOPPED,
}

@Module
class Player extends VuexModule {
  state: PlayerState = PlayerState.STOPPED
  currentSongID: string = ''

  get currentState() {
    return this.state
  }

  get currentSong() {
    return this.currentSongID
  }

  @Mutation
  setState(state: PlayerState) {
    this.state = state
  }

  @Mutation
  setSong(SongID: string) {
    this.currentSongID = SongID
  }
}

export const PlayerModule = new Player({ store, name: 'player' })
