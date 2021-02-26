import { Preferences, defaultPreferences, musicPaths } from './constants'

import { app } from 'electron'
import fs from 'fs'
import path from 'path'

export async function savePreferences(preferences: Preferences) {
  let jsonStr = JSON.stringify(preferences)
  fs.promises.writeFile(path.join(app.getPath('appData'), app.getName(), 'preferences.json'), jsonStr)
}

export async function loadPreferences() {
  if (fs.existsSync(path.join(app.getPath('appData'), app.getName(), 'preferences.json'))) {
    let data = await fs.promises.readFile(path.join(app.getPath('appData'), app.getName(), 'preferences.json'), 'utf8')
    return JSON.parse(data) as Preferences
  }
  return defaultPreferences as Preferences
}

export function getActiveMusicPaths(paths: musicPaths): string[] {
  let activePaths = []
  for (let i in paths) {
    if (paths[i].enabled) {
      activePaths.push(paths[i].path)
    }
  }
  return activePaths
}
