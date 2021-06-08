declare module 'youtube-music-api' {
  interface Thumbnails {
    height: number
    width: number
    url: string
  }

  interface Queryable {
    browseId: string
    name: string
  }

  interface SearchResult {
    content: {
      type: string
      videoId: string
      playlistId: string
      name: string
      artist: Queryable
      album: Queryable
      duration: number
      thumbnails: Thumbnails[]
      params: string
    }[]
    coninuation: {
      clickTrackingParams: string
      continuation: string
    }
  }
  export default class YoutubeMusicApi {
    // constructor()
    initalize(): Promise<{ locale: string, logged_in: string }>
    getSearchSuggestions(query: string): string[]
    search(query: string, categoryName: string, _pageLimit?: number): Promise<SearchResult>

    //TODO: Detailed definitions
    getAlbum(browseId: string): any
    getPlaylist(browseId: string, contentLimit?: number): any
    getArtist(browseId: string)
    getNext(videoId: string, playlistId: string, paramString: string)
  }
}
