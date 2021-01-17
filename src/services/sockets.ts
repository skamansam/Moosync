export namespace Sockets {
  const connectionOptions = {
    'force new connection': true,
    reconnectionAttempts: 'Infinity', // avoid having user reconnect manually in order to prevent dead clients after a server restart
    timeout: 10000, // before connect_error and connect_timeout are emitted.
    transports: ['websocket'],
  }
  class BaseSocketConnection {
    protected socket: any
    private url: string

    constructor(url?: string) {
      this.url = url == undefined ? 'http://192.168.0.18:4000' : url
      this.socket = require('socket.io-client').connect(this.url, connectionOptions)
    }
    public onConnect(callback: Function): void {
      callback()
    }

    public onRoomJoined(callback: Function): void {
      this.socket.on('joinedRoom', (roomID: string) => {
        callback(roomID)
      })
    }

    public disconnectListener(callback: Function) {
      this.socket.on('disconnectPeer', (id: string) => {
        callback(id)
      })
    }

    public close() {
      this.socket.removeAllListeners()
      this.socket.disconnect()
    }

    public listenCandidate(callback: Function): void {
      this.socket !== undefined
        ? this.socket.on('candidate', (id: string, candidate: RTCIceCandidate) => {
            callback(id, candidate)
          })
        : null
    }

    public emitCandidate(id: string, candidate: RTCIceCandidate): void {
      this.socket !== undefined ? this.socket.emit('candidate', id, candidate) : null
    }
  }

  export class BroadcasterSocket extends BaseSocketConnection {
    constructor(url?: string) {
      super(url)
    }

    public createRoom() {
      this.socket.emit('room')
    }

    public listenNegotiationRequest(callback: Function): void {
      this.socket.on('requestedNegotiation', (id: string) => {
        callback(id)
      })
    }

    public emitOffer(id: string, description: RTCSessionDescription): void {
      this.socket !== undefined ? this.socket.emit('offer', id, description) : null
    }

    public emitBroadcaster(): void {
      this.socket.emit('broadcaster')
    }

    public listenWatcher(callback: Function): void {
      this.socket.on('watcher', (id: string) => {
        callback(id)
      })
    }

    public listenAnswer(callback: Function): void {
      this.socket !== undefined
        ? this.socket.on('answer', (id: string, description: RTCSessionDescription) => {
            callback(id, description)
          })
        : null
    }
  }

  export class WatcherSocket extends BaseSocketConnection {
    constructor(url?: string) {
      super(url)
    }

    public joinRoom(id: string): void {
      this.socket.emit('room', id)
    }

    public emitWatcher(): void {
      this.onConnect(() => this.socket.emit('watcher'))
    }

    public emitNeedNegotiation(id: string): void {
      this.socket.emit('needNegotiation', id)
    }

    public emitAnswer(id: string, description: RTCSessionDescription): void {
      this.socket.emit('answer', id, description)
    }

    public listenBroadcaster(callback: Function): void {
      this.socket.on('broadcaster', () => {
        callback()
        this.emitWatcher()
      })
    }

    public listenOffer(callback: Function): void {
      this.socket.on('offer', callback)
    }
  }
}
