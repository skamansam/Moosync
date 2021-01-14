<template>
  <div class="hello">
    broadcaster
    <section class="select">
      <label for="audioSource">Audio source: </label>
      <select ref="audioSource" />
    </section>

    <div ref="audioHolder">
      <audio ref="audio" controls />
    </div>

    <button v-if="holder" v-on:click="holder.createRoom()"></button>
    <h1 v-if="holder">{{ holder.roomID }}</h1>
    <button v-on:click="switchAudio()"></button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator'
import { Holders } from '@/services/syncHandler'

@Component
export default class Broadcaster extends Vue {
  @Ref('audio') audioElement!: ExtendedHtmlAudioElement
  private holder: Holders.BroadcastHolder = new Holders.BroadcastHolder()

  mounted() {
    this.holder.setAudioElement(this.audioElement)
    this.playAudio(() => this.holder!.initialize())
  }

  beforeDestroy() {
    this.holder.close()
  }

  public playAudio(callback: Function): void {
    this.getAudioFile()
    let stream = this.audioElement.captureStream()
    stream.onaddtrack = () => {
      callback()
    }
  }

  public switchAudio(): void {
    var fs = require('fs')
    var path = require('path')
    var p = path.join('/home/ovenoboyo/test2.flac')

    const file = fs.readFileSync(p)
    const fileURL = URL.createObjectURL(new Blob([file]))

    this.audioElement.src = fileURL
    let stream = this.audioElement.captureStream()
    stream.onaddtrack = () => {
      this.holder!.gotStream(stream)
    }
  }

  public getAudioFile(): void {
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
