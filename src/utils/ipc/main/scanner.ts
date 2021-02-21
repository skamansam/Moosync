import { CoverScraper } from '../../files/scrapeArtists'
import { IpcChannelInterface } from '.'
import { IpcMainEvent } from 'electron'
import { IpcRequest } from './index'
import { MusicScanner } from '../../files/scanner'
import { ScannerEvents } from './constants'

export class ScannerChannel implements IpcChannelInterface {
  name = ScannerEvents.SCAN_MUSIC

  handle(event: IpcMainEvent, request: IpcRequest) {
    switch (request.type) {
      case ScannerEvents.SCAN_MUSIC:
        this.ScanSongs(event, request)
        break
    }
  }

  private ScanSongs(event: IpcMainEvent, request: IpcRequest) {
    if (request.params) {
      const scanner = new MusicScanner(...request.params)
      scanner.start().then(() => {
        event.reply(request.responseChannel, { status: 'done' })
        this.ScrapeCovers()
      })
    }
  }

  private ScrapeCovers() {
    let coverScraper = new CoverScraper()
    coverScraper.fetchMBIDs().then((results: any[]) => {
      console.log(results.filter((result: any[]) => result))
      coverScraper.fetchArtworks().then((results: any[]) => {
        console.log(results.filter((result: any[]) => result))
      })
    })
  }
}
