<template>
  <div class="hello">
    Watcher
    <audio ref="audio" controls />
    <input ref="roomid" type="text" class="inputtext" placeholder="..." id="text1" />
    <button v-on:click="holder.joinRoom(roominput.value)"></button>
  </div>
</template>

<script lang="ts">
import { Holders } from '@/services/syncHandler'
import { Component, Vue, Ref } from 'vue-property-decorator'

@Component
export default class Watcher extends Vue {
  private holder: Holders.WatchHolder = new Holders.WatchHolder()
  @Ref('audio') audioElement!: ExtendedHtmlAudioElement
  @Ref('roomid') roominput!: HTMLInputElement

  beforeDestroy() {
    this.holder.close()
  }

  mounted() {
    this.holder.setAudioElement = this.audioElement
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
