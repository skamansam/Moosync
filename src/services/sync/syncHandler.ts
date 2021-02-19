import { FragmentReceiver, FragmentSender } from './dataFragmenter'
import { ManagerOptions, Socket, io } from 'socket.io-client'

import { PeerMode } from '@/store/syncState'
import { Song } from '@/models/songs'

interface DataChannelMessage<T> {
  type: string
  message: T
}
export class SyncHolder {
  private peerConnection: {
    [key: string]: {
      peer: RTCPeerConnection | null
      trackchannel: RTCDataChannel | null
      coverchannel: RTCDataChannel | null
    }
  } = {}
  private socketConnection: Socket
  private mode: PeerMode = PeerMode.UNDEFINED
  private stream: MediaStream | null = null
  private BroadcasterID: string = ''
  private isNegotiating: { [id: string]: boolean } = {}
  private connectionOptions: Partial<ManagerOptions> = {
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 2,
    timeout: 10000,
    transports: ['websocket'],
  }

  private onJoinedRoomCallback: ((id: string) => void) | null = null
  private onDatachannelOpenCallback: (() => Song | null) | null = null
  private onRemoteTrackInfoCallback: ((event: DataChannelMessage<Song>) => void) | null = null
  private setLocalTrackCallback: (() => void) | null = null
  private onRemoteTrackCallback: ((event: RTCTrackEvent) => void) | null = null
  private onRemoteCoverCallback: ((event: Blob) => void) | null = null
  private fetchCoverCallback: (() => Buffer | null) | null = null

  constructor(url?: string) {
    this.socketConnection = io(url ? url : 'http://localhost:4000', this.connectionOptions)
    this.handleSocketError()
    this.onBroadcasterChange()
    this.joinedRoom()
  }

  set onJoinedRoom(callback: (id: string) => void) {
    this.onJoinedRoomCallback = callback
  }

  set onDatachannelOpen(callback: () => Song | null) {
    this.onDatachannelOpenCallback = callback
  }

  set onRemoteTrackInfo(callback: (event: DataChannelMessage<Song>) => void) {
    this.onRemoteTrackInfoCallback = callback
  }

  set setLocalTrack(callback: () => void) {
    this.setLocalTrackCallback = callback
  }

  set onRemoteTrack(callback: (event: RTCTrackEvent) => void) {
    this.onRemoteTrackCallback = callback
  }

  set fetchCover(callback: () => Buffer | null) {
    this.fetchCoverCallback = callback
  }

  set onRemoteCover(callback: (event: Blob) => void) {
    this.onRemoteCoverCallback = callback
  }

  set peerMode(mode: PeerMode) {
    this.mode = mode
  }

  get peerMode() {
    return this.mode
  }

  private handleSocketError() {
    // TODO: Display failure on UI
    this.socketConnection.on('connect_error', (error: Error) => {
      console.log(error)
    })
  }

  private makePeer(id: string): RTCPeerConnection {
    // Creates new peer
    let peer = new RTCPeerConnection()
    this.onLocalCandidate(id, peer)
    return peer
  }

  private setPeer(id: string, peer: RTCPeerConnection) {
    if (this.peerConnection[id]) this.peerConnection[id].peer = peer
    else this.peerConnection[id] = { peer: peer, trackchannel: null, coverchannel: null }
  }

  private setTrackChannel(id: string, trackChannel: RTCDataChannel) {
    if (this.peerConnection[id]) this.peerConnection[id].trackchannel = trackChannel
    else this.peerConnection[id] = { peer: null, trackchannel: trackChannel, coverchannel: null }
  }

  private setCoverChannel(id: string, coverChannel: RTCDataChannel) {
    if (this.peerConnection[id]) this.peerConnection[id].coverchannel = coverChannel
    else this.peerConnection[id] = { peer: null, trackchannel: null, coverchannel: coverChannel }
  }

  private makeDataChannel(id: string, peer: RTCPeerConnection) {
    let trackChannel = peer.createDataChannel('track-channel')
    let coverChannel = peer.createDataChannel('cover-channel')

    this.handleTrackChannel(trackChannel)
    this.handleCoverChannel(coverChannel)
    this.setTrackChannel(id, trackChannel)
    this.setCoverChannel(id, coverChannel)
  }

  private handleTrackChannel(channel: RTCDataChannel) {
    channel.onopen = () => {
      this.mode == PeerMode.BROADCASTER && this.setLocalTrackCallback ? this.setLocalTrackCallback() : null
    }

    channel.onmessage = (event) => {
      let data = JSON.parse(event.data)

      switch (data.type) {
        case 'trackChange':
          this.onRemoteTrackInfoCallback ? this.onRemoteTrackInfoCallback(data as DataChannelMessage<Song>) : null
          break
      }
    }

    channel.onclose = (event) => {
      console.log('traack closed', event)
    }
  }

  private handleCoverChannel(channel: RTCDataChannel) {
    let fragmentReceiver = new FragmentReceiver(this.onRemoteCoverCallback)

    channel.onopen = (event) => {
      console.log('open cover channel', event)
    }

    channel.onmessage = (event) => {
      fragmentReceiver.receive(event.data)
    }

    channel.onclose = (event) => {
      console.log('cover closed', event)
    }
  }

  private addRemoteCandidate() {
    this.socketConnection.on('candidate', (id: string, candidate: RTCIceCandidate) => {
      this.peerConnection[id].peer?.addIceCandidate(new RTCIceCandidate(candidate))
    })
  }

  private onLocalCandidate(id: string, peer: RTCPeerConnection) {
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        this.socketConnection.emit('candidate', id, event.candidate)
      }
    }
  }

  private joinedRoom() {
    this.socketConnection.on('joinedRoom', (roomID: string) => {
      this.onJoinedRoomCallback ? this.onJoinedRoomCallback(roomID) : null
      this.start()
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

  private addStreamToPeer(peer: RTCPeerConnection, stream: MediaStream) {
    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream)
    })
  }

  private sendTrackMetadata(id: string, trackInfo: Song | null) {
    if (trackInfo)
      this.peerConnection[id].trackchannel!.send(JSON.stringify({ type: 'trackChange', message: trackInfo }))
    let cover = this.fetchCoverCallback ? this.fetchCoverCallback() : null
    if (cover) {
      let fragmentSender = new FragmentSender(cover, this.peerConnection[id].coverchannel!)
      fragmentSender.send()
    }
  }

  // public replaceTrack(track: MediaStreamTrack, song: Song) {
  //   for (let i in this.peerConnection) {
  //     let senders = this.peerConnection[i].peer!.getSenders()
  //     for (let j in senders) {
  //       senders[j].replaceTrack(track)
  //     }
  //     this.sendTrackMetadata(this.peerConnection[i].channel!, song)
  //   }
  // }

  // Replace whole stream instead of tracks since playback time gets
  // messed up on track change and a slight delay is
  // observed after resuming from broadcaster
  public addStream(stream: MediaStream, song: Song) {
    for (let i in this.peerConnection) {
      const connection = this.peerConnection[i]!
      let senders = connection.peer!.getSenders()
      for (let j in senders) {
        connection.peer!.removeTrack(senders[j])
      }
      stream.getTracks().forEach((track) => {
        connection.peer!.addTrack(track, stream)
      })
      this.sendTrackMetadata(i, song)

      if (this.stream) {
        this.stream.getTracks().forEach((track) => {
          track.stop()
        })
      }
      this.stream = stream
    }
  }

  public createRoom() {
    this.socketConnection.emit('createRoom')
  }

  private onStream(id: string, peer: RTCPeerConnection) {
    peer.ontrack = (event: RTCTrackEvent) => {
      if (this.mode == PeerMode.WATCHER && id == this.BroadcasterID) {
        this.onRemoteTrackCallback ? this.onRemoteTrackCallback(event) : null
      }
    }
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

    this.setPeer(id, peer)
  }

  private onDataChannel(id: string, peer: RTCPeerConnection) {
    peer.ondatachannel = (event) => {
      let channel = event.channel
      if (channel.label === 'track-channel') {
        this.handleTrackChannel(channel)
        this.setTrackChannel(id, channel)
      } else if (channel.label === 'cover-channel') {
        this.handleCoverChannel(channel)
        this.setCoverChannel(id, channel)
      }
    }
  }

  public joinRoom(id: string) {
    this.socketConnection.emit('joinRoom', id)
  }

  private loadStream(peer: RTCPeerConnection) {
    if (this.stream) {
      this.addStreamToPeer(peer, this.stream)
    }
  }

  private setupInitiator(id: string) {
    let peer = this.makePeer(id)
    this.listenSignalingState(id, peer)
    this.makeDataChannel(id, peer)

    this.needsNegotiation(id, peer)

    this.loadStream(peer)

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
    this.onOffer()
    this.onUserJoined()
    this.onAnswer()
  }
}
