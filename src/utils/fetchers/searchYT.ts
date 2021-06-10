import { YoutubeItem } from '@/models/youtube'
import YoutubeMusicApi from 'youtube-music-api'

class YTScraper {
  private YTMusic: YoutubeMusicApi

  constructor() {
    this.YTMusic = new YoutubeMusicApi()
    this.YTMusic.initalize()
  }
  public async searchTerm(term: string): Promise<YoutubeItem[]> {
    const results = await this.YTMusic.search(term, 'song')
    const final: YoutubeItem[] = []
    results.content.forEach((item) => {
      final.push({
        _id: item.videoId,
        yt_title: item.name,
        yt_album: item.album.name,
        yt_artist: item.artist.name,
        yt_coverImage: item.thumbnails.length > 0 ? item.thumbnails[0].url : '',
        duration: item.duration / 1000,
      })
    })
    return final
  }
}

export const ytScraper = new YTScraper()
