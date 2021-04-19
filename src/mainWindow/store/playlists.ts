import { VuexModule } from './module'

export type playlistInfo = { [key: string]: string }
export class PlaylistStore extends VuexModule.With({ namespaced: 'playlist' }) {
  public playlists: playlistInfo = {}
  public updated: boolean = false
}
