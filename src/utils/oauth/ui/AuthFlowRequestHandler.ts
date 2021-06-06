import { AuthorizationError, AuthorizationRequest, AuthorizationRequestHandler, AuthorizationRequestResponse, AuthorizationResponse, AuthorizationServiceConfiguration, BasicQueryStringUtils, QueryStringUtils } from "@openid/appauth";
import { WebCrypto } from "./crypto_utils";
import { Crypto } from '@openid/appauth'
import EventEmitter from 'events';

class ServerEventsEmitter extends EventEmitter {
  static ON_AUTHORIZATION_RESPONSE = 'authorization_response';
}

export class AuthFlowRequestHandler extends AuthorizationRequestHandler {
  private authorizationPromise: Promise<AuthorizationRequestResponse | null> | null = null;

  constructor(
    utils: QueryStringUtils = new BasicQueryStringUtils(),
    crypto: Crypto = new WebCrypto()) {
    super(utils, crypto);
  }


  performAuthorizationRequest(configuration: AuthorizationServiceConfiguration, request: AuthorizationRequest): void {

    const emitter = new ServerEventsEmitter();

    window.WindowUtils.registerOAuthCallback((data) => {
      const searchParams = new URL(data).searchParams;

      const state = searchParams.get('state') || undefined;
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (!state && !code && !error) {
        return;
      }

      let authorizationResponse: AuthorizationResponse | null = null;
      let authorizationError: AuthorizationError | null = null;
      if (error) {
        // get additional optional info.
        const errorUri = searchParams.get('error_uri') || undefined;
        const errorDescription = searchParams.get('error_description') || undefined;
        authorizationError = new AuthorizationError(
          { error: error, error_description: errorDescription!, error_uri: errorUri!, state: state! });
      } else {
        authorizationResponse = new AuthorizationResponse({ code: code!, state: state! });
      }
      const completeResponse = {
        request,
        response: authorizationResponse,
        error: authorizationError
      } as AuthorizationRequestResponse;
      emitter.emit(ServerEventsEmitter.ON_AUTHORIZATION_RESPONSE, completeResponse);
    });

    this.authorizationPromise = new Promise<AuthorizationRequestResponse>((resolve) => {
      emitter.once(ServerEventsEmitter.ON_AUTHORIZATION_RESPONSE, (result: any) => {
        window.WindowUtils.deregisterOAuthCallback()
        // resolve pending promise
        resolve(result as AuthorizationRequestResponse);
        // complete authorization flow
        this.completeAuthorizationRequestIfPossible();
      });
    })

    window.WindowUtils.openExternal(this.buildRequestUrl(configuration, request))
  }
  protected completeAuthorizationRequest(): Promise<AuthorizationRequestResponse | null> {
    if (!this.authorizationPromise) {
      return Promise.reject(
        'No pending authorization request. Call performAuthorizationRequest() ?');
    }

    return this.authorizationPromise;
  }
}