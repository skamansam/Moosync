import { ChildProcess, fork } from 'child_process'

import { SongDB } from '@/utils/main/db/index';
import { app } from 'electron'
import path from 'path'

class ExtensionHost {
  private sandboxProcess: ChildProcess

  constructor() {
    this.sandboxProcess = this.createExtensionHost()
    this.registerListeners()
  }

  private createExtensionHost() {
    return fork(__dirname + '/sandbox.js')
  }

  private registerListeners() {
    this.sandboxProcess.on("message", this.parseMessage)
    this.send({
      type: 'app-path',
      data: path.join(app.getPath('appData'), app.getName(), 'extensions')
    })
  }

  private parseMessage(data: mainHostMessage) {
    if (data.type === 'get-all-songs') {
      SongDB.getAllSongs().then((songs) => this.send({ type: data.type, data: songs }))
    }
  }

  public send(message: extensionHostMessage) {
    this.sandboxProcess.send(message)
  }
}

export const extensionHost = new ExtensionHost()


