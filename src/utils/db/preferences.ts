import { Preferences, defaultPreferences, musicPaths } from './constants'

import { preferencesChanged } from '../ipc/main/preferences'
import Store from 'electron-store'

export const store = new Store()

export async function savePreferences(prefs: Preferences) {
  let jsonStr = JSON.stringify(prefs)
  store.set('prefs', jsonStr)

  // Notify the mainwindow of preference changes
  preferencesChanged()
}

export async function loadPreferences() {
  let tmp = store.get('prefs')
  if (tmp) return JSON.parse(tmp as string)
  return defaultPreferences
}

export function getDisabledPaths(paths: musicPaths): string[] {
  let disablePaths = []
  for (let p of paths) {
    if (!p.enabled) disablePaths.push(p.path)
  }
  return disablePaths
}
