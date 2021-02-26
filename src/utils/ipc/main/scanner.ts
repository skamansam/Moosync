import { IpcEvents, ScannerEvents } from './constants'

import { CoverScraper } from '../../files/scrapeArtists'
import { IpcChannelInterface } from '.'
import { IpcMainEvent } from 'electron'
import { IpcRequest } from './index'
import { MusicScanner } from '../../files/scanner'
import { loadPreferences } from '@/utils/db/preferences'

export class ScannerChannel implements IpcChannelInterface {
  name = IpcEvents.SCANNER
  handle(event: IpcMainEvent, request: IpcRequest) {
    switch (request.type) {
      case ScannerEvents.SCAN_MUSIC:
        this.ScanSongs(event, request)
        break
    }
  }

  private ScanSongs(event: IpcMainEvent, request: IpcRequest) {
    loadPreferences()
      .then((preferences) => {
        const scanner = new MusicScanner(...preferences.musicPaths)
        console.log(preferences)
        scanner
          .start()
          .then(() => {
            event.reply(request.responseChannel, { status: 'done' })
            this.ScrapeCovers()
          })
          .catch((err) => console.log(err))
      })
      .catch((err) => console.log(err))
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
