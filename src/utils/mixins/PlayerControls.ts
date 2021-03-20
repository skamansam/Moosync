import { bus } from '@/mainWindow/main'
import { Component, Vue } from 'vue-property-decorator'
import { PlayerModule, PlayerState } from '../../mainWindow/store/playerState'

import { Song } from '../../models/songs'

@Component
export default class PlayerControls extends Vue {
  get playerState() {
    return PlayerModule.playerState
  }

  public nextSong() {
    PlayerModule.nextSong()
  }

  public prevSong() {
    PlayerModule.prevSong()
  }

  public queueSong(...songs: Song[]) {
    for (const s of songs) {
      PlayerModule.pushInQueue(s)
      bus.$emit('queuedSong', s)
    }
  }

  public playTop(...songs: Song[]) {
    for (const s of songs) {
      PlayerModule.loadInQueueTop(s)
      bus.$emit('queuedSong', s)
    }

    PlayerModule.nextSong()
  }

  public play() {
    PlayerModule.setState(PlayerState.PLAYING)
  }

  public pause() {
    PlayerModule.setState(PlayerState.PAUSED)
  }

  public shuffle() {
    PlayerModule.shuffle()
  }

  public togglePlayerState() {
    if (this.playerState == PlayerState.PAUSED || this.playerState == PlayerState.STOPPED) {
      PlayerModule.setState(PlayerState.PLAYING)
    } else {
      PlayerModule.setState(PlayerState.PAUSED)
    }
  }

  public stop() {
    PlayerModule.setState(PlayerState.STOPPED)
  }
}
