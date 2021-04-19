import { Preferences, defaultPreferences } from '@/utils/db/constants'
import { createModule, mutation } from 'vuex-class-component'

export enum PeerMode {
  WATCHER,
  BROADCASTER,
  UNDEFINED,
}

const VuexModule = createModule({
  namespaced: 'player',
})

export class PreferenceStore extends VuexModule {
  preferences: Preferences = defaultPreferences
  pathsChanged: boolean = false

  @mutation
  setPreferences(preferences: Preferences) {
    this.preferences = preferences
  }

  @mutation
  togglePath(args: { path: string; value: boolean }) {
    let index = this.preferences.musicPaths.findIndex((x) => x.path === args.path)
    if (index !== -1) {
      this.preferences.musicPaths[index].enabled = args.value
    }
  }

  @mutation
  setPathsChanged(value: boolean) {
    this.pathsChanged = value
  }

  @mutation
  addPaths(...paths: string[]) {
    for (let p of paths) {
      this.preferences.musicPaths.push({ path: p, enabled: true })
    }
  }

  @mutation
  removePath(path: string) {
    this.preferences.musicPaths.splice(
      this.preferences.musicPaths.findIndex((x) => x.path === path),
      1
    )
  }
}
