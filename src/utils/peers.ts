import { config } from '@/utils/socketBroadcast'

export namespace RTCPeer {
  class RTCPeer {
    protected connection: RTCPeerConnection
    protected id: string | null = null

    constructor(id: string) {
      this.connection = new RTCPeerConnection(config)
      this.id = id
    }

    protected acceptAnswer(description: RTCSessionDescription) {
      this.connection!.setRemoteDescription(description)
    }

    public listenCandidate(callback: Function) {
      this.connection!.onicecandidate = (event) => {
        callback(this.id, event.candidate)
      }
    }

    public addCandidate(candidate: RTCIceCandidate) {
      if (candidate) {
        this.connection!.addIceCandidate(new RTCIceCandidate(candidate))
      }
    }

    public close(): void {
      this.connection!.close()
    }
  }

  export class BroadcastRTCPeer extends RTCPeer {
    constructor(id: string) {
      super(id)
    }

    public setRemoteDesc(description: RTCSessionDescription): void {
      this.connection!.setRemoteDescription(description)
    }

    public createOfferAndSetDesc(callback: Function, restart: boolean): void {
      this.connection!.createOffer(restart ? { iceRestart: true } : {})
        .then((sdp) => this.connection!.setLocalDescription(sdp))
        .then(() => callback(this.id, this.connection.localDescription))
    }

    public replaceTrack(stream: MediaStream) {
      if (this.connection !== null) {
        stream.getTracks().forEach((track) => {
          var senders = this.connection!.getSenders()
          for (var index in senders) {
            senders[index].replaceTrack(track)
          }
        })
      }
    }

    public addTrack(stream: MediaStream) {
      if (this.connection !== null) {
        stream!.getTracks().forEach((track) => {
          this.connection!.addTrack(track, stream)
        })
      }
    }
  }

  export class WatchRTCPeer extends RTCPeer {
    public sendAnswer(description: RTCSessionDescription, callback: Function): void {
      this.connection
        .setRemoteDescription(description)
        .then(() => this.connection!.createAnswer())
        .then((sdp) => this.connection!.setLocalDescription(sdp))
        .then(() => callback(this.id, this.connection!.localDescription))
    }

    public gotStream(callback: Function): void {
      this.connection!.ontrack = (event: RTCTrackEvent) => {
        callback(event)
      }
    }
  }
}
