import { YoutubeProvider } from "./youtubeHandler";
import { mainWindow } from '@/background';
import { WindowEvents } from "../ipc/main/constants";

export class OAuthHandler {
  public ytProvider = new YoutubeProvider()

  public handleEvents(data: string) {
    // this.ytProvider.authenticate(data)
    // oauthEventEmitter.emit('ytauthcallback', data)
    mainWindow.webContents.send(WindowEvents.LISTEN_OAUTH_EVENT, data)
  }
}