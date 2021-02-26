import { Module, Mutation, VuexModule } from 'vuex-class-modules'
import { Preferences, defaultPreferences } from '@/utils/db/constants'

import store from '.'

export enum PeerMode {
  WATCHER,
  BROADCASTER,
  UNDEFINED,
}

@Module
class Preference extends VuexModule {
  preferences: Preferences = defaultPreferences

  @Mutation
  setPreferences(preferences: Preferences) {
    this.preferences = preferences
  }

  @Mutation
  togglePath(args: { path: string; value: boolean }) {
    let index = this.preferences.musicPaths.findIndex((x) => x.path === args.path)
    if (index !== -1) {
      this.preferences.musicPaths[index].enabled = args.value
    }
  }

  @Mutation
  addPaths(...paths: string[]) {
    for (let p of paths) {
      this.preferences.musicPaths.push({ path: p, enabled: true })
    }
  }

  @Mutation
  removePath(path: string) {
    this.preferences.musicPaths.splice(
      this.preferences.musicPaths.findIndex((x) => x.path === path),
      1
    )
  }
}

export const PreferencesModule = new Preference({ store, name: 'preferences' })
