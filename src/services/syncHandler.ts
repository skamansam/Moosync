import { Socket, io, ManagerOptions } from 'socket.io-client'
import { PeerMode } from '@/store/sync/syncState'

export class SyncHolder {
  private peerConnection: { [key: string]: RTCPeerConnection } = {}
  private socketConnection: Socket
  private audioElement: ExtendedHtmlAudioElement | null = null
  private peerMode: PeerMode = PeerMode.UNDEFINED
  private socketConnectCallback: Function | undefined
  private stream: MediaStream | null = null
  private BroadcasterID: string = ''
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

  private addRemoteCandidate() {
    this.socketConnection.on('candidate', (id: string, candidate: RTCIceCandidate) => {
      console.log('got remote candidate and adding it')
      this.peerConnection[id]?.addIceCandidate(new RTCIceCandidate(candidate))
      // }
    })
  }

  private sendLocalCandidate(id: string, peer: RTCPeerConnection) {
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('got local candidate and emiting it')
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
    console.log('making offer')
    peer
      .createOffer({})
      .then((sdp) => peer.setLocalDescription(sdp))
      .then(() => this.socketConnection.emit('offer', id, peer.localDescription))
  }

  private onAnswer() {
    this.socketConnection.on('answer', (id: string, description: RTCSessionDescription) => {
      this.peerConnection[id].setRemoteDescription(description)
    })
  }

  private needsNegotiation(id: string, peer: RTCPeerConnection) {
    peer.onnegotiationneeded = () => {
      console.log('negotiating')
      this.makeOffer(id, peer)
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
        this.audioElement!.play()
      }
    }
  }

  public joinRoom(id: string) {
    this.socketConnection.emit('joinRoom', id)
  }

  // Common setup

  private handleStream(peer: RTCPeerConnection) {
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
  }

  private setupInitiator(id: string) {
    let peer = this.makePeer(id)
    this.needsNegotiation(id, peer)

    if (this.audioElement!.src || this.audioElement!.srcObject) {
      this.handleStream(peer)
    } else {
      this.audioElement!.onloadeddata = () => {
        this.handleStream(peer)
      }
    }

    this.peerConnection[id] = peer
  }

  private setupWatcher(id: string, description: RTCSessionDescription) {
    // Setup watcher listeners
    let peer = this.makePeer(id)
    this.onStream(id, peer)

    peer
      .setRemoteDescription(description)
      .then(() => peer.createAnswer())
      .then((sdp) => peer.setLocalDescription(sdp))
      .then(() => this.socketConnection.emit('answer', id, peer.localDescription))
    this.peerConnection[id] = peer
  }

  private onBroadcasterChange() {
    this.socketConnection.on('broadcasterChange', (id: string) => {
      console.log('got change')
      this.BroadcasterID = id
    })
  }

  private onUserJoined() {
    this.socketConnection.on('userJoined', (id: string) => {
      this.setupInitiator(id)
    })
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
