import { Component, Vue } from 'vue-property-decorator'
import { PlayerState } from '../../mainWindow/store/playerState'

import { Song } from '../../models/songs'
import { PeerMode } from '@/mainWindow/store/syncState'
import { vxm } from '@/mainWindow/store'

@Component
export default class PlayerControls extends Vue {
  get playerState() {
    return vxm.player.playerState
  }

  get isSyncing() {
    return vxm.sync.mode !== PeerMode.UNDEFINED
  }

  public nextSong() {
    if (this.isSyncing) vxm.sync.setQueueIndex(vxm.sync.queueIndex + 1)
    else vxm.player.nextSong()
  }

  public prevSong() {
    if (this.isSyncing) vxm.sync.setQueueIndex(vxm.sync.queueIndex - 1)
    else vxm.player.prevSong()
  }

  public queueSong(...songs: Song[]) {
    for (const s of songs) {
      if (this.isSyncing) vxm.sync.addToLocalQueue(s)
      else vxm.player.pushInQueue(s)
    }
  }

  public playTop(...songs: Song[]) {
    for (const s of songs) {
      if (this.isSyncing) vxm.sync.addToLocalQueue(s)
      else vxm.player.loadInQueueTop(s)
    }
    this.nextSong()
  }

  public play() {
    vxm.player.state = PlayerState.PLAYING
  }

  public pause() {
    vxm.player.state = PlayerState.PAUSED
  }

  public shuffle() {
    vxm.player.shuffle()
  }

  public togglePlayerState() {
    if (this.playerState == PlayerState.PAUSED || this.playerState == PlayerState.STOPPED) {
      vxm.player.state = PlayerState.PLAYING
    } else {
      vxm.player.state = PlayerState.PAUSED
    }
  }

  public stop() {
    vxm.player.state = PlayerState.STOPPED
  }
}
