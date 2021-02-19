import { CoverScraper } from '../../files/scrapeArtists'
import { IpcChannelInterface } from '.'
import { IpcEvents } from './constants'
import { IpcMainEvent } from 'electron'
import { IpcRequest } from './index'
import { MusicScanner } from '../../files/scanner'

export class ScannerChannel implements IpcChannelInterface {
  name = IpcEvents.SCAN_MUSIC

  handle(event: IpcMainEvent, request: IpcRequest) {
    console.log(request)
    if (request.params) {
      console.log('started')
      const scanner = new MusicScanner(...request.params)
      scanner.start().then(() => {
        let coverScraper = new CoverScraper()
        event.reply(request.responseChannel, { status: 'done' })
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
