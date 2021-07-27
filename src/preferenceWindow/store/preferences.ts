import { createModule, mutation } from 'vuex-class-component';

import { vxm } from '../../preferenceWindow/store/index';

export enum PeerMode {
  WATCHER,
  BROADCASTER,
  UNDEFINED,
}

const VuexModule = createModule({
  strict: false,
  namespaced: 'preferences',
  enableLocalWatchers: true
})

export class PreferenceStore extends VuexModule {
  private preferences: Preferences | null = null
  private pathsChanged: boolean = false

  set Preferences(preferences: Preferences | null) {
    this.preferences = preferences
  }

  get Preferences() {
    return this.preferences
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

  get ThumbnailPath(): string | undefined {
    return this.preferences?.thumbnailPath
  }

  set ThumbnailPath(path: string | undefined) {
    if (this.preferences && path) {
      this.preferences.thumbnailPath = path
    }
  }

  get ArtworkPath(): string | undefined {
    return this.preferences?.artworkPath
  }

  set ArtworkPath(path: string | undefined) {
    if (this.preferences && path) {
      this.preferences.artworkPath = path
    }
  }

  set PathsChanged(value: boolean) {
    this.pathsChanged = value
  }

  get PathsChanged() {
    return this.pathsChanged
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

  static $watch = {
    ThumbnailPath(payload: string) {
      window.PreferenceUtils.saveSelective('thumbnailPath', payload)
    },
    ArtworkPath(payload: string) {
      window.PreferenceUtils.saveSelective('artworkPath', payload)
    },
  }

  static $subscribe = {
    addPaths() {
      if (vxm.preferences.Preferences)
        window.PreferenceUtils.saveSelective('musicPaths', vxm.preferences.Preferences.musicPaths)
    },
    removePath() {
      if (vxm.preferences.Preferences)
        window.PreferenceUtils.saveSelective('musicPaths', vxm.preferences.Preferences.musicPaths)
    },
    togglePath() {
      if (vxm.preferences.Preferences)
        window.PreferenceUtils.saveSelective('musicPaths', vxm.preferences.Preferences.musicPaths)
    }
  }
}
