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

  public queueSong(...songs: Song[]) {
    for (const s of songs) {
      if (this.isSyncing) vxm.sync.addToLocalQueue(s).catch((err) => console.error(err))
      else vxm.player.pushInQueue(s).catch((err) => console.error(err))
    }
  }

  public async playTop(...songs: Song[]) {
    for (const s of songs) {
      if (this.isSyncing) await vxm.sync.addToLocalQueue(s)
      else await vxm.player.pushInQueueTop(s)
    }

    this.nextSong()

    if (!this.isSyncing) this.play()
  }

  public play() {
    vxm.player.state = 'PLAYING'
  }

  public pause() {
    vxm.player.state = 'PAUSED'
  }

  public shuffle() {
    vxm.player.shuffle()
  }

  public togglePlayerState() {
    if (this.playerState == 'PAUSED' || this.playerState == 'STOPPED') {
      vxm.player.state = 'PLAYING'
    } else {
      vxm.player.state = 'PAUSED'
    }
  }

  public stop() {
    vxm.player.state = 'STOPPED'
  }

  public playFromQueue(index: number) {
    vxm.player.playQueueSong(index).catch((err) => console.error(err))
  }

  public removeFromQueue(index: number) {
    vxm.player.pop(index)
  }
}
