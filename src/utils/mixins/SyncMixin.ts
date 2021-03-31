import { bus } from '@/mainWindow/main'
import { PlayerModule, PlayerState } from '@/mainWindow/store/playerState'
import { PeerMode, SyncModule } from '@/mainWindow/store/syncState'
import { Song } from '@/models/songs'
import { Component, Vue } from 'vue-property-decorator'
import { SyncHolder } from '../sync/syncHandler'

@Component
export default class SyncMixin extends Vue {
  private isFetching: boolean = false
  private peerHolder = new SyncHolder()
  private isRemoteStateChange: boolean = false
  public setSongSrcCallback!: (src: string) => void

  created() {
    this.peerHolder.start()
  }

  mounted() {
    this.syncListeners()
  }

  get isWatching() {
    return SyncModule.mode == PeerMode.WATCHER
  }

  get isSyncing() {
    return SyncModule.mode != PeerMode.UNDEFINED
  }

  private async setRemoteTrackInfo(event: Song) {
    if (this.peerHolder.peerMode == PeerMode.WATCHER) {
      SyncModule.setSong(event)
      const isExists = await window.FileUtils.isFileExists(event._id!)
      if (isExists) {
        this.peerHolder.emitReady()
        this.setSongSrcCallback('media://' + isExists)
      } else SyncModule.prioritize(SyncModule.prefetch.findIndex((x) => x._id === event._id))
    }
  }

  private setRemoteCover(event: Blob) {
    if (this.peerHolder.peerMode == PeerMode.WATCHER) SyncModule.setCover(event)
  }

  private async getLocalCover() {
    const currentSong = PlayerModule.currentSong
    if (currentSong && currentSong.album && currentSong.album.album_coverPath) {
      const resp = await fetch('media://' + currentSong.album.album_coverPath)
      let buf = await resp.arrayBuffer()
      return buf
    }
  }

  private saveRemoteStream(event: Blob) {
    let reader = new FileReader()
    reader.onload = async () => {
      if (reader.readyState == 2) {
        const buffer = Buffer.from(reader.result as ArrayBuffer)
        const filePath = await window.FileUtils.saveAudioTOFile(SyncModule.currentFetchSong, buffer)
        if (SyncModule.currentSongDets!._id == SyncModule.currentFetchSong) {
          this.peerHolder.emitReady()
          if (this.setSongSrcCallback) this.setSongSrcCallback('media://' + filePath)
        }
        this.fetchRemoteSong()
      }
    }
    reader.readAsArrayBuffer(event)
  }

  private async getLocalSong(songID: string) {
    if (PlayerModule.queue.data[songID].path) {
      const resp = await fetch('media://' + PlayerModule.queue.data[songID].path!)
      let buf = await resp.arrayBuffer()
      return buf
    }
    return null
  }

  private async handleRemotePlayerState(state: PlayerState) {
    this.isRemoteStateChange = true
    PlayerModule.setState(state)
  }

  private addToPrefetchQueue(song: Song) {
    if (this.peerHolder.peerMode == PeerMode.BROADCASTER) this.peerHolder.addToQueue(song)
  }

  private beginFetching() {
    if (!this.isFetching) this.fetchRemoteSong()
  }

  private syncListeners() {
    this.peerHolder.onRemoteTrackInfo = this.setRemoteTrackInfo
    this.peerHolder.onRemoteCover = this.setRemoteCover
    this.peerHolder.fetchCover = this.getLocalCover
    this.peerHolder.onRemoteStream = this.saveRemoteStream
    this.peerHolder.onPrefetchAdded = SyncModule.addToPrefetch
    this.peerHolder.onPrefetchSet = SyncModule.setPrefetch
    this.peerHolder.fetchSong = this.getLocalSong
    this.peerHolder.playerStateHandler = this.handleRemotePlayerState
    // TODO: Handle this event somewhere
    this.peerHolder.peerConnectionStateHandler = (id, state) => bus.$emit('onPeerConnectionStateChange', id, state)

    SyncModule.$watch((syncModule) => syncModule.prefetch, this.beginFetching)

    bus.$on('queuedSong', this.addToPrefetchQueue)
  }

  private async fetchRemoteSong() {
    this.isFetching = true
    for (const prefetch of SyncModule.prefetch) {
      const isExists = await window.FileUtils.isFileExists(prefetch._id!)
      if (!isExists) {
        SyncModule.setCurrentFetchSong(prefetch._id)
        this.peerHolder.requestSong(prefetch.sender, prefetch._id!)
        return
      }
    }
    this.isFetching = false
  }

  protected handleBroadcasterAudioLoad(song: Song): boolean {
    if (this.peerHolder.peerMode == PeerMode.BROADCASTER) {
      PlayerModule.setState(PlayerState.PAUSED)
      this.peerHolder.PlaySong(song)
      return true
    }
    return false
  }

  private initializeRTC(mode: PeerMode) {
    this.peerHolder.peerMode = mode
    SyncModule.setMode(mode)

    this.peerHolder.onJoinedRoom = (id: string) => {
      SyncModule.setRoom(id)
    }
  }

  protected joinRoom(id: string) {
    console.log('joining')
    this.initializeRTC(PeerMode.WATCHER)
    this.peerHolder.joinRoom(id)
  }

  protected createRoom() {
    this.initializeRTC(PeerMode.BROADCASTER)
    this.peerHolder.createRoom()
  }

  protected emitPlayerState(newState: PlayerState) {
    if (this.isSyncing && !this.isRemoteStateChange) {
      this.peerHolder.emitPlayerState(newState)
    }
    this.isRemoteStateChange = false
  }
}
