import { VuexModule, Module, Mutation } from 'vuex-class-modules'
import store from '../'
import { CoverImg, Song } from '@/models/songs'

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
  data: Song[] = []

  get top(): Song | null {
    return this.data.length > 0 ? this.data[this.data.length - 1] : null
  }

  public push(item: Song): void {
    this.data.push(item)
  }
}

@Module
class Player extends VuexModule {
  state: PlayerState = PlayerState.PAUSED
  currentSongDets: Song | null = null
  currentSongCover: CoverImg | null = null
  songQueue = new Queue()

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

  @Mutation
  setCover(Cover: CoverImg) {
    this.currentSongCover = Cover
  }

  @Mutation
  pushInQueue(Song: Song) {
    this.songQueue.push(Song)
  }
}

export const PlayerModule = new Player({ store, name: 'player' })
