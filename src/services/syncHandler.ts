import { Socket, io, ManagerOptions } from 'socket.io-client'
import { PeerMode } from '@/store/sync/syncState'

export class SyncHolder {
  private peerConnection: { [key: string]: { peer: RTCPeerConnection | null; channel: RTCDataChannel | null } } = {}
  private socketConnection: Socket
  private audioElement: ExtendedHtmlAudioElement | null = null
  private peerMode: PeerMode = PeerMode.UNDEFINED
  private socketConnectCallback: Function | undefined
  private stream: MediaStream | null = null
  private BroadcasterID: string = ''
  private isNegotiating: { [id: string]: boolean } = {}
  private dataChannelOpen: boolean = false
  private connectionOptions: Partial<ManagerOptions> = {
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    timeout: 10000,
    transports: ['websocket'],
  }

  constructor(url?: string) {
    this.socketConnection = io(url ? url : 'http://localhost:4000', this.connectionOptions)
    this.onBroadcasterChange()
  }

  public addAudioElement(element: ExtendedHtmlAudioElement) {
    this.audioElement = element
  }

  public setPeerMode(mode: PeerMode) {
    this.peerMode = mode
  }

  private makePeer(id: string): RTCPeerConnection {
    // Creates new peer
    let peer = new RTCPeerConnection()

    this.sendLocalCandidate(id, peer)

    return peer
  }

  private setPeer(id: string, peer: RTCPeerConnection) {
    if (this.peerConnection[id]) this.peerConnection[id].peer = peer
    else this.peerConnection[id] = { peer: peer, channel: null }
  }

  private setChannel(id: string, channel: RTCDataChannel) {
    if (this.peerConnection[id]) this.peerConnection[id].channel = channel
    else this.peerConnection[id] = { peer: null, channel: channel }
  }

  private makeDataChannel(id: string, peer: RTCPeerConnection) {
    let channel = peer.createDataChannel('test-label')
    this.handleDataChannel(channel)
    this.setChannel(id, channel)
  }

  private handleDataChannel(channel: RTCDataChannel) {
    channel.onopen = (event) => {
      console.log('open')
    }

    channel.onmessage = (event) => {
      console.log(event.data)
    }
  }

  private addRemoteCandidate() {
    this.socketConnection.on('candidate', (id: string, candidate: RTCIceCandidate) => {
      this.peerConnection[id].peer?.addIceCandidate(new RTCIceCandidate(candidate))
      // }
    })
  }

  private sendLocalCandidate(id: string, peer: RTCPeerConnection) {
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(event.candidate)
        this.socketConnection.emit('candidate', id, event.candidate)
      }
    }
  }

  public onJoinRoom(callback: Function) {
    this.socketConnection.on('joinedRoom', (roomID: string) => {
      callback(roomID)
    })
  }

  // Broadcaster

  private makeOffer(id: string, peer: RTCPeerConnection) {
    // Send offer to signalling server
    peer
      .createOffer({})
      .then((sdp) => peer.setLocalDescription(sdp))
      .then(() => this.socketConnection.emit('offer', id, peer.localDescription))
  }

  private onAnswer() {
    this.socketConnection.on('answer', (id: string, description: RTCSessionDescription) => {
      if (this.isNegotiating) this.peerConnection[id].peer!.setRemoteDescription(description)
    })
  }

  private needsNegotiation(id: string, peer: RTCPeerConnection) {
    peer.onnegotiationneeded = () => {
      if (!this.isNegotiating[id]) {
        this.isNegotiating[id] = true
        this.makeOffer(id, peer)
      }
    }
  }

  private addStream(peer: RTCPeerConnection, stream: MediaStream) {
    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream)
    })
  }

  public createRoom() {
    this.socketConnection.emit('createRoom')
  }

  // Watcher

  private onStream(id: string, peer: RTCPeerConnection) {
    peer.ontrack = (event: RTCTrackEvent) => {
      if (id == this.BroadcasterID) {
        this.audioElement!.srcObject = event.streams[0]
        // console.log(event.streams[0].getTracks())
        this.audioElement!.play()
      }
    }
  }

  private onDataChannel(id: string, peer: RTCPeerConnection) {
    peer.ondatachannel = (event) => {
      let channel = event.channel
      this.handleDataChannel(channel)
      this.setChannel(id, channel)
    }
  }

  public joinRoom(id: string) {
    this.socketConnection.emit('joinRoom', id)
  }

  // Common setup

  private handleStream(peer: RTCPeerConnection, id: string) {
    if (!this.stream) {
      this.stream = this.audioElement!.captureStream()
      this.stream!.onaddtrack = () => {
        this.addStream(peer, this.stream!)
      }
    } else {
      if (this.stream.getTracks().length > 0) {
        this.addStream(peer, this.stream)
      } else {
        this.stream!.onaddtrack = () => {
          this.addStream(peer, this.stream!)
        }
      }
    }
    // TODO: Send audio metadata to watcher
    // this.peerConnection[id].channel?.send('hello')
  }

  private setupInitiator(id: string) {
    let peer = this.makePeer(id)
    this.listenSignalingState(id, peer)
    this.makeDataChannel(id, peer)

    this.needsNegotiation(id, peer)

    if (this.audioElement!.src || this.audioElement!.srcObject) {
      this.handleStream(peer, id)
    } else {
      this.audioElement!.onloadeddata = () => {
        this.handleStream(peer, id)
      }
    }

    // this.peerConnection[id] = peer
    this.setPeer(id, peer)
  }

  private setupWatcher(id: string, description: RTCSessionDescription) {
    // Setup watcher listeners
    let peer: RTCPeerConnection

    if (this.peerConnection[id] && this.peerConnection[id].peer) peer = this.peerConnection[id].peer!
    else peer = this.makePeer(id)

    this.listenSignalingState(id, peer)
    this.onDataChannel(id, peer)
    this.onStream(id, peer)

    peer
      .setRemoteDescription(description)
      .then(() => peer.createAnswer())
      .then((sdp) => peer.setLocalDescription(sdp))
      .then(() => this.socketConnection.emit('answer', id, peer.localDescription))

    // this.peerConnection[id] = peer
    this.setPeer(id, peer)
  }

  private onBroadcasterChange() {
    this.socketConnection.on('broadcasterChange', (id: string) => {
      this.BroadcasterID = id
    })
  }

  private onUserJoined() {
    this.socketConnection.on('userJoined', (id: string) => {
      this.setupInitiator(id)
    })
  }

  private listenSignalingState(id: string, peer: RTCPeerConnection): void {
    peer.onsignalingstatechange = (e) => {
      this.isNegotiating[id] = (e.target as RTCPeerConnection).signalingState != 'stable'
    }
  }

  private onOffer() {
    this.socketConnection.on('offer', (id: string, description: RTCSessionDescription) => {
      this.setupWatcher(id, description)
    })
  }

  public start() {
    this.addRemoteCandidate()

    // Setup watcher
    this.onOffer()

    // Setup initiator
    this.onUserJoined()

    this.onAnswer()
  }
}
