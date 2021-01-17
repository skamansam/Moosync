export namespace RTCPeer {
  const config = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
    ],
  }

  class RTCPeer {
    protected connection: RTCPeerConnection
    protected id: string
    protected isNegotiating: boolean = false
    protected isSetRemoteDesc: boolean = false

    constructor(id: string) {
      this.connection = new RTCPeerConnection(config)
      this.id = id
    }

    public listenCandidate(callback: Function) {
      this.connection.onicecandidate = event => {
        callback(this.id, event.candidate)
      }
    }

    public addCandidate(candidate: RTCIceCandidate) {
      if (candidate) {
        this.connection.addIceCandidate(new RTCIceCandidate(candidate))
      }
    }

    public close(): void {
      this.connection.close()
    }

    public needsNegotiation(callback: Function): void {
      this.connection.onnegotiationneeded = () => {
        if (!this.isNegotiating) {
          this.isNegotiating = true
          callback()
        }
      }
    }

    public listenSignalingState(): void {
      this.connection.onsignalingstatechange = e => {
        this.isNegotiating = this.connection.signalingState != 'stable'
      }
    }

    public listenConnectionState(callback: Function): void {
      this.connection.onconnectionstatechange = e => {
        if (this.connection.connectionState === 'failed') {
          callback(e)
        }
      }
    }
  }

  export class BroadcastRTCPeer extends RTCPeer {
    private sender: RTCRtpSender | null = null

    constructor(id: string) {
      super(id)
    }

    public setRemoteDesc(description: RTCSessionDescription): void {
      if (this.isNegotiating && !this.isSetRemoteDesc) {
        this.isSetRemoteDesc = true
        this.connection.setRemoteDescription(description).then(() => (this.isSetRemoteDesc = false))
      }
    }

    public createOfferAndSetDesc(callback: Function, restart: boolean): void {
      this.connection
        .createOffer(restart ? { iceRestart: true } : {})
        .then(sdp => this.connection!.setLocalDescription(sdp))
        .then(() => callback(this.id, this.connection.localDescription))
    }

    public replaceTrack(stream: MediaStream) {
      stream.getTracks().forEach(track => {
        var senders = this.connection!.getSenders()
        for (var index in senders) {
          senders[index].replaceTrack(track)
        }
      })
    }

    public addTrack(stream: MediaStream) {
      if (this.connection !== null) {
        stream.getTracks().forEach(track => {
          this.sender = this.connection!.addTrack(track, stream)
        })
      }
    }

    public removeTrack() {
      if (this.sender !== null) {
        this.connection.removeTrack(this.sender)
      }
    }

    public initiateNegotiation(callback: Function): void {
      this.createOfferAndSetDesc(callback, false)
    }
  }

  export class WatchRTCPeer extends RTCPeer {
    public sendAnswer(description: RTCSessionDescription, callback: Function): void {
      if (!this.isNegotiating) {
        this.isNegotiating = true
        this.connection
          .setRemoteDescription(description)
          .then(() => this.connection!.createAnswer())
          .then(sdp => this.connection!.setLocalDescription(sdp))
          .then(() => callback(this.id, this.connection!.localDescription))
      }
    }

    public gotStream(callback: Function): void {
      this.connection!.ontrack = (event: RTCTrackEvent) => {
        callback(event)
      }
    }
  }
}
