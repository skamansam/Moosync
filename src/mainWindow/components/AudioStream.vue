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

  private isFirst: boolean = true

  get SongRepeat() {
    return PlayerModule.Repeat
  }

  get isSyncing() {
    return SyncModule.mode == PeerMode.WATCHER
  }

  @Watch('playerState')
  onPlayerStateChanged(newState: PlayerState) {
    if (this.playerType == PlayerType.LOCAL || this.isSyncing)
      this.handleLocalPlayerState(newState).catch((e) => console.log(e))
    else if (this.playerType == PlayerType.YOUTUBE) this.handleYoutubePlayerState(newState)
  }

  @Watch('playerType')
  onPlayerTypeChanged(newType: PlayerType) {
    if (!this.isSyncing) {
      if (newType == PlayerType.YOUTUBE) this.handleLocalPlayerState(PlayerState.STOPPED)
      else this.handleYoutubePlayerState(PlayerState.STOPPED)
    }
  }

  @Watch('currentSong')
  onSongChanged(newSong: Song | null) {
    if (newSong && !this.isSyncing) {
      if (this.playerType == PlayerType.LOCAL) this.loadAudio(newSong)
      else if (this.playerType == PlayerType.YOUTUBE) this.loadAudioYoutube(newSong)
    }
  }

  @Watch('volume') onVolumeChanged(newValue: number) {
    if (this.playerType == PlayerType.LOCAL) this.audioElement.volume = newValue / 100
    else if (this.playerType == PlayerType.YOUTUBE) this.YTplayer!.setVolume(newValue)
  }

  @Watch('forceSeek') onSeek(newValue: number) {
    if (this.playerType == PlayerType.LOCAL) this.audioElement.currentTime = newValue
    else if (this.playerType == PlayerType.YOUTUBE) this.YTplayer!.seek(newValue)
  }

  private peerHolder = new SyncHolder()
  private isLocalSongLoaded: boolean = false
  private isYoutubeSongLoaded: boolean = false
  private YTplayer: YTPlayer | undefined

  created() {
    this.peerHolder.start()
  }

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

  private onSongEnded() {
    this.SongRepeat
      ? () => {
          this.onSeek(0)
          this.onPlayerStateChanged(PlayerState.PLAYING)
        }
      : PlayerModule.nextSong()
  }

  private registerAudioListeners() {
    this.audioElement.onended = () => this.onSongEnded()
    this.YTplayer!.on('ended', () => this.onSongEnded())
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
    this.YTplayer!.setVolume(this.volume)

    if (this.isFirst) {
      PlayerModule.setState(PlayerState.PLAYING)
      this.handleYoutubePlayerState(PlayerState.PLAYING)
      this.isFirst = false
    } else {
      this.handleYoutubePlayerState(PlayerModule.playerState)
    }
  }

  private loadAudio(song: Song) {
    this.audioElement.src = 'media://' + song.path
    this.isLocalSongLoaded = true

    if (this.peerHolder && this.peerHolder.peerMode == PeerMode.BROADCASTER) {
      this.getStream().then((buf) => this.peerHolder.addStream(buf, song))
    }

    if (this.isFirst) {
      PlayerModule.setState(PlayerState.PLAYING)
      this.handleLocalPlayerState(PlayerState.PLAYING)
      this.isFirst = false
    } else {
      this.handleLocalPlayerState(PlayerModule.playerState)
    }
  }

  private handleAudioTimeUpdate() {
    this.audioElement.ontimeupdate = (e: Event) => {
      this.$emit('onTimeUpdate', (e.currentTarget as HTMLAudioElement).currentTime)
    }

    this.YTplayer!.on('timeupdate', (time: number) => {
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
          this.isLocalSongLoaded = false
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
          this.isYoutubeSongLoaded = false
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
    return new Promise<ArrayBuffer>((resolve) => {
      fetch(this.audioElement.src)
        .then((data) => data.arrayBuffer())
        .then((buf) => resolve(buf))
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
        if (this.audioElement.src) {
          console.log('set local track')
          this.getStream().then((stream) => this.peerHolder.addStream(stream, this.currentSong!))
        }
      }
    }

    this.peerHolder.onRemoteTrack = (event) => {
      console.log('got Stream')
      this.audioElement.srcObject = event.streams[0]
      this.audioElement.play().catch((e) => console.log(e))
    }

    this.peerHolder.fetchCover = () => {
      return new Promise<ArrayBuffer | null>((resolve) => {
        if (this.currentSong && this.currentSong.album && this.currentSong.album.album_coverPath) {
          fetch('media://' + this.currentSong.album.album_coverPath)
            .then((resp) => resp.arrayBuffer())
            .then((buf) => resolve(buf))
        } else {
          resolve(null)
        }
      })
    }

    this.peerHolder.onRemoteStream = (event) => {
      console.log('got stream from datachannel', event.size)
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
