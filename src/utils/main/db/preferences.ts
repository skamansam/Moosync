import Store from 'electron-store'
import { app } from 'electron'
import path from 'path'
import { preferencesChanged } from '@/utils/main/ipc/preferences'

export const store = new Store()

export const defaultPreferences: Preferences = {
  musicPaths: [],
  thumbnailPath: path.join(app.getPath('appData'), app.getName(), '.thumbnails'),
  artworkPath: path.join(app.getPath('appData'), app.getName(), '.thumbnails'),
}

export async function savePreferences(prefs: Preferences) {
  const jsonStr = JSON.stringify(prefs)
  store.set('prefs', jsonStr)

  // Notify the mainwindow of preference changes
  preferencesChanged()
}

export async function saveSelectivePreference(key: string, value: any, isExtension?: boolean) {
  store.set(`prefs.${isExtension ? 'extension.' : ''}${key}`, value)
  if (!isExtension)
    preferencesChanged()
}

export async function loadSelectivePreference(key?: string, isExtension?: boolean, defaultValue?: any) {
  return store.get(`prefs.${isExtension ? 'extension.' : ''}${key}`, defaultValue)
}

function validatePrefs(prefs: Preferences): Preferences {
  if (!prefs.musicPaths) {
    prefs.musicPaths = defaultPreferences.musicPaths
  }

  if (!prefs.thumbnailPath) {
    prefs.thumbnailPath = defaultPreferences.thumbnailPath
  }

  if (!prefs.artworkPath) {
    prefs.artworkPath = defaultPreferences.artworkPath
  }

  return prefs
}

export async function loadPreferences(): Promise<Preferences> {
  const tmp = store.get('prefs') as Preferences
  if (tmp) {
    return validatePrefs(tmp)
  }
  return defaultPreferences
}

export function getDisabledPaths(paths: togglePaths): string[] {
  const disablePaths = []
  for (const p of paths) {
    if (!p.enabled) disablePaths.push(p.path)
  }
  return disablePaths
}
