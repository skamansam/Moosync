<template>
  <div>
    <MusicBar />
    <!-- <div v-if="audioType == AudioType.STREAMING">
      <div v-if="holderWatcher">
        <input ref="roomid" class="inputtext" placeholder="Enter room ID" aria-label="room id" />
        <button v-on:click="holderWatcher.joinRoom(roominput.value)">join room</button>
      </div>

      <div v-if="holderBroadcast">
        <button v-on:click="holderBroadcast.createRoom()">Create Room</button>
        <h1>{{ holderBroadcast.roomID }}</h1>
        <button v-on:click="switchAudio()">Switch Audio file</button>
      </div>
    </div>

    <div ref="audioHolder">
      <audio ref="audio" />
    </div> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref, Prop, Watch } from 'vue-property-decorator'
import { Holders } from '@/services/syncHandler'
import { AudioType } from '@/services/player/enums'
import MusicBar from './Musicbar.vue'

@Component({
  components: {
    MusicBar,
  },
})
export default class AudioStream extends Vue {
  private AudioType: typeof AudioType = AudioType // To access enum in template
  @Ref('audio') audioElement!: ExtendedHtmlAudioElement

  @Prop({ default: false })
  isBroadcaster!: boolean

  @Prop({ default: '' })
  roomID!: string

  @Prop({ default: AudioType.LOCAL })
  audioType!: AudioType

  private holderBroadcast: Holders.BroadcastHolder | null = null
  private holderWatcher: Holders.WatchHolder | null = null

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
  }

  beforeDestroy() {
    this.closeAllHolders()
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
      this.playAudio(() => this.holderBroadcast!.initialize())
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

  private playAudio(callback: Function): void {
    this.getAudioFile()
    let stream = this.audioElement.captureStream()
    stream.onaddtrack = () => {
      callback()
    }
  }

  private switchAudio(): void {
    var fs = require('fs')
    var path = require('path')
    var p = path.join('/home/ovenoboyo/test2.flac')

    const file = fs.readFileSync(p)
    const fileURL = URL.createObjectURL(new Blob([file]))

    this.audioElement.src = fileURL
    let stream = this.audioElement.captureStream()
    stream.onaddtrack = () => {
      this.holderBroadcast!.gotStream(stream)
    }
  }

  private getAudioFile(): void {
    var fs = require('fs')
    var path = require('path')
    var p = path.join('/home/ovenoboyo/test.flac')

    const file = fs.readFileSync(p)
    const fileURL = URL.createObjectURL(new Blob([file]))

    this.audioElement.src = fileURL
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
