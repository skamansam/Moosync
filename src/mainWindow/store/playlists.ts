import { VuexModule } from './module'

export class PlaylistStore extends VuexModule.With({ namespaced: 'playlist' }) {
  public playlists: playlistInfo = {}
  public updated: boolean = false
}
