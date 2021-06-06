/*
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import { AuthorizationRequest } from "@openid/appauth/built/authorization_request";
import {
  AuthorizationNotifier,
  AuthorizationRequestHandler
} from "@openid/appauth/built/authorization_request_handler";
import { AuthorizationServiceConfiguration } from "@openid/appauth/built/authorization_service_configuration";
import {
  GRANT_TYPE_AUTHORIZATION_CODE,
  GRANT_TYPE_REFRESH_TOKEN,
  TokenRequest
} from "@openid/appauth/built/token_request";
import {
  BaseTokenRequestHandler,
  TokenRequestHandler
} from "@openid/appauth/built/token_request_handler";
import {
  TokenResponse
} from "@openid/appauth/built/token_response";
import EventEmitter from 'events';

import { StringMap } from "@openid/appauth/built/types";
import { AuthFlowRequestHandler } from './AuthFlowRequestHandler';
import { WebCrypto } from "./crypto_utils";
import { NodeRequestor } from '@openid/appauth/built/node_support/node_requestor';

export class AuthStateEmitter extends EventEmitter {
  static ON_TOKEN_RESPONSE = "on_token_response";
}

type config = { openIdConnectUrl: string, clientId: string, redirectUri: string, scope: string, keytarService: string }
type oauthType = 'youtube'

const requestor = new NodeRequestor();

export class AuthFlow {
  private notifier: AuthorizationNotifier;
  private authorizationHandler: AuthorizationRequestHandler;
  private tokenHandler: TokenRequestHandler;
  readonly authStateEmitter: AuthStateEmitter;

  // state
  private configuration: AuthorizationServiceConfiguration | undefined;

  private refreshToken: string | undefined;
  private accessTokenResponse: TokenResponse | undefined;

  private config: config

  private fetchedToken: Promise<void>

  constructor(type: oauthType) {
    this.config = this.generateConfig(type)

    this.notifier = new AuthorizationNotifier();
    this.authStateEmitter = new AuthStateEmitter();

    this.authorizationHandler = new AuthFlowRequestHandler();

    this.tokenHandler = new BaseTokenRequestHandler(requestor);
    // set notifier to deliver responses

    this.authorizationHandler.setAuthorizationNotifier(this.notifier);

    // set a listener to listen for authorization responses
    // make refresh and access token requests.

    this.fetchedToken = new Promise<void>(resolve => {
      this.fetchRefreshToken().then(resolve)
    })

    this.notifier.setAuthorizationListener((request, response) => {
      if (response) {
        let codeVerifier: string | undefined;
        if (request.internal && request.internal.code_verifier) {
          codeVerifier = request.internal.code_verifier;
        }

        this.makeRefreshTokenRequest(response.code, codeVerifier)
          .then(() => this.performWithFreshTokens())
          .then(() => {
            this.authStateEmitter.emit(AuthStateEmitter.ON_TOKEN_RESPONSE);
          });
      }
    });
  }

  private generateConfig(type: oauthType): config {
    switch (type) {
      case 'youtube':
      default:
        return {
          openIdConnectUrl: "https://accounts.google.com",
          clientId:
            "YOUR-CLIENT-ID",
          redirectUri: "com.moosync:ytoauth2callback/",
          scope: "https://www.googleapis.com/auth/youtube.readonly",
          keytarService: 'MoosyncYoutubeRefreshToken'
        }
    }
  }

  private async fetchRefreshToken() {
    this.refreshToken = (await window.Store.getSecure(this.config.keytarService)) ?? undefined
  }

  private async storeRefreshToken() {
    if (this.refreshToken)
      return window.Store.setSecure(this.config.keytarService, this.refreshToken)
  }

  private async fetchServiceConfiguration() {
    let configuration = await AuthorizationServiceConfiguration.fetchFromIssuer(
      this.config.openIdConnectUrl,
      requestor)
    return configuration
  }

  public async makeAuthorizationRequest(username?: string) {
    if (!this.fetchedToken) throw new Error('service not yet initialized')

    if (!this.configuration) {
      this.configuration = await this.fetchServiceConfiguration()
    }

    const extras: StringMap = { prompt: "consent", access_type: "offline" };
    if (username) {
      extras["login_hint"] = username;
    }

    // create a request
    const request = new AuthorizationRequest({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope,
      response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
      extras: extras
    }, new WebCrypto());


    this.authorizationHandler.performAuthorizationRequest(
      this.configuration,
      request
    );
  }

  private makeRefreshTokenRequest(code: string, codeVerifier: string | undefined): Promise<void> {
    if (!this.fetchedToken) throw new Error('service not yet initialized')

    if (!this.configuration) {
      return Promise.resolve();
    }

    const extras: StringMap = {};

    if (codeVerifier) {
      extras.code_verifier = codeVerifier;
    }

    // use the code to make the token request.
    let request = new TokenRequest({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
      code: code,
      extras: extras
    });

    return this.tokenHandler
      .performTokenRequest(this.configuration, request)
      .then(response => {
        this.refreshToken = response.refreshToken;
        this.accessTokenResponse = response;
        return response;
      })
      .then(() => this.storeRefreshToken());
  }

  loggedIn(): boolean {
    return !!this.accessTokenResponse && this.accessTokenResponse.isValid();
  }

  signOut() {
    // forget all cached token state
    this.accessTokenResponse = undefined;
  }

  public async hasValidRefreshToken() {
    await this.fetchedToken
    return !!this.refreshToken
  }

  async performWithFreshTokens(): Promise<string> {
    if (!this.fetchedToken) return Promise.reject("Service not initialized");

    if (!this.configuration) {
      this.configuration = await this.fetchServiceConfiguration()
    }
    if (!this.refreshToken) {
      return Promise.resolve("Missing refreshToken.");
    }
    if (this.accessTokenResponse && this.accessTokenResponse.isValid()) {
      return this.accessTokenResponse.accessToken;
    }

    let request = new TokenRequest({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      grant_type: GRANT_TYPE_REFRESH_TOKEN,
      refresh_token: this.refreshToken,
    });

    return this.tokenHandler
      .performTokenRequest(this.configuration, request)
      .then(response => {
        this.accessTokenResponse = response;
        return response.accessToken;
      });
  }
}