<template>
  <div>
    <div ref="audioHolder">
      <div id="yt-player" class="yt-player"></div>
      <audio ref="audio" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Watch } from 'vue-property-decorator'
import YTPlayer from 'yt-player'
import { mixins } from 'vue-class-component'
import { Player } from '@/utils/ui/players/player'
import { YoutubePlayer } from '@/utils/ui/players/youtube'
import { LocalPlayer } from '@/utils/ui/players/local'
import SyncMixin from '@/utils/ui/mixins/SyncMixin'
import { vxm } from '../store'
import ErrorHandler from '@/utils/ui/mixins/errorHandler'
import PlayerControls from '@/utils/ui/mixins/PlayerControls'
import Vue from 'vue'

@Component({})
export default class AudioStream extends mixins(SyncMixin, PlayerControls, ErrorHandler) {
  @Ref('audio') audioElement!: HTMLAudioElement

  @Prop({ default: '' })
  roomID!: string

  @Prop({ default: 0 })
  forceSeek!: number

  @Prop({ default: null })
  currentSong!: Song | null | undefined

  private activePlayer!: Player
  private ytPlayer!: YoutubePlayer
  private localPlayer!: LocalPlayer
  private activePlayerType!: PlayerType

  private isFirst: boolean = true

  get SongRepeat() {
    return vxm.player.Repeat
  }

  get volume() {
    return vxm.player.volume
  }

  onPlayerStateChanged(newState: PlayerState) {
    this.handleActivePlayerState(newState)
    this.emitPlayerState(newState)
  }

  private onPlayerTypeChanged(newType: PlayerType) {
    if (this.activePlayerType !== newType) {
      this.activePlayer.stop()
      this.activePlayer.removeAllListeners()
      this.activePlayerType = newType

      switch (newType) {
        case 'LOCAL':
          this.activePlayer = this.localPlayer
          break
        case 'YOUTUBE':
          this.activePlayer = this.ytPlayer
          break
      }
      this.registerPlayerListeners()
    }
  }

  @Watch('currentSong')
  onSongChanged(newSong: Song | null | undefined) {
    if (newSong) this.loadAudio(newSong, false)
    else this.unloadAudio()
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
    this.activePlayerType = 'LOCAL'

    vxm.player.$watch('playerState', this.onPlayerStateChanged)
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
    this.activePlayer.onEnded = this.onSongEnded.bind(this)
    this.activePlayer.onTimeUpdate = (time) => this.$emit('onTimeUpdate', time)
    this.activePlayer.onError = this.handlerFileError

    vxm.player.$watch('volume', this.onVolumeChanged)
  }

  private registerListeners() {
    this.registerPlayerListeners()
    this.registerRoomListeners()
  }

  private handleFirstPlayback(loadedState: boolean) {
    if (this.isFirst) {
      if (!loadedState) vxm.player.playerState = 'PLAYING'

      if (this.playerState === 'LOADING') vxm.player.playerState = 'PLAYING'
    }

    this.isFirst = false

    this.handleActivePlayerState(vxm.player.playerState)
  }

  private getPlaybackUrlAndDuration(song: Song) {
    if (song.type === 'YOUTUBE') {
      return vxm.providers.youtubeProvider.getPlaybackUrlAndDuration(song)
    }

    if (song.type === 'SPOTIFY') {
      return vxm.providers.spotifyProvider.getPlaybackUrlAndDuration(song)
    }
  }

  private async loadAudio(song: Song, loadedState: boolean) {
    // vxm.player.state = 'PLAYING'
    if (song.type === 'LOCAL') {
      this.onPlayerTypeChanged('LOCAL')
    } else {
      this.onPlayerTypeChanged('YOUTUBE')
    }

    if (song.type === 'LOCAL') song.path && this.activePlayer.load('media://' + song.path)
    else {
      if (!song.playbackUrl || !song.duration) {
        const oldState = vxm.player.playerState
        vxm.player.playerState = 'LOADING'
        const res = await this.getPlaybackUrlAndDuration(song)
        if (res) {
          // Shouldn't react on property set normally
          vxm.player.currentSong!.duration = res.duration
          Vue.set(song, 'playbackUrl', res.url)
        }
        vxm.player.playerState = oldState
        return
      }
      this.activePlayer.load(song.playbackUrl)
    }

    this.activePlayer.volume = this.volume

    if (this.handleBroadcasterAudioLoad(song)) return

    this.handleFirstPlayback(loadedState)
  }

  private unloadAudio() {
    this.activePlayer.stop()
  }

  private async handleActivePlayerState(newState: PlayerState) {
    try {
      switch (newState) {
        case 'PLAYING':
          return await this.activePlayer.play()
        case 'PAUSED':
        case 'LOADING':
          return this.activePlayer.pause()
        case 'STOPPED':
          return this.activePlayer.stop()
      }
    } catch (e) {
      this.handlerFileError(e)
      this.nextSong()
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
