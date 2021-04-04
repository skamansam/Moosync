<template>
  <div>
    <div ref="audioHolder">
      <div id="yt-player" class="yt-player"></div>
      <audio ref="audio" />
    </div>
  </div>
</template>

<script lang="ts">
import { Song } from '@/models/songs'
import { PlayerModule, PlayerState, PlayerType } from '@/mainWindow/store/playerState'
import { Component, Prop, Ref, Watch } from 'vue-property-decorator'
import YTPlayer from 'yt-player'
import Colors from '@/utils/mixins/Colors'
import { mixins } from 'vue-class-component'
import { Player } from '@/utils/players/player'
import { YoutubePlayer } from '@/utils/players/youtube'
import { LocalPlayer } from '@/utils/players/local'
import SyncMixin from '@/utils/mixins/SyncMixin'

@Component({})
export default class AudioStream extends mixins(Colors, SyncMixin) {
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

  private activePlayer!: Player
  private ytPlayer!: YoutubePlayer
  private localPlayer!: LocalPlayer

  private isFirst: boolean = true

  get SongRepeat() {
    return PlayerModule.Repeat
  }

  @Watch('playerState')
  onPlayerStateChanged(newState: PlayerState) {
    this.handleActivePlayerState(newState)
    this.emitPlayerState(newState)
  }

  @Watch('playerType')
  onPlayerTypeChanged(newType: PlayerType) {
    this.activePlayer.stop()
    this.activePlayer.removeAllListeners()
    switch (newType) {
      case PlayerType.LOCAL:
        this.activePlayer = this.localPlayer
        break
      case PlayerType.YOUTUBE:
        this.activePlayer = this.ytPlayer
        break
    }
    this.registerPlayerListeners()
  }

  @Watch('currentSong')
  onSongChanged(newSong: Song | null) {
    if (newSong && !this.isWatching) this.loadAudio(newSong)
  }

  @Watch('volume') onVolumeChanged(newValue: number) {
    this.activePlayer.volume = newValue
  }

  @Watch('forceSeek') onSeek(newValue: number) {
    this.activePlayer.currentTime = newValue
    this.remoteSeek(newValue)
  }

  mounted() {
    this.setupPlayers()
    this.setupSync()
    this.registerListeners()
  }

  private setupPlayers() {
    this.ytPlayer = new YoutubePlayer(new YTPlayer('#yt-player'))
    this.localPlayer = new LocalPlayer(this.audioElement)
    this.activePlayer = this.localPlayer
  }

  private setupSync() {
    this.setSongSrcCallback = (src: string) => (this.audioElement.src = src)
    this.onSeekCallback = (time: number) => (this.activePlayer.currentTime = time)
  }

  private registerRoomListeners() {
    this.$root.$on('join-room', (data: string) => this.joinRoom(data))
    this.$root.$on('create-room', () => this.createRoom())
  }

  private onSongEnded() {
    if (this.SongRepeat) {
      this.activePlayer.currentTime = 0
      this.activePlayer.play()
    } else {
      PlayerModule.nextSong()
    }
  }

  private registerPlayerListeners() {
    this.activePlayer.onEnded = () => this.onSongEnded()
    this.activePlayer.onTimeUpdate = (time) => this.$emit('onTimeUpdate', time)
  }

  private registerListeners() {
    this.registerPlayerListeners()
    this.registerRoomListeners()
  }

  private handleFirstPlayback() {
    if (this.isFirst) {
      PlayerModule.setState(PlayerState.PLAYING)
      this.isFirst = false
    }
    this.handleActivePlayerState(PlayerModule.playerState)
  }

  private loadAudio(song: Song) {
    this.activePlayer.load(song.path ?? song.url)
    this.activePlayer.volume = this.volume

    if (this.handleBroadcasterAudioLoad(song)) return

    this.handleFirstPlayback()
  }

  private async handleActivePlayerState(newState: PlayerState) {
    switch (newState) {
      case PlayerState.PLAYING:
        return this.activePlayer.play()
      case PlayerState.PAUSED:
      case PlayerState.LOADING:
        return this.activePlayer.pause()
      case PlayerState.STOPPED:
        return this.activePlayer.stop()
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
