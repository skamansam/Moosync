<template>
  <div class="hello">
    Watcher
    <audio ref="audio" controls />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator'
import { Sockets } from '@/utils/sockets'
import { RTCPeer } from '@/utils/peers'

@Component
export default class Watcher extends Vue {
  private peerConnection: RTCPeer.WatchRTCPeer | null = null
  private socket: any
  private socketConnection = new Sockets.LazyWatcherSocket()
  @Ref('audio') audioElement!: HTMLAudioElement

  mounted() {
    this.setup()
  }

  public setup(): void {
    this.socketConnection.listenOffer((id: string, description: RTCSessionDescription) => {
      this.peerConnection = new RTCPeer.WatchRTCPeer(id)
      this.peerConnection.sendAnswer(description, (id: string, localdesc: RTCSessionDescription) =>
        this.socketConnection.emitAnswer(id, localdesc)
      )
      this.peerConnection.gotStream((event: RTCTrackEvent) => {
        this.audioElement.srcObject = event.streams[0]
      })
      this.peerConnection.listenCandidate((id: string, candidate: RTCIceCandidate) => {
        this.socketConnection.emitCandidate(id, candidate)
      })
    })

    this.socketConnection.listenCandidate((id: string, candidate: RTCIceCandidate) =>
      this.peerConnection!.addCandidate(candidate)
    )
    this.socketConnection.listenBroadcaster(() => {
      if (this.peerConnection !== null) {
        this.peerConnection!.close()
      }
    })
    this.socketConnection.onConnect(() => this.socketConnection.emitWatcher())
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
