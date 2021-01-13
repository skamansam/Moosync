import { config, connectionOptions } from '@/utils/socketBroadcast'

export namespace Sockets {
  class LazySocketConnection {
    protected socket: any = null
    private url: string

    protected initialize(): void {
      this.socket = require('socket.io-client').connect(this.url, connectionOptions)
    }

    protected isInitialized(): Error | null {
      let err = null
      if (this.socket === null) {
        try {
          this.initialize()
        } catch (error) {
          err = error
        }
      }
      return err
    }

    public onConnect(callback: Function): void {
      callback()
    }

    public disconnectListener(callback: Function) {
      this.socket.on('disconnectPeer', (id: string) => {
        callback(id)
      })
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

    constructor(url?: string) {
      this.url = url == undefined ? 'http://localhost:4000' : url
    }
  }

  export class LazyBroadcasterSocket extends LazySocketConnection {
    constructor(url?: string) {
      super(url)
    }

    public emitOffer(id: string, description: RTCSessionDescription): void {
      this.socket !== undefined ? this.socket.emit('offer', id, description) : null
    }

    public emitBroadcaster(): Error | null {
      let err = this.isInitialized()
      if (err === null) {
        this.socket.emit('broadcaster')
      }
      return err
    }

    public listenWatcher(callback: Function): Error | null {
      let err = this.isInitialized()
      if (err === null) {
        this.socket.on('watcher', (id: string) => {
          callback(id)
        })
      }
      return err
    }

    public listenAnswer(callback: Function): void {
      this.socket !== undefined
        ? this.socket.on('answer', (id: string, description: RTCSessionDescription) => {
            callback(id, description)
          })
        : null
    }
  }

  export class LazyWatcherSocket extends LazySocketConnection {
    public emitWatcher(): void {
      this.onConnect(() => this.socket.emit('watcher'))
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
      this.isInitialized()
      this.socket.on('offer', callback)
    }
  }
}
