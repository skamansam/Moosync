<template>
  <div>
    <div ref="audioHolder">
      <div id="yt-player" class="yt-player"></div>
      <audio ref="audio" style="position: absolute; top: 100px" />
    </div>
  </div>
</template>

<script lang="ts">
import { Song } from '@/models/songs'
import { SyncHolder } from '@/utils/sync/syncHandler'
import { PlayerModule, PlayerState, PlayerType } from '@/mainWindow/store/playerState'
import { PeerMode, SyncModule } from '@/mainWindow/store/syncState'
import { Component, Prop, Ref, Watch } from 'vue-property-decorator'
import YTPlayer from 'yt-player'
import Colors from '@/utils/mixins/Colors'
import { mixins } from 'vue-class-component'

@Component({})
export default class AudioStream extends mixins(Colors) {
  @Ref('audio') audioElement!: ExtendedHtmlAudioElement

  @Prop({ default: '' })
  roomID!: string

  @Prop({ default: 50 })
  volume!: number

  @Prop({ default: 50 })
  forceSeek!: number

  @Prop({ default: PlayerState.STOPPED })
  playerState!: PlayerState

  @Prop({ default: PlayerType.LOCAL })
  playerType!: PlayerType

  @Prop({ default: null })
  currentSong!: Song | null

  @Watch('playerState')
  onPlayerStateChanged(newState: PlayerState) {
    if (this.playerType == PlayerType.LOCAL) this.handleLocalPlayerState(newState).catch((e) => console.log(e))
    else if (this.playerType == PlayerType.YOUTUBE) this.handleYoutubePlayerState(newState)
  }

  @Watch('playerType')
  onPlayerTypeChanged(newType: PlayerType) {
    this.playerType = newType
    if (this.playerType == PlayerType.YOUTUBE) this.handleLocalPlayerState(PlayerState.STOPPED)
    else this.handleYoutubePlayerState(PlayerState.STOPPED)
  }

  @Watch('currentSong')
  onSongChanged(newSong: Song | null) {
    if (newSong) {
      if (this.playerType == PlayerType.LOCAL) this.loadAudio(newSong)
      else if (this.playerType == PlayerType.YOUTUBE) this.loadAudioYoutube(newSong)
    }
  }

  @Watch('volume') onMatchChanged(newValue: number) {
    if (this.playerType == PlayerType.LOCAL) this.audioElement.volume = newValue / 100
    else if (this.playerType == PlayerType.YOUTUBE) this.YTplayer!.setVolume(newValue / 100)
  }

  @Watch('forceSeek') onSeek(newValue: number) {
    if (this.playerType == PlayerType.LOCAL) this.audioElement.currentTime = newValue
    else if (this.playerType == PlayerType.YOUTUBE) this.YTplayer!.seek(newValue)
  }

  private peerHolder = new SyncHolder()
  private isLocalSongLoaded: boolean = false
  private isYoutubeSongLoaded: boolean = false
  private YTplayer: YTPlayer | undefined

  mounted() {
    this.setupYTPlayer()
    this.registerListeners()
  }

  private setupYTPlayer() {
    this.YTplayer = new YTPlayer('#yt-player')
  }

  private registerRoomListeners() {
    this.$root.$on('join-room', (data: string) => this.joinRoom(data))
    this.$root.$on('create-room', () => this.createRoom())
  }

  private registerAudioListeners() {
    this.audioElement.onended = () => PlayerModule.nextSong()
    this.YTplayer!.on('ended', () => PlayerModule.nextSong())
  }

  private registerListeners() {
    this.registerAudioListeners()
    this.registerRoomListeners()
    this.syncListeners()
    this.handleAudioTimeUpdate()
  }

  private unloadAudio() {
    this.audioElement.srcObject = null
    this.isLocalSongLoaded = false
  }

  private loadAudioYoutube(item: Song) {
    this.YTplayer!.load(item.url!)
    this.isYoutubeSongLoaded = true

    PlayerModule.setState(PlayerState.PLAYING)
    this.handleYoutubePlayerState(PlayerState.PLAYING)
  }

  private loadAudio(song: Song) {
    let firstSong: boolean
    firstSong = this.audioElement.src ? true : false

    this.audioElement.src = 'media://' + song.path
    this.isLocalSongLoaded = true

    if (this.peerHolder && this.peerHolder.peerMode == PeerMode.BROADCASTER) {
      let stream = this.audioElement.captureStream()
      stream.onaddtrack = () => {
        this.peerHolder.addStream(stream, song)
      }
    }

    if (firstSong) {
      this.handleLocalPlayerState(PlayerModule.playerState)
    } else {
      PlayerModule.setState(PlayerState.PLAYING)
      this.handleLocalPlayerState(PlayerState.PLAYING)
    }
  }

  private handleAudioTimeUpdate() {
    this.audioElement.ontimeupdate = (e: Event) => {
      this.$emit('onTimeUpdate', (e.currentTarget as HTMLAudioElement).currentTime)
    }

    this.YTplayer!.on('timeupdate', (time: number) => {
      console.log('here')
      if (this.playerType == PlayerType.YOUTUBE) this.$emit('onTimeUpdate', time)
    })
  }

  private async handleLocalPlayerState(newState: PlayerState) {
    if (this.isLocalSongLoaded) {
      switch (newState) {
        case PlayerState.PLAYING:
          return this.audioElement.play()
        case PlayerState.PAUSED:
          return this.audioElement.pause()
        case PlayerState.STOPPED:
          return this.unloadAudio()
      }
    }
  }

  private handleYoutubePlayerState(newState: PlayerState) {
    if (this.isYoutubeSongLoaded) {
      switch (newState) {
        case PlayerState.PLAYING:
          return this.YTplayer!.play()
        case PlayerState.PAUSED:
          return this.YTplayer!.pause()
        case PlayerState.STOPPED:
          return this.YTplayer!.stop()
      }
    }
  }

  private initializeRTC(mode: PeerMode) {
    this.peerHolder.peerMode = mode
    SyncModule.setMode(mode)

    this.peerHolder.onJoinedRoom = (id: string) => {
      SyncModule.setRoom(id)
    }
  }

  private joinRoom(id: string) {
    this.initializeRTC(PeerMode.WATCHER)
    this.peerHolder.joinRoom(id)
  }

  private createRoom() {
    this.initializeRTC(PeerMode.BROADCASTER)
    this.peerHolder.createRoom()
  }

  private async getStream() {
    return new Promise<MediaStream>((resolve) => {
      let stream = this.audioElement.captureStream()
      stream.onaddtrack = () => {
        resolve(stream)
      }
    })
  }

  private syncListeners() {
    this.peerHolder.onRemoteTrackInfo = (event) => {
      SyncModule.setSong(event.message as Song)
    }

    this.peerHolder.onRemoteCover = (event) => {
      SyncModule.setCover(event)
    }

    this.peerHolder.setLocalTrack = () => {
      if (this.peerHolder.peerMode == PeerMode.BROADCASTER) {
        if (this.audioElement.src)
          this.getStream().then((stream) => this.peerHolder.addStream(stream, this.currentSong!))
      }
    }

    this.peerHolder.onRemoteTrack = (event) => {
      this.audioElement.srcObject = event.streams[0]
      this.audioElement.play().catch((e) => console.log(e))
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

<style lang="sass">
.yt-player
  width: 0
</style>
