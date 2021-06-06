import { AuthFlow, AuthStateEmitter } from '@/utils/oauth/ui/flow';
import { once } from 'events';
import { ApiResources, SearchObject, ResponseType } from './responses';

const BASE_URL = 'https://youtube.googleapis.com/youtube/v3/'
export class Youtube {
  private auth = new AuthFlow('youtube')

  public async login() {
    if (!this.auth.loggedIn()) {
      let validRefreshToken = await this.auth.hasValidRefreshToken()
      if (validRefreshToken) {
        await this.auth.performWithFreshTokens()
        return
      }
      this.auth.makeAuthorizationRequest();
      return once(this.auth.authStateEmitter, AuthStateEmitter.ON_TOKEN_RESPONSE)
    }
  }

  private async populateRequest<K extends ApiResources>(resource: K, search: SearchObject<K>): Promise<ResponseType<K>> {
    const url = new URL(resource, BASE_URL)
    for (const p in search.params) {
      url.searchParams.append(p, (search.params as any)[p])
    }

    let accessToken = await this.auth.performWithFreshTokens()

    const resp = await fetch(url.toString(), {
      headers: new Headers({ 'Authorization': `Bearer ${accessToken}` }),
      method: 'GET',
      cache: 'no-cache'
    })

    let json = await resp.json()
    return json
  }

  public async getUserDetails() {
    let validRefreshToken = await this.auth.hasValidRefreshToken()
    if (this.auth.loggedIn() || validRefreshToken) {
      return this.populateRequest(ApiResources.CHANNELS, {
        params: {
          part: ['id', 'snippet'],
          mine: true,
        }
      })
    }
  }
}