import { OAuth2Client } from 'google-auth-library';

export class YoutubeProvider {
  public oauth: OAuth2Client;

  constructor() {
    this.oauth = new OAuth2Client({
      clientId: '802830583043-er2mb5d1itikopg766g8kri8tfl8tlpt.apps.googleusercontent.com',
      redirectUri: 'moosync:/com.ytoauthcallback'
    })
  }

  public async authenticate(data: string) {
    let code = new URL(data).searchParams.get('code')
    if (code) {
      code = decodeURIComponent(code)
      console.log(code)
      const { tokens } = await this.oauth.getToken(code)
      console.log(tokens)
    }
  }
}