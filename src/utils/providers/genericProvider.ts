import { Playlist } from '@/models/playlists'
import { Song } from '@/models/songs'
import { setupCache } from 'axios-cache-adapter'
import localforage from 'localforage'

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

  public abstract getPlaylistContent(id: string): Promise<Song[]>
}