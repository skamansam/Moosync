import { Preferences, defaultPreferences, musicPaths } from './constants'

import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { preferencesChanged } from '../ipc/main/preferences'

export var preferences: Preferences = defaultPreferences

export async function savePreferences(prefs: Preferences) {
  let jsonStr = JSON.stringify(prefs)
  fs.promises.writeFile(path.join(app.getPath('appData'), app.getName(), 'preferences.json'), jsonStr)
  preferences = prefs

  // Notify the mainwindow of preference changes
  preferencesChanged()
}

export async function loadPreferences() {
  if (fs.existsSync(path.join(app.getPath('appData'), app.getName(), 'preferences.json'))) {
    let data = await fs.promises.readFile(path.join(app.getPath('appData'), app.getName(), 'preferences.json'), 'utf8')
    preferences = JSON.parse(data)
    return preferences
  }
  return defaultPreferences
}

export function getDisabledPaths(paths: musicPaths): string[] {
  let disablePaths = []
  for (let p of paths) {
    if (!p.enabled) disablePaths.push(p.path)
  }
  return disablePaths
}
