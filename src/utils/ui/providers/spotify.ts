import { AuthFlow, AuthStateEmitter } from '@/utils/ui/oauth/flow';
import { GenericProvider, cache } from '@/utils/ui/providers/genericProvider';

import axios from 'axios';
import { forageStore } from './genericProvider';
import { once } from 'events';
import qs from 'qs';

const BASE_URL = 'https://api.spotify.com/v1/'

enum ApiResources {
  USER_DETAILS = 'me',
  PLAYLISTS = 'me/playlists',
  PLAYLIST = 'playlists/{playlist_id}',
  PLAYLIST_ITEMS = 'playlists/{playlist_id}/tracks',
  SONG_DETAILS = 'tracks/{song_id}'
}

export class SpotifyProvider extends GenericProvider {
  private auth = new AuthFlow('spotify')

  private api = axios.create({
    adapter: cache.adapter,
    baseURL: BASE_URL,
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'comma' })
  })

  public get loggedIn() {
    return this.auth.loggedIn()
  }

  public async login() {
    if (!this.auth.loggedIn() && this.auth.config) {
      const validRefreshToken = await this.auth.hasValidRefreshToken()
      if (validRefreshToken) {
        await this.auth.performWithFreshTokens()
        return
      }
      this.auth.makeAuthorizationRequest()
      return once(this.auth.authStateEmitter!, AuthStateEmitter.ON_TOKEN_RESPONSE)
    }
  }

  public async signOut() {
    this.auth.signOut()
  }

  private async populateRequest<K extends ApiResources>(resource: K, search: SpotifyResponses.SearchObject<K>): Promise<SpotifyResponses.ResponseType<K>> {
    const accessToken = await this.auth.performWithFreshTokens()

    let url: string = resource

    if (resource === ApiResources.PLAYLIST_ITEMS || resource === ApiResources.PLAYLIST) {
      url = resource.replace('{playlist_id}', (search as SpotifyResponses.PlaylistItemsRequest).params.playlist_id)
    }

    if (resource === ApiResources.SONG_DETAILS) {
      url = resource.replace('{song_id}', (search as SpotifyResponses.TrackItemRequest).params.song_id)
    }

    const resp = await this.api(url, {
      params: search.params,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })

    return resp.data
  }

  public async getUserDetails(): Promise<string | undefined> {
    const validRefreshToken = await this.auth.hasValidRefreshToken()
    if (this.auth.loggedIn() || validRefreshToken) {
      const resp = await this.populateRequest(ApiResources.USER_DETAILS, {
        params: undefined
      })

      return resp.display_name
    }
  }

  private parsePlaylists(items: SpotifyResponses.UserPlaylists.Item[]) {
    const parsed: Playlist[] = []
    for (const i of items) {
      parsed.push({
        playlist_id: `spotify-${i.id}`,
        playlist_name: i.name,
        playlist_coverPath: (i.images[0]) ? i.images[0].url : '',
        playlist_song_count: i.tracks.total,
        isRemote: true
      })
    }
    return parsed
  }

  public async getUserPlaylists(): Promise<Playlist[]> {
    const validRefreshToken = await this.auth.hasValidRefreshToken()
    if (this.auth.loggedIn() || validRefreshToken) {
      const resp = await this.populateRequest(ApiResources.PLAYLISTS, {
        params: {}
      })
      return this.parsePlaylists(resp.items)
    }
    return []
  }

  public async spotifyToYoutube(item: Song): Promise<YoutubeItem | undefined> {
    const term = `${(item.artists) ? item.artists.join(' ') : ''} ${item.title}`
    const ytItem = await window.SearchUtils.searchYT(term)
    if (ytItem.length > 0)
      return ytItem[0]
  }

  private parseSong(track: SpotifyResponses.PlaylistItems.Track): Song {
    return {
      _id: track.id,
      title: track.name,
      album: {
        album_name: track.album.name,
        album_coverPath_high: (track.album.images[0]) ? track.album.images[0].url : ''
      },
      url: track.id,
      song_coverPath_high: (track.album.images[0]) ? track.album.images[0].url : '',
      artists: track.artists.map(artist => artist.name),
      duration: track.duration_ms / 1000,
      type: 'SPOTIFY'
    }
  }

  private async parsePlaylistItems(items: SpotifyResponses.PlaylistItems.Item[]) {
    const parsed: Song[] = []
    for (const i of items) {
      if (!i.is_local && parsed.findIndex((val) => val._id === i.track.id) === -1)
        parsed.push(this.parseSong(i.track))
    }
    return parsed
  }

  public matchPlaylist(str: string) {
    return !!str.match(/^(https:\/\/open.spotify.com\/playlist\/|spotify:playlist:)([a-zA-Z0-9]+)(.*)$/)
  }

  private getIDFromURL(url: string) {
    const split = new URL(url).pathname.split('/')
    return split[split.length - 1]
  }

  public async * getPlaylistContent(str: string, isUrl = false): AsyncGenerator<Song[]> {
    let id: string | undefined = str

    if (isUrl) {
      id = this.getIDFromURL(str)
    }

    if (id) {
      const validRefreshToken = await this.auth.hasValidRefreshToken()
      if (this.auth.loggedIn() || validRefreshToken) {

        // Return directly from cache
        const content = await this.getCachePlaylistContent(id)
        if (content) {
          yield content
          return
        }

        let nextOffset: number = 0
        let isNext = false
        const limit = 100
        const parsed: Song[] = []
        do {
          const resp = await this.populateRequest(ApiResources.PLAYLIST_ITEMS, {
            params: {
              playlist_id: id,
              limit: limit,
              offset: nextOffset
            }
          })
          const items = await this.parsePlaylistItems(resp.items)
          parsed.push(...items)
          isNext = !!resp.next
          if (resp.next) {
            nextOffset += limit
          }
          yield items;
        } while (isNext)
        this.setCachePlaylistContent(id, parsed)
      }
    }
    return
  }

  private async getCachePlaylistContent(playlist_id: string) {
    const content = await forageStore.getItem<{ expires: number, data: Song[] }>(`spotify-playlist-${playlist_id}`)
    if (content && content.expires > Date.now())
      return content.data;
    return null
  }

  private async setCachePlaylistContent(playlist_id: string, items: Song[]) {
    // Cache for 1hr
    await forageStore.setItem(`spotify-playlist-${playlist_id}`, { expires: Date.now() + 1 * 60 * 60 * 5 * 1000, data: items })
  }

  public async getPlaybackUrlAndDuration(song: Song) {
    const ytItem = await this.spotifyToYoutube(song)
    if (ytItem) {
      return { url: ytItem._id, duration: ytItem.duration }
    }
  }

  public async getUserPlaylist(str: string, isUrl = false) {
    let id: string | undefined = str
    if (isUrl) {
      id = this.getIDFromURL(str)
    }

    if (id) {
      const validRefreshToken = await this.auth.hasValidRefreshToken()
      if (this.auth.loggedIn() || validRefreshToken) {
        const resp = await this.populateRequest(ApiResources.PLAYLIST, {
          params: {
            playlist_id: id,
          }
        })

        return this.parsePlaylists([resp])[0]
      }
    }
  }

  public async getSongDetails(url: string): Promise<Song | undefined> {
    if (url.match(/^(https:\/\/open.spotify.com\/track\/|spotify:track:)([a-zA-Z0-9]+)(.*)$/)) {
      const parsedURL = new URL(url)
      const split = parsedURL.pathname.split('/')
      const songID = split[split.length - 1]

      const validRefreshToken = await this.auth.hasValidRefreshToken()

      if (this.auth.loggedIn() || validRefreshToken) {
        const resp = await this.populateRequest(ApiResources.SONG_DETAILS, {
          params: {
            song_id: songID,
          }
        })
        if (resp) {
          const song = this.parseSong(resp)
          const yt = await this.spotifyToYoutube(song)
          if (yt) {
            song.playbackUrl = yt?._id
            return song
          } else {
            console.error('Couldn\'t find song on youtube')
          }
        }
        return
      }
    }
  }
}