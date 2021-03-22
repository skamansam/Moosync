import { FragmentReceiver, FragmentSender } from './dataFragmenter'
import { ManagerOptions, Socket, io } from 'socket.io-client'

import { PeerMode } from '@/mainWindow/store/syncState'
import { Song } from '@/models/songs'
import { PlayerState } from '@/mainWindow/store/playerState'

interface DataChannelMessage<T> {
  type: string
  message: T
}

const deepCopy = <T>(target: T): T => {
  if (target === null) {
    return target
  }
  if (target instanceof Date) {
    return new Date(target.getTime()) as any
  }
  if (target instanceof Array) {
    const cp = [] as any[]
    ;(target as any[]).forEach((v) => {
      cp.push(v)
    })
    return cp.map((n: any) => deepCopy<any>(n)) as any
  }
  if (typeof target === 'object' && target !== {}) {
    const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any }
    Object.keys(cp).forEach((k) => {
      cp[k] = deepCopy<any>(cp[k])
    })
    return cp as T
  }
  return target
}

export class SyncHolder {
  private peerConnection: {
    [key: string]: {
      peer?: RTCPeerConnection
      trackInfoChannel?: RTCDataChannel
      coverChannel?: RTCDataChannel
      streamChannel?: RTCDataChannel
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
  private readyPeers: string[] = []

  private onJoinedRoomCallback: ((id: string) => void) | null = null
  private onDatachannelOpenCallback: (() => Song | null) | null = null
  private onRemoteTrackInfoCallback: ((event: Song) => void) | null = null
  private setLocalTrackCallback: (() => void) | null = null
  private onRemoteTrackCallback: ((event: RTCTrackEvent) => void) | null = null
  private onRemoteCoverCallback: ((event: Blob) => void) | null = null
  private onRemoteStreamCallback: ((event: Blob) => void) | null = null
  private onPrefetchAddedCallback: ((id: string, song: Song) => void) | null = null
  private onPrefetchSetCallback: ((map: { [key: string]: Song[] }) => void) | null = null
  private onRemoteSongFetchCallback: (() => void) | null = null
  private onPlayerStateChangeCallback: ((state: PlayerState) => void) | null = null

  private getLocalSong: ((songID: string) => Promise<ArrayBuffer | null>) | null = null
  private getLocalCover: (() => Promise<ArrayBuffer | null>) | null = null

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

  set onRemoteTrackInfo(callback: (event: Song) => void) {
    this.onRemoteTrackInfoCallback = callback
  }

  set setLocalTrack(callback: () => void) {
    this.setLocalTrackCallback = callback
  }

  set onRemoteTrack(callback: (event: RTCTrackEvent) => void) {
    this.onRemoteTrackCallback = callback
  }

  set fetchCover(callback: () => Promise<ArrayBuffer | null>) {
    this.getLocalCover = callback
  }

  set onRemoteCover(callback: (event: Blob) => void) {
    this.onRemoteCoverCallback = callback
  }

  set onRemoteStream(callback: (event: Blob) => void) {
    this.onRemoteStreamCallback = callback
  }

  set onPrefetchAdded(callback: (id: string, song: Song) => void) {
    this.onPrefetchAddedCallback = callback
  }

  set onRemoteFetch(callback: () => void) {
    this.onRemoteSongFetchCallback = callback
  }

  set onPrefetchSet(callback: (map: { [key: string]: Song[] }) => void) {
    this.onPrefetchSetCallback = callback
  }

  set fetchSong(callback: (songID: string) => Promise<ArrayBuffer | null>) {
    this.getLocalSong = callback
  }

  set playerStateHandler(callback: (state: PlayerState) => void) {
    this.onPlayerStateChangeCallback = callback
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

  private handleStreamChannel(channel: RTCDataChannel) {
    let fragmentReceiver = new FragmentReceiver(this.onRemoteStreamCallback)

    channel.onopen = (event) => {
      console.log('open stream channel', event)
    }

    channel.onmessage = (event) => {
      fragmentReceiver.receive(event.data)
    }

    channel.onclose = (event) => {
      console.log('stream closed', event)
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
    })
  }

  // Broadcaster

  private makeOffer(id: string, peer: RTCPeerConnection) {
    // Send offer to signalling server
    peer
      .createOffer()
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

  private sendTrackMetadata(trackInfo: Song | null) {
    if (trackInfo) {
      this.socketConnection.emit('trackMetadata', this.stripSongInfo(trackInfo))
    }
  }

  private emitCover(cover: ArrayBuffer, id: string) {
    if (cover) {
      let fragmentSender = new FragmentSender(cover, this.peerConnection[id].coverChannel!)
      fragmentSender.send()
    }
  }

  private sendStream(id: string, stream: ArrayBuffer | null) {
    const fragmentSender = new FragmentSender(stream, this.peerConnection[id].streamChannel!)
    fragmentSender.send()
  }

  public PlaySong(song: Song) {
    this.sendTrackMetadata(song)

    if (this.getLocalCover) {
      this.getLocalCover().then((cover) => {
        if (cover) {
          for (const i in this.peerConnection) {
            this.emitCover(cover, i)
          }
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

  private listenPreFetch() {
    this.socketConnection.on('addToPrefetch', (id: string, song: Song) => {
      this.onPrefetchAddedCallback ? this.onPrefetchAddedCallback(id, song) : null
    })

    this.socketConnection.on('setPrefetch', (prefetch: { [key: string]: Song[] }) => {
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

  private checkAllReady() {
    console.log(this.readyPeers.length, Object.keys(this.peerConnection).length)
    if (this.readyPeers.length == Object.keys(this.peerConnection).length) {
      this.socketConnection.emit('playSong')
      this.readyPeers = []
      this.onPlayerStateChangeCallback ? this.onPlayerStateChangeCallback(PlayerState.PLAYING) : null
    }
  }

  private listenPlayerState() {
    this.socketConnection.on('playSong', () => {
      this.onPlayerStateChangeCallback ? this.onPlayerStateChangeCallback(PlayerState.PLAYING) : null
    })
  }

  public requestSong(id: string, songID: string) {
    this.socketConnection.emit('requestSong', id, songID)
  }

  public addToQueue(song: Song) {
    this.socketConnection.emit('prefetch', song)
  }

  public emitReady() {
    console.log('ready')
    this.socketConnection.emit('ready')
  }

  private stripSongInfo(song: Song): Song {
    let tmp = deepCopy(song)
    delete tmp.path
    tmp.album ? delete tmp.album?.album_coverPath : null

    return tmp
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
  }
}
