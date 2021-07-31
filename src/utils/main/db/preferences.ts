import Store from 'electron-store'
import { app } from 'electron'
import { enableStartup } from '../autoLaunch';
import path from 'path'
import { preferencesChanged } from '@/utils/main/ipc/preferences'
import { scannerChannel } from '../ipc';
import { setMinimizeToTray } from '../../../background';

export const store = new Store()

export const defaultPreferences: Preferences = {
  musicPaths: [],
  thumbnailPath: path.join(app.getPath('appData'), app.getName(), '.thumbnails'),
  artworkPath: path.join(app.getPath('appData'), app.getName(), '.thumbnails'),
  interface: []
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

export async function setInitialInterfaceSettings() {
  onPreferenceChanged('interface', (await loadPreferences()).interface)
}

export async function onPreferenceChanged(key: string, value: any) {
  if (key === 'interface') {
    for (const val of value) {
      if (val.key === 'startOnStartup') {
        val.enabled !== undefined && enableStartup(val.enabled)
      }

      if (val.key === 'minimizeToTray') {
        val.enabled !== undefined && setMinimizeToTray(val.enabled)
      }
    }
    return
  }

  if (key === 'musicPaths') {
    scannerChannel.ScanSongs()
    return
  }
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
