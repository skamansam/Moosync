import { IpcChannelInterface } from './main'
import { IpcEvents } from './main/constants'
import { IpcMainEvent } from 'electron'
import { IpcRequest } from './main/index'
import { MusicScanner } from '../files/scanner'

export class ScannerChannel implements IpcChannelInterface {
  name = IpcEvents.SCAN_MUSIC

  handle(event: IpcMainEvent, request: IpcRequest) {
    if (request.params) {
      const scanner = new MusicScanner(...request.params)
      scanner.start()
    }
  }
}
