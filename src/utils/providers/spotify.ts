import { AuthFlow, AuthStateEmitter } from '@/utils/oauth/ui/flow'
import { once } from 'events'
import { ApiResources, SearchObject, ResponseType } from './responsesSpotify'
import { Playlist } from '@/models/playlists'
import { Song } from '@/models/songs'
import qs from 'qs'
import axios, { AxiosResponse } from 'axios';
import { GenericProvider, cache } from '@/utils/providers/genericProvider';
import { UserPlaylists } from './responsesSpotify'
import { PlaylistItemsRequest, PlaylistItems } from '@/utils/providers/responsesSpotify';
import { forageStore } from './genericProvider';

const BASE_URL = 'https://api.spotify.com/v1/'

export class Spotify extends GenericProvider {
  private auth = new AuthFlow('spotify')

  private api = axios.create({
    adapter: cache.adapter,
    baseURL: BASE_URL,
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
  })

  public get loggedIn() {
    return this.auth.loggedIn()
  }

  public async login() {
    if (!this.auth.loggedIn()) {
      const validRefreshToken = await this.auth.hasValidRefreshToken()
      if (validRefreshToken) {
        await this.auth.performWithFreshTokens()
        return
      }
      this.auth.makeAuthorizationRequest()
      return once(this.auth.authStateEmitter, AuthStateEmitter.ON_TOKEN_RESPONSE)
    }
  }

  public async signOut() {
    this.auth.signOut()
  }

  private async populateRequest<K extends ApiResources>(resource: K, search: SearchObject<K>): Promise<ResponseType<K>> {
    const accessToken = await this.auth.performWithFreshTokens()

    let url: string = resource

    if (resource === ApiResources.PLAYLIST_ITEMS) {
      url = resource.replace('{playlist_id}', (search as PlaylistItemsRequest).params.playlist_id)
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

  private parsePlaylists(items: UserPlaylists.Item[]) {
    const parsed: Playlist[] = []
    for (const i of items) {
      parsed.push({
        playlist_id: `spotify-${i.id}`,
        playlist_name: i.name,
        playlist_coverPath: (i.images[0]) ? i.images[0].url : '',
        playlist_song_count: i.tracks.total
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

  public async spotifyToYoutube(item: Song) {
    const term = `${(item.artists) ? item.artists.join(' ') : ''} ${item.title}`
    const ytItem = await window.SearchUtils.searchYT(term)
    if (ytItem.length > 0)
      return ytItem[0]
  }

  private async parsePlaylistItems(items: PlaylistItems.Item[]) {
    const parsed: Song[] = []
    for (const i of items) {
      if (!i.is_local && parsed.findIndex((val) => val._id === i.track.id) === -1)
        parsed.push({
          _id: i.track.id,
          title: i.track.name,
          album: {
            album_name: i.track.album.name,
            album_coverPath: (i.track.album.images[0]) ? i.track.album.images[0].url : ''
          },
          artists: i.track.artists.map(artist => artist.name),
          duration: i.track.duration_ms,
          type: 'SPOTIFY'
        })
    }
    return parsed
  }

  public async getPlaylistContent(id: string): Promise<Song[]> {
    const validRefreshToken = await this.auth.hasValidRefreshToken()
    if (this.auth.loggedIn() || validRefreshToken) {

      // Return directly from cache
      let content = await this.getCachePlaylistContent(id)
      if (content) {
        return content;
      }

      const resp = await this.populateRequest(ApiResources.PLAYLIST_ITEMS, {
        params: {
          playlist_id: id
        }
      })
      content = await this.parsePlaylistItems(resp.items)
      this.setCachePlaylistContent(id, content)
      return content;
    }
    return []
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
}