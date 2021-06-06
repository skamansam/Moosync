import { mainWindow } from '@/background';
import { WindowEvents } from "../../ipc/main/constants";

export class OAuthHandler {
  public handleEvents(data: string) {
    mainWindow.webContents.send(WindowEvents.LISTEN_OAUTH_EVENT, data)
  }
}