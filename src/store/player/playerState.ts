import { VuexModule, Module, Mutation, Action } from 'vuex-class-modules'
import store from '../'
import { Song } from '@/models/songs'

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
  state: PlayerState = PlayerState.PAUSED
  currentSongDets: Song | {} = {}

  get currentState() {
    return this.state
  }

  get currentSong() {
    return this.currentSongDets
  }

  @Mutation
  setState(state: PlayerState) {
    this.state = state
  }

  @Mutation
  setSong(Song: Song) {
    this.currentSongDets = Song
  }
}

export const PlayerModule = new Player({ store, name: 'player' })
