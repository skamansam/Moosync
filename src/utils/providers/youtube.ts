import { AuthFlow, AuthStateEmitter } from '@/utils/oauth/ui/flow'
import { once } from 'events'
import { ApiResources, SearchObject, ResponseType, UserPlaylists, PlaylistItems, VideoDetails } from './responsesYoutube'
import { Playlist } from '@/models/playlists'
import { Song } from '@/models/songs'
import moment from 'moment'
import { setupCache } from 'axios-cache-adapter'
import qs from 'qs'
import localforage from 'localforage'
import axios from 'axios';
import { GenericProvider } from '@/utils/providers/genericProvider';
import { cache } from '@/utils/providers/genericProvider';

const BASE_URL = 'https://youtube.googleapis.com/youtube/v3/'
export class Youtube extends GenericProvider {
  private auth = new AuthFlow('youtube')

  private api = axios.create({
    adapter: cache.adapter,
    baseURL: BASE_URL,
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
  })

  public get loggedIn() {
    return this.auth.loggedIn()
  }

  public async login() {
    if (!this.loggedIn) {
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
    const resp = await this.api(resource, {
      params: search.params,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })

    return resp.data
  }

  public async getUserDetails(): Promise<string | undefined> {
    const validRefreshToken = await this.auth.hasValidRefreshToken()
    if (this.auth.loggedIn() || validRefreshToken) {
      const resp = await this.populateRequest(ApiResources.CHANNELS, {
        params: {
          part: ['id', 'snippet'],
          mine: true,
        }
      })
      return resp.items[0].snippet!.title
    }
  }

  private async parsePlaylists(items: UserPlaylists.Item[]): Promise<Playlist[]> {
    const playlists: Playlist[] = []
    if (items.length > 0) {
      for (const p of items) {
        if (p.snippet)
          playlists.push({
            playlist_id: `youtube-${p.id}`,
            playlist_name: p.snippet.title,
            playlist_coverPath: (p.snippet.thumbnails.maxres ?? p.snippet.thumbnails.high ?? p.snippet.thumbnails.default).url,
            playlist_song_count: -1
          })
      }
    }
    return playlists
  }

  public async getUserPlaylists() {
    const validRefreshToken = await this.auth.hasValidRefreshToken()
    if (this.auth.loggedIn() || validRefreshToken) {
      let nextPageToken: string | undefined
      const parsed: UserPlaylists.Item[] = []
      do {

        const resp = await this.populateRequest(ApiResources.PLAYLISTS, {
          params: {
            part: ['id', 'snippet'],
            mine: true,
            maxResults: 50,
            pageToken: nextPageToken
          }
        })
        parsed.push(...resp.items)
      } while (nextPageToken)
      return this.parsePlaylists(parsed)
    }
    return []
  }

  private async parsePlaylistItems(items: PlaylistItems.Items[]): Promise<Song[]> {
    const songs: Song[] = []
    if (items.length > 0) {
      const ids = items.map(s => s.snippet!.resourceId.videoId)
      const details = await this.getSongDetails(...ids)
      songs.push(...details)
    }
    return songs
  }

  public async getPlaylistContent(id: string) {
    const validRefreshToken = await this.auth.hasValidRefreshToken()
    if (this.auth.loggedIn() || validRefreshToken) {
      let nextPageToken: string | undefined
      const parsed: PlaylistItems.Items[] = []
      do {
        const resp = await this.populateRequest(ApiResources.PLAYLIST_ITEMS, {
          params: {
            part: ['id', 'snippet'],
            playlistId: id,
            maxResults: 50,
            pageToken: nextPageToken
          }
        })
        nextPageToken = resp.nextPageToken
        parsed.push(...resp.items)
      } while (nextPageToken)
      return this.parsePlaylistItems(parsed)
    }
    return []
  }

  private async parseVideo(items: VideoDetails.Item[]) {
    const songs: Song[] = []
    for (const v of items) {
      if (songs.findIndex((value) => value._id === v.id) === -1)
        songs.push({
          _id: v.id,
          title: v.snippet.title,
          artists: [v.snippet.channelTitle],
          album: {
            album_coverPath: (v.snippet.thumbnails.maxres ?? v.snippet.thumbnails.high ?? v.snippet.thumbnails.default).url
          },
          date: new Date(v.snippet.publishedAt).toISOString().slice(0, 10),
          duration: moment.duration(v.contentDetails.duration).asSeconds(),
          url: v.id,
          type: 'YOUTUBE'
        })
    }
    return songs
  }

  public async getSongDetails(...id: string[]) {
    const validRefreshToken = await this.auth.hasValidRefreshToken()
    if (this.auth.loggedIn() || validRefreshToken) {
      const parsed: VideoDetails.Item[] = []
      const totalPages = ((id.length / 50))
      let curPage = 0
      while (curPage <= totalPages) {
        const resp = await this.populateRequest(ApiResources.VIDEO_DETAILS, {
          params: {
            part: ['contentDetails', 'snippet'],
            id: [...id.slice(curPage * 50, curPage * 50 + 50)],
            maxResults: 50,
          }
        })
        parsed.push(...resp.items)
        curPage++
      }
      return this.parseVideo(parsed)
    }
    return []
  }
}