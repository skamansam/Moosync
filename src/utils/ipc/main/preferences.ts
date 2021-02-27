import { IpcChannelInterface, IpcRequest } from '.'
import { IpcEvents, PreferenceEvents } from './constants'
import { loadPreferences, savePreferences } from '../../db/preferences'

import { mainWindow } from '@/background'

export class PreferenceChannel implements IpcChannelInterface {
  name = IpcEvents.PREFERENCES
  handle(event: Electron.IpcMainEvent, request: IpcRequest): void {
    switch (request.type) {
      case PreferenceEvents.LOAD_PREFERENCES:
        this.loadPreferences(event, request)
        break
      case PreferenceEvents.SAVE_PREFERENCES:
        this.savePreferences(event, request)
        break
    }
  }

  private loadPreferences(event: Electron.IpcMainEvent, request: IpcRequest) {
    loadPreferences()
      .then((data) => event.reply(request.responseChannel, data))
      .catch((e) => console.log(e))
  }

  private savePreferences(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.params.preferences) {
      savePreferences(request.params.preferences).then((data) => event.reply(request.responseChannel, data))
    }
  }
}

export function preferencesChanged() {
  mainWindow.webContents.send(PreferenceEvents.PREFERENCE_REFRESH)
}
