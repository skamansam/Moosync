import { Component, Vue } from 'vue-property-decorator'

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
    else vxm.player.nextSong().catch((err) => console.error(err))
  }

  public prevSong() {
    if (this.isSyncing) vxm.sync.setQueueIndex(vxm.sync.queueIndex - 1)
    else vxm.player.prevSong().catch((err) => console.error(err))
  }

  public async queueSong(songs: Song[]) {
    if (this.isSyncing) await vxm.sync.addToLocalQueue(songs).catch((err) => console.error(err))
    else await vxm.player.pushInQueue(songs).catch((err) => console.error(err))
  }

  public async playTop(songs: Song[]) {
    if (this.isSyncing) await vxm.sync.addToLocalQueue(songs)
    else {
      await vxm.player.pushInQueueTop(songs)
    }

    if (!this.isSyncing) this.play()
  }

  public play() {
    vxm.player.playerState = 'PLAYING'
  }

  public pause() {
    vxm.player.playerState = 'PAUSED'
  }

  public shuffle() {
    vxm.player.shuffle()
  }

  public togglePlayerState() {
    if (this.playerState == 'PAUSED' || this.playerState == 'STOPPED') {
      vxm.player.playerState = 'PLAYING'
    } else {
      vxm.player.playerState = 'PAUSED'
    }
  }

  public stop() {
    vxm.player.playerState = 'STOPPED'
  }

  public playFromQueue(index: number) {
    vxm.player.playQueueSong(index).catch((err) => console.error(err))
  }

  public removeFromQueue(index: number) {
    vxm.player.pop(index)
  }
}
