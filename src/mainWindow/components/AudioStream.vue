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
import { PlayerState, PlayerType } from '@/mainWindow/store/playerState'
import { Component, Prop, Ref, Watch } from 'vue-property-decorator'
import YTPlayer from 'yt-player'
import Colors from '@/utils/mixins/Colors'
import { mixins } from 'vue-class-component'
import { Player } from '@/utils/players/player'
import { YoutubePlayer } from '@/utils/players/youtube'
import { LocalPlayer } from '@/utils/players/local'
import SyncMixin from '@/utils/mixins/SyncMixin'
import { vxm } from '../store'

@Component({})
export default class AudioStream extends mixins(Colors, SyncMixin) {
  @Ref('audio') audioElement!: ExtendedHtmlAudioElement

  @Prop({ default: '' })
  roomID!: string

  @Prop({ default: 0 })
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
  private oldState: PlayerState = PlayerState.PAUSED

  get SongRepeat() {
    return vxm.player.Repeat
  }

  get volume() {
    return vxm.player.volume
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
    if (newSong) this.loadAudio(newSong, false)
  }

  onVolumeChanged(newValue: number) {
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

    if (this.currentSong) this.loadAudio(this.currentSong, true)
  }

  private setupPlayers() {
    this.ytPlayer = new YoutubePlayer(new YTPlayer('#yt-player'))
    this.localPlayer = new LocalPlayer(this.audioElement)
    this.activePlayer = this.localPlayer
  }

  private setupSync() {
    this.setSongSrcCallback = (src: string) => this.activePlayer.load(src)
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
      vxm.player.nextSong()
    }
  }

  private registerPlayerListeners() {
    this.activePlayer.onEnded = () => this.onSongEnded()
    this.activePlayer.onTimeUpdate = (time) => this.$emit('onTimeUpdate', time)
    this.activePlayer.onLoad = () => {
      console.log('here')
      vxm.player.state = this.oldState === PlayerState.LOADING ? PlayerState.PAUSED : this.oldState
    }

    vxm.player.$watch('volume', this.onVolumeChanged)
  }

  private registerListeners() {
    this.registerPlayerListeners()
    this.registerRoomListeners()
  }

  private handleFirstPlayback(loadedState: boolean) {
    if (this.isFirst && !loadedState) {
      vxm.player.state = PlayerState.PLAYING
      this.isFirst = false
    }

    if (loadedState) this.isFirst = false

    this.handleActivePlayerState(vxm.player.playerState)
  }

  private loadAudio(song: Song, loadedState: boolean) {
    this.oldState = vxm.player.state
    vxm.player.state = PlayerState.LOADING

    if (song.path) this.activePlayer.load('media://' + song.path)
    else if (song.url) this.activePlayer.load(song.url)

    this.activePlayer.volume = this.volume

    if (this.handleBroadcasterAudioLoad(song)) return

    this.handleFirstPlayback(loadedState)
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
