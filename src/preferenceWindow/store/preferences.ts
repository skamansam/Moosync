import { Preferences } from '@/utils/main/db/constants'
import { createModule, mutation, action } from 'vuex-class-component';

export enum PeerMode {
  WATCHER,
  BROADCASTER,
  UNDEFINED,
}

const VuexModule = createModule({
  namespaced: 'player',
})

export class PreferenceStore extends VuexModule {
  preferences: Preferences | null = null
  pathsChanged: boolean = false

  @mutation
  setPreferences(preferences: Preferences) {
    this.preferences = preferences
  }

  @mutation
  togglePath(args: { path: string, value: boolean }) {
    if (this.preferences) {
      const index = this.preferences.musicPaths.findIndex((x) => x.path === args.path)
      if (index !== -1) {
        this.preferences.musicPaths[index].enabled = args.value
      }
    }
  }

  @mutation
  setThumbnailPath(path: string) {
    if (this.preferences) {
      this.preferences.thumbnailPath = path
    }
  }

  @mutation
  setArtworkPath(path: string) {
    if (this.preferences) {
      this.preferences.artworkPath = path
    }
  }

  @mutation
  setPathsChanged(value: boolean) {
    this.pathsChanged = value
  }

  @mutation
  addPaths(...paths: string[]) {
    if (this.preferences) {
      for (const p of paths) {
        this.preferences.musicPaths.push({ path: p, enabled: true })
      }
    }
  }

  @mutation
  removePath(path: string) {
    if (this.preferences) {
      this.preferences.musicPaths.splice(
        this.preferences.musicPaths.findIndex((x) => x.path === path),
        1
      )
    }
  }
}
