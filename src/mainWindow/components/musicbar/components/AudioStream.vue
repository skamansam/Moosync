<!-- 
  AudioStream.vue is a part of Moosync.
  
  Copyright 2022 by Sahil Gupte <sahilsachingupte@gmail.com>. All rights reserved.
  Licensed under the GNU General Public License. 
  
  See LICENSE in the project root for license information.
-->

<template>
  <div>
    <div ref="audioHolder">
      <div id="yt-player" class="yt-player"></div>
      <audio id="dummy-yt-player" />
      <audio ref="audio" preload="auto" />
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
import { vxm } from '@/mainWindow/store'
import ErrorHandler from '@/utils/ui/mixins/errorHandler'
import PlayerControls from '@/utils/ui/mixins/PlayerControls'
import Vue from 'vue'
import { InvidiousPlayer } from '../../../../utils/ui/players/invidious'

@Component({})
export default class AudioStream extends mixins(SyncMixin, PlayerControls, ErrorHandler) {
  @Ref('audio') audioElement!: HTMLAudioElement

  @Prop({ default: '' })
  roomID!: string

  @Prop({ default: 0 })
  forceSeek!: number

  @Prop({ default: null })
  currentSong!: Song | null | undefined

  /**
   * Player responsible for handling current song
   * May switch between youtube and local
   */
  private activePlayer!: Player

  /**
   * Instance of youtube embed player
   */
  private ytPlayer!: YoutubePlayer | InvidiousPlayer

  /**
   * Instance of Local html audio tag player
   */
  private localPlayer!: LocalPlayer

  /**
   * Holds type of player which is current active
   */
  private activePlayerTypes!: PlayerTypes

  /**
   * True is page has just loaded and a new song is to be loaded into the player
   * Otherwise false
   */
  private isFirst = true

  /**
   * True if vuex state change is not to be reflected on active player
   * When player is paused or played from an external source, the onStateChange event triggers
   * and the vuex player state is changed respectively. This flag is set to true to avoid setting
   * the same state on active player again
   */
  private ignoreStateChange = false

  private stateChangeQueued = false

  private _bufferTrap: ReturnType<typeof setTimeout> | undefined

  get songRepeat() {
    return vxm.player.Repeat
  }

  get volume() {
    return vxm.player.volume
  }

  /**
   * Method called when vuex player state changes
   * This method is responsible for reflecting that state on active player
   */
  async onPlayerStateChanged(newState: PlayerState) {
    if (!this.ignoreStateChange) {
      if (vxm.player.loading) {
        this.stateChangeQueued = true
        return
      }
      await this.handleActivePlayerState(newState)
      this.emitPlayerState(newState)
    }

    this.ignoreStateChange = false
  }

  private parsePlayerTypes(type: PlayerTypes): 'LOCAL' | 'YOUTUBE' {
    switch (type) {
      case 'LOCAL':
      case 'URL':
      default:
        return 'LOCAL'
      case 'SPOTIFY':
      case 'YOUTUBE':
        return 'YOUTUBE'
    }
  }

  /**
   * Method called when player type changes
   * This method is responsible of detaching old player
   * and setting new player as active
   */
  private onPlayerTypesChanged(newType: PlayerTypes): 'LOCAL' | 'YOUTUBE' {
    const parsedType = this.parsePlayerTypes(newType)
    if (this.activePlayerTypes !== parsedType) {
      console.debug('Changing player type to', newType)
      this.unloadAudio()
      this.activePlayer.removeAllListeners()

      switch (parsedType) {
        case 'LOCAL':
          this.activePlayer = this.localPlayer
          break
        case 'YOUTUBE':
          this.activePlayer = this.ytPlayer
          break
      }

      this.activePlayer.volume = vxm.player.volume
      this.registerPlayerListeners()
      this.activePlayerTypes = parsedType
    }

    return parsedType
  }

  /**
   * Method triggered when currentSong prop changes
   * This method is responsible for loading the current song in active player
   * or unloading the player if current song is empty
   */
  @Watch('currentSong')
  onSongChanged(newSong: Song | null | undefined) {
    if (newSong) this.loadAudio(newSong, false)
    else this.unloadAudio()
  }

  /**
   * Method triggered when vuex volume changes
   */
  onVolumeChanged(newValue: number) {
    this.activePlayer.volume = newValue
  }

  /**
   * Method triggered when user seeks on timeline and forceSeek prop changes
   */
  @Watch('forceSeek') onSeek(newValue: number) {
    this.activePlayer.currentTime = newValue
    if (this.isSyncing) this.remoteSeek(newValue)
  }

  mounted() {
    this.setupPlayers()
    this.setupSync()
    this.registerListeners()

    if (this.currentSong) this.loadAudio(this.currentSong, true)
  }

  /**
   * Initial setup for all players
   */
  private setupPlayers() {
    vxm.providers.$watch(
      'useInvidious',
      (val) => {
        if (val) {
          this.ytPlayer = new InvidiousPlayer(this.audioElement)
        } else {
          this.ytPlayer = new YoutubePlayer(new YTPlayer('#yt-player'))
        }
      },
      { deep: false, immediate: true }
    )
    this.localPlayer = new LocalPlayer(this.audioElement)
    this.activePlayer = this.localPlayer
    this.activePlayerTypes = 'LOCAL'
  }

  private setupSync() {
    this.setSongSrcCallback = (src: string) => this.activePlayer.load(src)
    this.onSeekCallback = (time: number) => (this.activePlayer.currentTime = time)
  }

  private registerRoomListeners() {
    this.$root.$on('join-room', (data: string) => this.joinRoom(data))
    this.$root.$on('create-room', () => this.createRoom())
  }

  private async onSongEnded() {
    vxm.player.playAfterLoad = true
    if (this.songRepeat && this.currentSong) {
      // Re load entire audio instead of setting current time to 0
      this.loadAudio(this.currentSong, false)
    } else {
      this.nextSong()
    }
  }

  /**
   * Register all listeners related to players
   */
  private registerPlayerListeners() {
    if (vxm.player.loading) {
      vxm.player.loading = false
    }

    this.activePlayer.onTimeUpdate = (time) => this.$emit('onTimeUpdate', time)
    this.activePlayer.onError = (err) => {
      console.error('Player error', err.message, 'while playing', this.currentSong?.playbackUrl)
      console.error(`${this.currentSong?._id}: ${this.currentSong?.title} unplayable, skipping.`)
      this.removeFromQueue(vxm.player.queueIndex)
      this.nextSong()
    }
    this.activePlayer.onStateChange = (state) => {
      // Cued event of youtube embed seems to fire only once and is not reliable
      // Stop loading when state of player changes
      vxm.player.loading = false
      this.cancelBufferTrap()

      if (state === 'STOPPED') {
        this.onSongEnded()
        return
      }

      if (state !== vxm.player.playerState) {
        this.ignoreStateChange = true
        vxm.player.playerState = state
      }
    }

    this.activePlayer.onLoad = () => {
      vxm.player.loading = false
      this.cancelBufferTrap()
    }

    this.activePlayer.onBuffer = () => {
      vxm.player.loading = true
      this.setBufferTrap()
    }

    vxm.player.$watch('volume', this.onVolumeChanged)
    vxm.player.$watch('loading', (newVal) => {
      if (!newVal && this.stateChangeQueued) {
        this.onPlayerStateChanged(vxm.player.playerState)
        this.stateChangeQueued = false
      }
    })
  }

  /**
   * If the player is buffering for a long time then try changing its playback quality
   */
  private setBufferTrap() {
    if (!this._bufferTrap) {
      this._bufferTrap = setTimeout(() => {
        if (this.activePlayerTypes === 'YOUTUBE' && this.activePlayer instanceof YoutubePlayer) {
          this.activePlayer.setPlaybackQuality('small')
          this.pause()
          Vue.nextTick(() => this.play())

          console.debug('Triggered buffer trap')
        }
      }, 3000)
    }
  }

  private cancelBufferTrap() {
    if (this._bufferTrap) {
      clearTimeout(this._bufferTrap)
      this._bufferTrap = undefined
    }
  }

  private registerListeners() {
    this.registerPlayerListeners()
    this.registerRoomListeners()

    vxm.player.$watch('playerState', this.onPlayerStateChanged)
  }

  /**
   * Sets current player's state to vuex player state
   */
  private handleFirstPlayback(loadedState: boolean) {
    if (this.isFirst || vxm.player.queueOrder.length === 1) {
      if (!loadedState) {
        vxm.player.playerState = 'PLAYING'
      }
      this.isFirst = false
    }
  }

  private getPlaybackUrlAndDuration(song: Song) {
    if (song.type === 'YOUTUBE') {
      return vxm.providers.youtubeProvider.getPlaybackUrlAndDuration(song)
    }

    if (song.type === 'SPOTIFY') {
      return vxm.providers.spotifyProvider.getPlaybackUrlAndDuration(song)
    }

    return new Promise<{ url: string; duration: number } | void>((resolve, reject) => {
      if (song.playbackUrl) {
        const audio = new Audio()
        audio.onloadedmetadata = () => {
          if (song.playbackUrl) resolve({ url: song.playbackUrl, duration: audio.duration })
        }
        audio.onerror = reject

        audio.src = song.playbackUrl
      } else {
        resolve()
      }
    })
  }

  private metadataInterval: ReturnType<typeof setInterval> | undefined

  /**
   * Set media info which is recognised by different applications and OS specific API
   */
  private async setMediaInfo(song: Song) {
    if (navigator.mediaSession) {
      const artworkList: string[] = []
      if (song.song_coverPath_low) {
        artworkList.push(song.song_coverPath_low)
      }
      if (song.song_coverPath_high) {
        artworkList.push(song.song_coverPath_high)
      }
      if (song.album?.album_coverPath_high) {
        artworkList.push(song.album.album_coverPath_high)
      }
      if (song.album?.album_coverPath_low) {
        artworkList.push(song.album.album_coverPath_low)
      }

      const artwork: MediaImage[] = []
      for (const a of artworkList) {
        if (!a.startsWith('http')) {
          const blob = await (await fetch('media://' + a)).blob()
          let objectURL = URL.createObjectURL(blob)
          artwork.push({ src: objectURL })
        } else {
          artwork.push({ src: a })
        }
      }

      const metadata = {
        title: song.title,
        artist: song.artists && song.artists.map((val) => val.artist_name).join(', '),
        album: song.album?.album_name,
        artwork
      }

      const dummyAudio: HTMLAudioElement = document.getElementById('dummy-yt-player') as HTMLAudioElement

      if (this.parsePlayerTypes(this.activePlayerTypes) === 'YOUTUBE') {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const audio = require('../../../../assets/5-seconds-of-silence.mp3')
        dummyAudio.load()
        dummyAudio.src = audio
        dummyAudio.volume = 0
        dummyAudio.loop = true
        await dummyAudio.play()
        dummyAudio.volume = 0
      } else {
        dummyAudio.pause()
      }

      if (this.metadataInterval) {
        clearInterval(this.metadataInterval)
      }

      const setMetadata = () => {
        navigator.mediaSession.metadata = new MediaMetadata(metadata)
        navigator.mediaSession.setActionHandler('nexttrack', () => this.nextSong())
        navigator.mediaSession.setActionHandler('seekbackward', () => this.nextSong())
        navigator.mediaSession.setActionHandler('previoustrack', () => this.prevSong())
        navigator.mediaSession.setActionHandler('seekforward', () => this.prevSong())
        navigator.mediaSession.setActionHandler('seekto', (data) => data.seekTime && (this.forceSeek = data.seekTime))
      }
      setMetadata()
      console.debug('Set navigator mediaSession info', metadata)

      this.metadataInterval = setInterval(() => {
        setMetadata()
      }, 10000)

      console.debug('Set navigator mediaSession action handlers')
    }
  }

  private async getLocalSong(songID: string) {
    const songs = await window.SearchUtils.searchSongsByOptions({
      song: {
        _id: songID
      }
    })

    if (songs.length > 0) {
      return songs[0]
    }
  }

  private duplicateSongChangeRequest: Song | undefined

  private async loadAudio(song: Song, loadedState: boolean) {
    if (this.duplicateSongChangeRequest?._id === song._id) {
      console.debug('Got duplicate song request, ignoring')
      this.duplicateSongChangeRequest = undefined
      return
    }

    this.unloadAudio()
    vxm.player.loading = true

    console.debug('Loading new song', song.title, song.type)

    if (this.isSyncing) {
      const tmp = await this.getLocalSong(song._id)
      if (tmp) {
        song = tmp
      }
    }

    const PlayerTypes = this.onPlayerTypesChanged(song.type)

    if (!song.playbackUrl || !song.duration) {
      console.debug('PlaybackUrl or Duration empty for', song._id)

      const res = await this.getPlaybackUrlAndDuration(song)
      console.debug('Got playback url and duration', res)

      if (res) {
        this.duplicateSongChangeRequest = song
        // song is a reference to vxm.player.currentSong or vxm.sync.currentSong.
        // Mutating those properties should also mutate song
        if (!this.isSyncing) {
          if (vxm.player.currentSong) {
            vxm.player.currentSong.duration = res.duration
            Vue.set(vxm.player.currentSong, 'playbackUrl', res.url)
          }
        } else {
          if (vxm.sync.currentSong) {
            vxm.sync.currentSong.duration = res.duration
            Vue.set(vxm.sync.currentSong, 'playbackUrl', res.url)
          }
        }
      }
    }

    if (PlayerTypes === 'LOCAL') {
      this.activePlayer.load(
        song.path ? 'media://' + song.path : song.playbackUrl,
        this.volume,
        vxm.player.playAfterLoad || this.playerState === 'PLAYING'
      )
      console.debug('Loaded song at', 'media://' + song.path)
      vxm.player.loading = false
    } else {
      console.debug('PlaybackUrl for song', song._id, 'is', song.playbackUrl)

      console.debug('Loaded song at', song.playbackUrl)
      this.activePlayer.load(song.playbackUrl, this.volume, vxm.player.playAfterLoad || this.playerState !== 'PAUSED')
    }

    if (this.handleBroadcasterAudioLoad()) return

    this.handleFirstPlayback(loadedState)

    this.setMediaInfo(song)
  }

  private unloadAudio() {
    console.debug('Unloading audio')

    this.activePlayer.stop()
  }

  private async handleActivePlayerState(newState: PlayerState) {
    try {
      switch (newState) {
        case 'PLAYING':
          return this.activePlayer.play()
        case 'PAUSED':
          return this.activePlayer.pause()
        case 'STOPPED':
          return this.unloadAudio()
      }
    } catch (e) {
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
