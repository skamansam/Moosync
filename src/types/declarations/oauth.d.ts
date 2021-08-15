type oauthType = 'youtube' | 'spotify'
type config = { type: oauthType, openIdConnectUrl: string, clientId: string, redirectUri: string, scope: string, keytarService: string, oAuthChannel: string }