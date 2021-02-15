import axios from 'axios'
import { SongDB } from '../db'
import rateLimit from 'axios-rate-limit'
import { writeBuffer } from './scanner'
import { app } from 'electron'
import path from 'path'
import { v4 } from 'uuid'
import { createHash } from 'crypto'
import { artists } from '@/models/songs'
import axiosRetry from 'axios-retry'

export class CoverScraper {
  private musicbrainz = rateLimit(
    axios.create({
      baseURL: 'https://musicbrainz.org/ws/2/artist/',
      headers: { 'User-Agent': 'moosync/0.1.0 (ovenoboyo@gmail.com)' },
    }),
    {
      maxRequests: 1,
      perMilliseconds: 1250,
    }
  )
  constructor() {
    axiosRetry(axios, {
      retryDelay: (retryCount) => {
        return retryCount * 1000
      },
    })
  }

  private async queryMbid(name: string) {
    return this.musicbrainz.get(`/?limit=1&query=artist:${name.replace(' ', '%20').replace('.', '')}`)
  }

  private async getAndUpdateMbid(a: artists) {
    let data = await this.queryMbid(a.artist_name)
    if (data.data && data.data.artists.length > 0 && data.data.artists[0].id) {
      a.artist_mbid = data.data.artists[0].id
      await SongDB.updateArtists(a)
    }
  }

  public async fetchMBIDs() {
    let artists = await SongDB.getAllArtists()
    let promises: Promise<void>[] = []
    for (let a of artists) {
      if (!a.artist_mbid) {
        promises.push(this.getAndUpdateMbid(a))
      }
    }
    return Promise.all(promises.map((p) => p.catch((e) => e)))
  }

  private async queryArtistUrls(id: string) {
    return this.musicbrainz.get(`/${id}?inc=url-rels`)
  }

  private async fetchImagesRemote(a: artists) {
    if (a.artist_mbid) {
      let data = await this.queryArtistUrls(a.artist_mbid)
      if (data.data.relations) {
        for (let r of data.data.relations) {
          if (r.type == 'image') {
            return this.downloadImage(r.url.resource)
          }
        }
      }

      try {
        let url = await this.fetchFanartTv(a.artist_mbid)
        if (url) return this.downloadImage(url)
      } catch (e) {
        console.log('Fanart.tv not found')
      }
    }
    if (a.artist_name) {
      let url = await this.fetchTheAudioDB(a.artist_name)
      if (url) return this.downloadImage(url)
    }
  }

  private async fetchTheAudioDB(artist_name: string) {
    try {
      let data = await axios.get(`https://theaudiodb.com/api/v1/json/1/search.php?s=${artist_name.replace(' ', '%20')}`)
      if (data.data && data.data.artists && data.data.artists.length > 0) {
        for (let art in data.data.artists[0]) {
          if (art.includes('strArtistThumb') || art.includes('strArtistFanart')) {
            if (data.data.artists[0][art]) {
              return data.data.artists[0][art]
            }
          }
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  private async fetchFanartTv(mbid: string): Promise<string | undefined> {
    let data = await axios.get(`http://webservice.fanart.tv/v3/music/${mbid}?api_key=68746a37e506c5fe70c80e13dc84d8b2`)
    if (data.data) {
      return data.data.artistthumb ? data.data.artistthumb[0].url : undefined
    }
  }

  private async followWikimediaRedirects(fileName: string): Promise<string | undefined> {
    let data = (
      await axios.get(`https://commons.wikimedia.org/w/api.php?action=query&redirects=1&titles=${fileName}&format=json`)
    ).data.query
    let filename = ''
    for (let i in data.pages) {
      filename = data.pages[i].title.replace('File:', '').replace(/\s+/g, '_')
      break
    }
    if (filename) {
      var md5 = createHash('md5').update(filename).digest('hex')
      return `https://upload.wikimedia.org/wikipedia/commons/${md5[0]}/${md5[0] + md5[1]}/${filename}`
    }

    return undefined
  }

  private async parseScrapeUrl(url: string) {
    let parsed = new URL(url)
    switch (parsed.hostname) {
      case 'commons.wikimedia.org':
        return this.followWikimediaRedirects(url.substring(url.lastIndexOf('/') + 1))
    }
    return url
  }

  private async downloadImage(url: string) {
    let parsed = await this.parseScrapeUrl(url)
    if (parsed) {
      let data = await axios.get(parsed, { responseType: 'arraybuffer' })

      if (data.data) {
        let coverPath = path.join(app.getPath('appData'), app.getName(), 'cache', 'thumbs', `${v4()}.jpg`)
        await writeBuffer({
          path: coverPath,
          data: data.data,
        })
        return coverPath
      }
    }
  }

  private async queryArtwork(a: artists) {
    let data = (await this.fetchImagesRemote(a)) || (await SongDB.getDefaultCoverByArtist(a.artist_id))
    if (data) {
      a.coverPath = data
      await SongDB.updateArtists(a)
      return
    }
  }

  public async fetchArtworks() {
    let artists = await SongDB.getAllArtists()
    let promises: Promise<void>[] = []
    for (let a of artists) {
      if (!a.coverPath) {
        promises.push(this.queryArtwork(a))
      }
    }
    return Promise.all(promises.map((p) => p.catch((e) => e)))
  }
}
