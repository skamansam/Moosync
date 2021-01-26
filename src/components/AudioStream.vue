<template>
  <div>
    <div ref="audioHolder">
      <div id="yt-player" class="yt-player"></div>
      <audio ref="audio" />
    </div>
    <MusicBar :currentSong="currentSong" :timestamp="currentTime" :currentCover="currentCover" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref, Prop, Watch } from 'vue-property-decorator'
import { Holders } from '@/services/syncHandler'
import { AudioType } from '@/store/player/playerState'
import MusicBar from './audiostream/Musicbar.vue'
import { PlayerState, PlayerModule } from '@/store/player/playerState'
import YTPlayer from 'yt-player'

// eslint-disable-next-line no-unused-vars
import { CoverImg, Song } from '@/models/songs'

import fs from 'fs'

@Component({
  components: {
    MusicBar,
  },
})
export default class AudioStream extends Vue {
  private AudioType: typeof AudioType = AudioType // To access enum in template
  @Ref('audio') audioElement!: ExtendedHtmlAudioElement
  private currentTime: number = 0

  @Prop({ default: false })
  isBroadcaster!: boolean

  @Prop({ default: '' })
  roomID!: string

  @Prop({ default: AudioType.LOCAL })
  audioType!: AudioType

  private holderBroadcast: Holders.BroadcastHolder | null = null
  private holderWatcher: Holders.WatchHolder | null = null
  private playerState: PlayerState = PlayerState.STOPPED
  private isSongLoaded: boolean = false
  private currentSong: Song | null = null
  private currentCover: CoverImg | null = null
  private player: YTPlayer | undefined

  @Watch('isBroadcaster') onHolderChanged() {
    this.closeAllHolders()
    if (this.audioType == AudioType.STREAMING) {
      this.setupStreamingType()
    }
  }

  @Watch('audioType') onAudioTypeChanged() {
    switch (this.audioType) {
      case AudioType.STREAMING:
        this.setupStreamingType()
        break
      case AudioType.LOCAL:
        this.closeAllHolders()
        // TODO: Setup requirements of local audio
        break
    }
  }

  created() {
    if (this.audioType === AudioType.STREAMING) {
      this.setupStreamingType()
    }
  }

  mounted() {
    if (this.audioType === AudioType.STREAMING) {
      this.setAudioElement()
    }
    this.registerListeners()
    this.setupYTPlayer()
  }

  beforeDestroy() {
    this.closeAllHolders()
  }

  private setupYTPlayer() {
    this.player = new YTPlayer('#yt-player')
  }

  private closeAllHolders() {
    if (this.holderBroadcast !== null) {
      this.holderBroadcast!.close()
    }
    if (this.holderWatcher !== null) {
      this.holderWatcher!.close()
    }

    this.holderBroadcast = null
    this.holderWatcher = null
  }

  private setAudioElement() {
    if (this.isBroadcaster) {
      this.holderBroadcast!.setAudioElement = this.audioElement
      // Might need to load track before initializing
      this.holderBroadcast!.initialize()
    } else {
      this.holderWatcher!.setAudioElement = this.audioElement
    }
  }

  private setupStreamingType() {
    if (this.isBroadcaster) {
      this.holderBroadcast = new Holders.BroadcastHolder()
      this.holderWatcher = null
    } else {
      this.holderBroadcast = null
      this.holderWatcher = new Holders.WatchHolder()
    }
  }

  private registerPlayerListeners() {
    PlayerModule.$watch(
      (playerModule) => playerModule.currentSongDets,
      (newSong: Song | null) => {
        this.currentSong = newSong
        if (newSong) this.loadAudio(newSong.path)
      }
    )

    PlayerModule.$watch(
      (playerModule) => playerModule.currentSongCover,
      async (newCover: CoverImg | null) => {
        this.currentCover = newCover
      }
    )

    PlayerModule.$watch(
      (playerModule) => playerModule.state,
      async (newState: PlayerState) => {
        this.playerState = newState
        await this.handlePlayerState()
      }
    )
  }

  private registerAudioListeners() {
    this.audioElement.ontimeupdate = () => (this.currentTime = this.audioElement.currentTime)
    this.audioElement.onended = () => PlayerModule.nextSong()
  }

  private registerListeners() {
    this.registerAudioListeners()
    this.registerPlayerListeners()
  }

  private unloadAudio() {
    this.audioElement.srcObject = null
    this.isSongLoaded = false
  }

  private loadAudio(filePath: string) {
    const file = fs.readFileSync(filePath)
    const fileURL = URL.createObjectURL(new Blob([file]))

    this.audioElement.src = fileURL
    this.isSongLoaded = true

    PlayerModule.setState(PlayerState.PAUSED)
  }

  private async handlePlayerState() {
    if (this.isSongLoaded) {
      switch (this.playerState) {
        case PlayerState.PLAYING:
          this.audioElement.play()
          break
        case PlayerState.PAUSED:
          this.audioElement.pause()
          break
        case PlayerState.STOPPED:
          this.unloadAudio()
          break
      }
    }
  }

  // private playAudio(callback: Function): void {
  //   this.getAudioFile()
  //   let stream = this.audioElement.captureStream()
  //   stream.onaddtrack = () => {
  //     callback()
  //   }
  // }

  // private switchAudio(): void {
  //   var fs = require('fs')
  //   var path = require('path')
  //   var p = path.join('/home/ovenoboyo/test2.flac')

  //   const file = fs.readFileSync(p)
  //   const fileURL = URL.createObjectURL(new Blob([file]))

  //   this.audioElement.src = fileURL
  //   let stream = this.audioElement.captureStream()
  //   stream.onaddtrack = () => {
  //     this.holderBroadcast!.gotStream(stream)
  //   }
  // }
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
