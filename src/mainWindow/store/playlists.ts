import { Module, Mutation, VuexModule } from 'vuex-class-modules'

import store from '@/commonStore'

export type playlistInfo = { [key: string]: string }

@Module
class Playlists extends VuexModule {
  private allPlaylists: playlistInfo = {}

  private playlistsUpdated: boolean = false

  get playlists(): playlistInfo {
    return this.allPlaylists
  }

  get updated() {
    return this.playlistsUpdated
  }

  @Mutation
  setPlaylists(playlists: playlistInfo) {
    this.allPlaylists = playlists
  }

  @Mutation
  setUpdated(updated: boolean) {
    this.playlistsUpdated = updated
  }
}

export const PlaylistModule = new Playlists({ store, name: 'playlists' })
