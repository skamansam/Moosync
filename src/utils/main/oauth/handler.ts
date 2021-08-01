import { WindowEvents } from "@/utils/main/ipc/constants"
import { WindowHandler } from '../windowManager';

export class OAuthHandler {
  public handleEvents(data: string) {
    WindowHandler.getWindow()?.webContents.send(WindowEvents.LISTEN_OAUTH_EVENT, data)
    WindowHandler.getWindow()?.focus()
  }
}