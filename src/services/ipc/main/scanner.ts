import { IpcChannelInterface } from '.'
import { IpcEvents } from './constants'
import { IpcMainEvent } from 'electron'
import { IpcRequest } from './index'
import { MusicScanner } from '../../files/scanner'
import { CoverScraper } from '../../files/scrapeArtists'

export class ScannerChannel implements IpcChannelInterface {
  name = IpcEvents.SCAN_MUSIC

  handle(event: IpcMainEvent, request: IpcRequest) {
    if (request.params) {
      console.log('started')
      const scanner = new MusicScanner(...request.params)
      scanner.start().then(() => {
        event.reply(request.responseChannel, { status: 'done' })
        let coverScraper = new CoverScraper()
        coverScraper.fetchMBIDs().then((results: any[]) => {
          console.log(results.filter((result: any[]) => result))
          coverScraper.fetchArtworks().then((results: any[]) => {
            console.log('hello')
            console.log(results.filter((result: any[]) => result))
          })
        })
      })
    }
  }
}
