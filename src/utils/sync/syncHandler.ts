import { FragmentReceiver, FragmentSender } from './dataFragmenter'
import { ManagerOptions, Socket, io } from 'socket.io-client'

import { PeerMode } from '@/mainWindow/store/syncState'
import { Song } from '@/models/songs'
import { PlayerState } from '@/mainWindow/store/playerState'

export interface prefetchData {
  _id: string
  sender: string
}

export enum peerConnectionState {
  CONNECTED,
  CONNECTING,
  DISCONNECTED,
}

export class SyncHolder {
  private peerConnection: {
    [key: string]: {
      peer?: RTCPeerConnection
      coverChannel?: RTCDataChannel
      streamChannel?: RTCDataChannel
    }
  } = {}
  private socketConnection: Socket
  private mode: PeerMode = PeerMode.UNDEFINED
  private BroadcasterID: string = ''
  private isNegotiating: { [id: string]: boolean } = {}
  private connectionOptions: Partial<ManagerOptions> = {
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 2,
    timeout: 10000,
    transports: ['websocket'],
  }

  private STUN = {
    urls: [
      'stun:stun.l.google.com:19302',
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302',
      'stun:stun3.l.google.com:19302',
      'stun:stun4.l.google.com:19302',
      'stun:stun.ekiga.net',
      'stun:stun.ideasip.com',
      'stun:stun.rixtelecom.se',
      'stun:stun.schlund.de',
      'stun:stun.stunprotocol.org:3478',
      'stun:stun.voiparound.com',
      'stun:stun.voipbuster.com',
      'stun:stun.voipstunt.com',
      'stun:stun.voxgratia.org',
    ],
  }

  // private TURN = {
  //   urls: 'turn:oveno@106.213.78.186:',
  //   credential: '1234',
  // }

  private readyPeers: string[] = []

  private onJoinedRoomCallback?: (id: string) => void
  private onRemoteTrackInfoCallback?: (event: Song) => void
  private onRemoteTrackCallback?: (event: RTCTrackEvent) => void
  private onRemoteCoverCallback?: (event: Blob) => void
  private onRemoteStreamCallback?: (event: Blob) => void
  private onPrefetchAddedCallback?: (song: prefetchData) => void
  private onPrefetchSetCallback?: (data: prefetchData[]) => void
  private onPlayerStateChangeCallback?: (state: PlayerState) => void
  private onSeekCallback?: (time: number) => void
  private onPeerStateChangeCallback?: (id: string, state: peerConnectionState) => void
  private onDataSentCallback?: (id: string) => void
  private onAllReadyCallback?: () => void

  private getLocalSong?: (songID: string) => Promise<ArrayBuffer | null>
  private getLocalCover?: () => Promise<ArrayBuffer | undefined>

  constructor(url?: string) {
    this.socketConnection = io(url ? url : 'http://localhost:4000', this.connectionOptions)
    this.handleSocketError()
    this.onBroadcasterChange()
    this.joinedRoom()
  }

  set onJoinedRoom(callback: (id: string) => void) {
    this.onJoinedRoomCallback = callback
  }

  set onRemoteTrackInfo(callback: (event: Song) => void) {
    this.onRemoteTrackInfoCallback = callback
  }

  set onRemoteTrack(callback: (event: RTCTrackEvent) => void) {
    this.onRemoteTrackCallback = callback
  }

  set fetchCover(callback: () => Promise<ArrayBuffer | undefined>) {
    this.getLocalCover = callback
  }

  set onRemoteCover(callback: (event: Blob) => void) {
    this.onRemoteCoverCallback = callback
  }

  set onRemoteStream(callback: (event: Blob) => void) {
    this.onRemoteStreamCallback = callback
  }

  set onPrefetchAdded(callback: (song: prefetchData) => void) {
    this.onPrefetchAddedCallback = callback
  }

  set onPrefetchSet(callback: (prefetch: prefetchData[]) => void) {
    this.onPrefetchSetCallback = callback
  }

  set fetchSong(callback: (songID: string) => Promise<ArrayBuffer | null>) {
    this.getLocalSong = callback
  }

  set onSeek(callback: (time: number) => void) {
    this.onSeekCallback = callback
  }

  set playerStateHandler(callback: (state: PlayerState) => void) {
    this.onPlayerStateChangeCallback = callback
  }

  set peerConnectionStateHandler(callback: (id: string, state: peerConnectionState) => void) {
    this.onPeerStateChangeCallback = callback
  }

  set onDataSent(callback: (id: string) => void) {
    this.onDataSentCallback = callback
  }

  set onAllReady(callback: () => void) {
    this.onAllReadyCallback = callback
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
    let peer = new RTCPeerConnection({ iceServers: [this.STUN] })

    // Report changes to connection state
    this.listenPeerConnected(id, peer)
    if (this.onPeerStateChangeCallback) this.onPeerStateChangeCallback(id, peerConnectionState.CONNECTING)

    this.onLocalCandidate(id, peer)
    return peer
  }

  private setPeer(id: string, peer: RTCPeerConnection) {
    if (this.peerConnection[id]) this.peerConnection[id].peer = peer
    else this.peerConnection[id] = { peer: peer }
  }
  private setCoverChannel(id: string, coverChannel: RTCDataChannel) {
    if (this.peerConnection[id]) this.peerConnection[id].coverChannel = coverChannel
    else this.peerConnection[id] = { coverChannel: coverChannel }
  }

  private setStreamChannel(id: string, streamChannel: RTCDataChannel) {
    if (this.peerConnection[id]) this.peerConnection[id].streamChannel = streamChannel
    else this.peerConnection[id] = { streamChannel: streamChannel }
  }

  private makeDataChannel(id: string, peer: RTCPeerConnection) {
    let coverChannel = peer.createDataChannel('cover-channel')
    let streamChannel = peer.createDataChannel('stream-channel')

    this.handleCoverChannel(coverChannel)
    this.handleStreamChannel(streamChannel)
    this.setCoverChannel(id, coverChannel)
    this.setStreamChannel(id, streamChannel)
  }

  private handleCoverChannel(channel: RTCDataChannel) {
    let fragmentReceiver = new FragmentReceiver(this.onRemoteCoverCallback)

    channel.onmessage = (event) => {
      fragmentReceiver.receive(event.data)
    }
  }

  private handleStreamChannel(channel: RTCDataChannel) {
    let fragmentReceiver = new FragmentReceiver(this.onRemoteStreamCallback)

    channel.onmessage = (event) => {
      fragmentReceiver.receive(event.data)
    }
  }

  private addRemoteCandidate() {
    this.socketConnection.on('candidate', (id: string, candidate: RTCIceCandidate) => {
      this.peerConnection[id].peer!.addIceCandidate(new RTCIceCandidate(candidate))
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
    })
  }

  private makeOffer(id: string, peer: RTCPeerConnection) {
    // Send offer to signalling server
    peer
      .createOffer()
      .then((sdp) => peer.setLocalDescription(sdp))
      .then(() => this.socketConnection.emit('offer', id, peer.localDescription))
  }

  private onAnswer() {
    this.socketConnection.on('answer', (id: string, description: RTCSessionDescription) => {
      if (this.isNegotiating[id]) this.peerConnection[id].peer!.setRemoteDescription(description)
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

  private listenPeerConnected(id: string, peer: RTCPeerConnection) {
    peer.onconnectionstatechange = (e) => {
      if (this.onPeerStateChangeCallback) {
        switch ((e.target as RTCPeerConnection).connectionState) {
          case 'connected':
            this.onPeerStateChangeCallback(id, peerConnectionState.CONNECTED)
            break
          case 'disconnected':
          case 'failed':
            this.onPeerStateChangeCallback(id, peerConnectionState.DISCONNECTED)
        }
      }
    }
  }

  private onDataSentHandler(id: string) {
    // TODO: Show state of each user on ui
    this.onDataSentCallback ? this.onDataSentCallback(id) : null
  }

  private sendStream(id: string, stream: ArrayBuffer | null) {
    if (this.peerConnection[id].streamChannel!.readyState == 'open') {
      const fragmentSender = new FragmentSender(stream, this.peerConnection[id].streamChannel!, () =>
        this.onDataSentHandler(id)
      )
      fragmentSender.send()
    } else {
      console.log('data channel is in state: ', this.peerConnection[id].streamChannel!.readyState)
    }
  }

  public PlaySong(song: Song) {
    this.sendTrackMetadata(song)

    if (this.getLocalCover) {
      this.getLocalCover().then((cover) => {
        for (const i in this.peerConnection) {
          this.emitCover(cover, i)
        }
      })
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
      if (channel.label === 'cover-channel') {
        this.handleCoverChannel(channel)
        this.setCoverChannel(id, channel)
      } else if (channel.label === 'stream-channel') {
        this.handleStreamChannel(channel)
        this.setStreamChannel(id, channel)
      }
    }
  }

  public joinRoom(id: string) {
    this.socketConnection.emit('joinRoom', id)
  }

  private setupInitiator(id: string) {
    let peer = this.makePeer(id)
    this.listenSignalingState(id, peer)
    this.makeDataChannel(id, peer)

    this.needsNegotiation(id, peer)

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

  private listenPreFetch() {
    this.socketConnection.on('addToPrefetch', (prefetch: prefetchData) => {
      this.onPrefetchAddedCallback ? this.onPrefetchAddedCallback(prefetch) : null
    })

    this.socketConnection.on('setPrefetch', (prefetch: prefetchData[]) => {
      this.onPrefetchSetCallback ? this.onPrefetchSetCallback(prefetch) : null
    })

    this.socketConnection.on('requestedFetch', (id: string, songID: string) => {
      this.getLocalSong ? this.getLocalSong(songID).then((buf) => this.sendStream(id, buf)) : null
    })
  }

  private onOffer() {
    this.socketConnection.on('offer', (id: string, description: RTCSessionDescription) => {
      this.setupWatcher(id, description)
    })
  }

  private listenTrackChange() {
    this.socketConnection.on('trackChange', (metadata: Song) => {
      this.onRemoteTrackInfoCallback ? this.onRemoteTrackInfoCallback(metadata) : null
    })
  }

  private listenPeerReady() {
    this.socketConnection.on('ready', (id: string) => {
      this.setPeerReady(id)
      this.checkAllReady()
    })
  }

  private listenAllReady() {
    this.socketConnection.on('allReady', () => {
      this.onAllReadyCallback ? this.onAllReadyCallback() : null
      this.onPlayerStateChangeCallback ? this.onPlayerStateChangeCallback(PlayerState.PLAYING) : null
    })
  }

  private checkAllReady() {
    if (this.readyPeers.length == Object.keys(this.peerConnection).length) {
      this.socketConnection.emit('allReady')
      this.readyPeers = []
      this.onPlayerStateChangeCallback ? this.onPlayerStateChangeCallback(PlayerState.PLAYING) : null
      this.onAllReadyCallback ? this.onAllReadyCallback() : null
    }
  }

  private listenPlayerState() {
    this.socketConnection.on('playerStateChange', (state: PlayerState) => {
      this.onPlayerStateChangeCallback ? this.onPlayerStateChangeCallback(state) : null
    })
  }

  private listenSeek() {
    this.socketConnection.on('forceSeek', (time: number) => {
      this.onSeekCallback ? this.onSeekCallback(time) : null
    })
  }

  public requestSong(id: string, songID: string) {
    this.socketConnection.emit('requestSong', id, songID)
  }

  public addToQueue(song: Song) {
    this.socketConnection.emit('prefetch', this.stripToPrefetch(song))
  }

  public emitReady() {
    console.log('ready')
    this.socketConnection.emit('ready')
  }

  public emitPlayerState(state: PlayerState) {
    this.socketConnection.emit('playerStateChange', state)
  }

  public emitSeek(time: number) {
    this.socketConnection.emit('forceSeek', time)
  }

  private sendTrackMetadata(trackInfo: Song | null) {
    if (trackInfo) {
      this.socketConnection.emit('trackMetadata', this.stripToMetadata(trackInfo))
    }
  }

  private emitCover(cover: ArrayBuffer | undefined, id: string) {
    if (cover) {
      let fragmentSender = new FragmentSender(cover, this.peerConnection[id].coverChannel!)
      fragmentSender.send()
    }
  }

  private stripToPrefetch(song: Song): prefetchData {
    return { _id: song._id!, sender: this.socketConnection.id }
  }

  private stripToMetadata(song: Song): Song {
    return {
      _id: song._id!,
      title: song.title,
      duration: song.duration,
      type: song.type,
    }
  }

  private setPeerReady(id: string) {
    if (!this.readyPeers.includes(id)) {
      this.readyPeers.push(id)
    }
  }

  public start() {
    this.addRemoteCandidate()
    this.onOffer()
    this.onUserJoined()
    this.onAnswer()
    this.listenPeerReady()
    this.listenPreFetch()
    this.listenTrackChange()
    this.listenPlayerState()
    this.listenSeek()
    this.listenAllReady()
  }
}
