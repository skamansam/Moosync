import { Sockets } from '@/services/sockets'
import { RTCPeer } from '@/services/peers'

export namespace Holders {
  export class BroadcastHolder {
    private peerConnections: { [key: string]: RTCPeer.BroadcastRTCPeer } = {}
    private socketConnection = new Sockets.BroadcasterSocket()
    private audioElement: ExtendedHtmlAudioElement | null = null
    public roomID: string = ''

    private initiateNegotiation(peer: RTCPeer.BroadcastRTCPeer): void {
      peer.initiateNegotiation((id: string, description: RTCSessionDescription) => {
        this.socketConnection.emitOffer(id, description)
      })
    }

    private listenNegotiationRequest(peer: RTCPeer.BroadcastRTCPeer): void {
      this.socketConnection.listenNegotiationRequest(() => {
        this.initiateNegotiation(peer)
      })
    }

    private listenLocalCandidate(peer: RTCPeer.BroadcastRTCPeer): void {
      peer.listenCandidate((id: string, candidate: RTCIceCandidate) =>
        this.socketConnection.emitCandidate(id, candidate)
      )
    }

    private listenRemoteCandidate(): void {
      this.socketConnection.listenCandidate((id: string, candidate: RTCIceCandidate) =>
        this.peerConnections[id].addCandidate(candidate)
      )
    }

    private closePeerConnection(id: string) {
      if (this.peerConnections[id] !== undefined) {
        this.peerConnections[id].close()
        delete this.peerConnections[id]
      }
    }

    private listenDisconnect(): void {
      this.socketConnection.disconnectListener((id: string) => {
        this.closePeerConnection(id)
      })
    }

    private listenAnswer(): void {
      this.socketConnection.listenAnswer((id: string, description: RTCSessionDescription) =>
        this.peerConnections[id].setRemoteDesc(description)
      )
    }

    private listenRoomJoin(): void {
      this.socketConnection.onRoomJoined((roomID: string) => {
        this.roomID = roomID
        this.socketConnection.emitBroadcaster()
      })
    }

    public initialize(): void {
      this.socketConnection.listenWatcher((id: string) => {
        let peer = new RTCPeer.BroadcastRTCPeer(id)
        if (this.audioElement !== null) {
          peer.addTrack(this.audioElement.captureStream())
        }
        this.listenLocalCandidate(peer)
        peer.needsNegotiation(() => this.initiateNegotiation(peer))
        peer.listenSignalingState()
        peer.listenConnectionState(() => this.initiateNegotiation(peer))
        this.listenNegotiationRequest(peer)

        this.peerConnections[id] = peer
      })

      this.listenRemoteCandidate()
      this.listenDisconnect()
      this.listenAnswer()
      this.listenRoomJoin()
    }

    public gotStream(stream: MediaStream): void {
      for (let index in this.peerConnections) {
        this.peerConnections[index].replaceTrack(stream)
      }
    }

    public createRoom(): void {
      this.socketConnection.createRoom()
    }

    set setAudioElement(audio: ExtendedHtmlAudioElement) {
      this.audioElement = audio
    }

    public close(): void {
      for (let index in this.peerConnections) {
        if (this.peerConnections[index] !== null) {
          this.peerConnections[index].close()
          delete this.peerConnections[index]
        }
      }
      this.socketConnection.close()
    }
  }

  export class WatchHolder {
    private peerConnection: RTCPeer.WatchRTCPeer | null = null
    private socketConnection = new Sockets.WatcherSocket()
    private audioElement: ExtendedHtmlAudioElement | null = null

    private initializePeer(id: string): void {
      if (this.peerConnection === null) {
        this.peerConnection = new RTCPeer.WatchRTCPeer(id)
      }
    }

    constructor() {
      this.initialize()
    }

    private sendAnswer(description: RTCSessionDescription): void {
      this.peerConnection!.sendAnswer(description, (id: string, localdesc: RTCSessionDescription) =>
        this.socketConnection.emitAnswer(id, localdesc)
      )
    }

    private listenStream(): void {
      this.peerConnection!.gotStream((event: RTCTrackEvent) => {
        if (this.audioElement !== null) this.audioElement.srcObject = event.streams[0]
      })
    }

    private listenLocalCandidate(): void {
      this.peerConnection!.listenCandidate((id: string, candidate: RTCIceCandidate) => {
        this.socketConnection.emitCandidate(id, candidate)
      })
    }

    private listenRemoteCandidate(): void {
      this.socketConnection.listenCandidate((id: string, candidate: RTCIceCandidate) =>
        this.peerConnection!.addCandidate(candidate)
      )
    }

    private listenBroadcaster(): void {
      this.socketConnection.listenBroadcaster(() => {
        if (this.peerConnection !== null) {
          this.peerConnection!.close()
        }
      })
    }

    private needsNegotiation(id: string): void {
      this.peerConnection!.needsNegotiation(() => this.socketConnection.emitNeedNegotiation(id))
    }

    public initialize(): void {
      this.socketConnection.listenOffer((id: string, description: RTCSessionDescription) => {
        this.initializePeer(id)
        this.peerConnection!.listenSignalingState()
        this.sendAnswer(description)
        this.listenStream()
        this.listenLocalCandidate()
        this.needsNegotiation(id)
      })

      this.listenRemoteCandidate()
      this.listenBroadcaster()

      this.socketConnection.onRoomJoined(() => this.socketConnection.emitWatcher())
    }

    public joinRoom(id: string) {
      this.socketConnection.joinRoom(id)
    }

    public close() {
      if (this.peerConnection !== null) {
        this.peerConnection.close()
      }
      this.socketConnection.close()
    }

    set setAudioElement(audio: ExtendedHtmlAudioElement) {
      this.audioElement = audio
    }
  }
}
