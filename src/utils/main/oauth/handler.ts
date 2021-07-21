import { WindowEvents } from "@/utils/main/ipc/constants"
import { mainWindow } from '@/background'

export class OAuthHandler {
  public handleEvents(data: string) {
    mainWindow.webContents.send(WindowEvents.LISTEN_OAUTH_EVENT, data)
    mainWindow.focus()
  }
}