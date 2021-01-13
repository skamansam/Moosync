<template>
  <div class="hello">
    broadcaster
    <section class="select">
      <label for="audioSource">Audio source: </label>
      <select ref="audioSource" />
    </section>

    <audio ref="audio" controls />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator'
import { Sockets } from '@/utils/sockets'
import { RTCPeer } from '@/utils/peers'

@Component
export default class Broadcaster extends Vue {
  private peerConnections: { [key: string]: RTCPeer.BroadcastRTCPeer } = {}
  private socketConnection = new Sockets.LazyBroadcasterSocket()
  @Ref('audio') audioElement!: ExtendedHtmlAudioElement

  mounted() {
    this.getAudioFile()
    this.setupSocket()
  }

  public setupSocket(): void {
    this.socketConnection.listenWatcher((id: string) => {
      let peer = new RTCPeer.BroadcastRTCPeer(id)
      peer.addTrack(this.audioElement.captureStream())
      peer.listenCandidate((id: string, candidate: RTCIceCandidate) =>
        this.socketConnection.emitCandidate(id, candidate)
      )
      peer.createOfferAndSetDesc(
        (id: string, description: RTCSessionDescription) => this.socketConnection.emitOffer(id, description),
        false
      )
      this.peerConnections[id] = peer
    })

    this.socketConnection.listenCandidate((id: string, candidate: RTCIceCandidate) =>
      this.peerConnections[id].addCandidate(candidate)
    )

    this.socketConnection.disconnectListener((id: string) => {
      if (this.peerConnections[id] !== undefined) {
        this.peerConnections[id].close()
        delete this.peerConnections[id]
      }
    })

    this.socketConnection.listenAnswer((id: string, description: RTCSessionDescription) =>
      this.peerConnections[id].setRemoteDesc(description)
    )

    this.socketConnection.emitBroadcaster()
  }

  public gotStream(stream: MediaStream): void {
    for (let index in this.peerConnections) {
      this.peerConnections[index].replaceTrack(stream)
    }
  }

  public addTrackToAll(stream: MediaStream) {
    for (let index in this.peerConnections) {
      this.peerConnections[index].addTrack(stream)
    }
  }

  public playAudio(): void {
    this.getAudioFile()
    let stream = this.audioElement.captureStream()
    stream.onaddtrack = () => {
      this.addTrackToAll(stream)
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
