import localforage from 'localforage'
import { setupCache } from 'axios-cache-adapter'

export const forageStore = localforage.createInstance({
  driver: [
    localforage.INDEXEDDB,
  ],
  name: 'yt-cache'
})

export const cache = setupCache({
  maxAge: 15 * 60 * 1000,
  store: forageStore,
  exclude: { query: false }
})


export abstract class GenericProvider {
  public abstract get loggedIn(): boolean

  public abstract login(): Promise<any>

  public abstract signOut(): Promise<void>

  public abstract getUserDetails(): Promise<string | undefined>

  public abstract getUserPlaylists(): Promise<Playlist[]>

  public abstract getUserPlaylist(str: string, isUrl?: boolean): Promise<Playlist | undefined>

  public abstract getPlaylistContent(id: string, isUrl?: boolean): AsyncGenerator<Song[]>

  public abstract matchPlaylist(str: string): boolean

  public abstract getPlaybackUrlAndDuration(song: Song): Promise<{ url: string, duration: number } | undefined>

  public abstract getSongDetails(url: string): Promise<Song | undefined>
}