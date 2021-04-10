import { Component, Vue } from 'vue-property-decorator'
import { PlayerModule, PlayerState } from '../../mainWindow/store/playerState'

import { Song } from '../../models/songs'
import { PeerMode, SyncModule } from '@/mainWindow/store/syncState'

@Component
export default class PlayerControls extends Vue {
  get playerState() {
    return PlayerModule.playerState
  }

  get isSyncing() {
    return SyncModule.mode !== PeerMode.UNDEFINED
  }

  public nextSong() {
    if (this.isSyncing) SyncModule.setQueueIndex(SyncModule.queueIndex + 1)
    else PlayerModule.nextSong()
  }

  public prevSong() {
    if (this.isSyncing) SyncModule.setQueueIndex(SyncModule.queueIndex - 1)
    else PlayerModule.prevSong()
  }

  public queueSong(...songs: Song[]) {
    for (const s of songs) {
      if (this.isSyncing) SyncModule.addToLocalQueue(s)
      else PlayerModule.pushInQueue(s)
    }
  }

  public playTop(...songs: Song[]) {
    for (const s of songs) {
      if (this.isSyncing) SyncModule.addToLocalQueue(s)
      else PlayerModule.loadInQueueTop(s)
    }

    if (this.isSyncing) PlayerModule.nextSong()
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
