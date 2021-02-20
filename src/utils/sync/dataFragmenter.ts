const chunkLimit = 16384

interface fragmentedData {
  type: string
  message: any
}

export class FragmentSender {
  private data: any
  private byteLength: number
  private offset: number
  private byteEnd: number

  private channel: RTCDataChannel | null = null

  constructor(data: any, channel: RTCDataChannel) {
    this.channel = channel
    this.data = data
    this.byteLength = this.data.byteLength
    this.offset = 0
    this.byteEnd = this.byteLength <= chunkLimit ? this.byteLength : chunkLimit
  }

  private sendData() {
    if (this.offset < this.byteLength - 1) {
      this.channel!.send(this.data.slice(this.offset, this.byteEnd))

      this.offset = this.byteEnd
      this.byteEnd = this.offset + chunkLimit

      if (this.offset >= this.byteLength) {
        this.channel!.send(JSON.stringify({ type: 'end' }))
        this.channel!.onbufferedamountlow = null
      }

      if (this.byteEnd >= this.byteLength) {
        this.byteEnd = this.byteLength
      }
    }
  }

  public send() {
    let header = JSON.stringify({ type: 'byteLength', message: this.byteLength })
    this.channel!.send(header)
    this.channel!.bufferedAmountLowThreshold = chunkLimit - 1
    this.channel!.onbufferedamountlow = () => {
      this.sendData()
    }
    this.sendData()
  }
}

export class FragmentReceiver {
  private file: BlobPart[] = []
  private byteLength: number = 0

  private onDataReceivedCallback: ((data: Blob) => void) | null

  constructor(callback: ((data: Blob) => void) | null) {
    this.onDataReceivedCallback = callback
  }

  private endTransfer() {
    let file = new Blob(this.file)
    this.onDataReceivedCallback ? this.onDataReceivedCallback(file) : null
  }

  public receive(data: ArrayBuffer) {
    switch (typeof data) {
      case 'string':
        var tmp = JSON.parse(data) as fragmentedData
        switch (tmp.type) {
          case 'end':
            // TODO: End using byteLength instead
            this.endTransfer()
            break
          case 'byteLength':
            this.byteLength = tmp.message
            break
        }
        break
      case 'object':
        this.file.push(data)
        break
    }
  }
}
