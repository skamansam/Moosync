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
import { SyncHolder } from '@/services/sync/syncHandler'
import { PlayerModule, PlayerState } from '@/store/playerState'
import { PeerMode, SyncModule } from '@/store/syncState'
import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator'
import YTPlayer from 'yt-player'

@Component({})
export default class AudioStream extends Vue {
  private currentTime: number = 0

  @Ref('audio') audioElement!: ExtendedHtmlAudioElement

  @Prop({ default: '' })
  roomID!: string

  @Prop({ default: PlayerState.STOPPED })
  playerState!: PlayerState

  @Prop({ default: null })
  currentSong!: Song | null

  @Watch('playerState')
  onPlayerStateChanged(newState: PlayerState) {
    this.handlePlayerState(newState).catch((e) => console.log(e))
  }

  @Watch('currentSong')
  onSongChanged(newSong: Song | null) {
    if (newSong) this.loadAudio(newSong)
  }

  private peerHolder = new SyncHolder()
  private isSongLoaded: boolean = false
  private YTplayer: YTPlayer | undefined

  mounted() {
    this.registerListeners()
    this.setupYTPlayer()
  }

  private setupYTPlayer() {
    this.YTplayer = new YTPlayer('#yt-player')
  }

  private registerRoomListeners() {
    this.$root.$on('join-room', (data: string) => this.joinRoom(data))
    this.$root.$on('create-room', () => this.createRoom())
  }

  private registerAudioListeners() {
    this.audioElement.ontimeupdate = () => (this.currentTime = this.audioElement.currentTime)
    this.audioElement.onended = () => PlayerModule.nextSong()
  }

  private registerListeners() {
    this.registerAudioListeners()
    this.registerRoomListeners()
    this.syncListeners()
    this.handleAudioTimeUpdate()
  }

  private unloadAudio() {
    this.audioElement.srcObject = null
    this.isSongLoaded = false
  }

  private loadAudio(song: Song) {
    this.audioElement.src = 'media://' + song.path
    this.isSongLoaded = true

    if (this.peerHolder && this.peerHolder.peerMode == PeerMode.BROADCASTER) {
      let stream = this.audioElement.captureStream()
      stream.onaddtrack = () => {
        this.peerHolder.addStream(stream, song)
      }
    }

    PlayerModule.setState(PlayerState.PAUSED)
  }

  private handleAudioTimeUpdate() {
    this.audioElement.ontimeupdate = (e: Event) => {
      this.$emit('onTimeUpdate', (e.currentTarget as HTMLAudioElement).currentTime)
    }
  }

  private async handlePlayerState(newState: PlayerState) {
    console.log('handling player state')
    if (this.isSongLoaded) {
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
