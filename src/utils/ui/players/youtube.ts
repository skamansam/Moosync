import { Player } from './player'
import YTPlayer from 'yt-player'

export class YoutubePlayer extends Player {
  playerInstance: YTPlayer

  constructor(playerInstance: YTPlayer) {
    super()
    this.playerInstance = playerInstance
  }

  load(src?: string, volume?: number): void {
    src ? this.playerInstance.load(src) : null
    volume ? (this.volume = volume) : null
  }

  async play(): Promise<void> {
    this.playerInstance.play()
    return
  }

  pause(): void {
    return this.playerInstance.pause()
  }

  stop(): void {
    return this.playerInstance.stop()
  }

  get currentTime(): number {
    return this.playerInstance.getCurrentTime()
  }

  set currentTime(time: number) {
    this.playerInstance.seek(time)
  }

  get volume(): number {
    return this.playerInstance.getVolume()
  }

  set volume(volume: number) {
    this.playerInstance.setVolume(volume)
  }

  protected listenOnEnded(): void {
    this.playerInstance.on('ended', this.onEndedCallback!)
  }

  protected listenOnTimeUpdate(): void {
    this.playerInstance.on('timeupdate', this.onTimeUpdateCallback!)
  }

  protected listenOnLoad(): void {
    this.playerInstance.on('cued', this.onLoadCallback!)
  }

  protected listenOnError(): void {
    this.playerInstance.on('error', this.onErrorCallback as (err: any) => void)
    this.playerInstance.on('unplayable', this.onErrorCallback as (err: any) => void)
  }

  protected listenOnStateChange(): void {
    if (this.onStateChangeCallback) {
      this.playerInstance.on('playing', () => this.onStateChangeCallback!('PLAYING'))
      this.playerInstance.on('paused', () => this.onStateChangeCallback!('PAUSED'))
      this.playerInstance.on('ended', () => this.onStateChangeCallback!('STOPPED'))
    }
  }

  removeAllListeners(): void {
    this.playerInstance.removeAllListeners()
  }
}
