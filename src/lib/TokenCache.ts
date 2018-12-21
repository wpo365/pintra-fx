/*!
 * @overview  Pintra is what we call a WordPress + Office 365 intranet that is built using the partially open-source Framework Pintra-Fx. This framework offers a runtime model across multiple technology layers, to help developers build client-side Office 365 productive intranet experiences and apps to meet the advanced requirements of today's modern workplace.
 * @copyright Copyright (c) 2018 Marco van Wieren
 * @license   Licensed under MIT license
 * @version   v0.3.0
 */

import Axios from 'axios';

export class TokenCache {
  private static tokens: IToken[] = [];
  private static instance: TokenCache = null;

  private constructor() {
    const tokenCache = localStorage.getItem('pintraTokenCache');
    if (tokenCache) {
      TokenCache.tokens = JSON.parse(tokenCache);
    }
  }

  /**
   * Clear the locally stored token cache.
   * 
   * @returns void
   */
  public static clearTokenCache(): void {
    localStorage.removeItem('pintraTokenCache');
    TokenCache.tokens = [];
  }

  /**
   *
   * @param request TokenRequest          The TokenRequest object
   * @param options ITokenRequestOptions  Optional ITokenRequestOptions
   */
  public static async getToken(
    request: TokenRequest,
    options?: ITokenRequestOptions
  ): Promise<IToken | TokenRequestError> {

    if (TokenCache.instance == null) {
      TokenCache.instance = new TokenCache();
    }

    for (let token of TokenCache.tokens) {
      if (token.name == request.name) {
        if (token.expires > Date.now()) {
          console.info('INFO: Getting cached token');
          return token;
        }
      }
    }

    const data = new FormData();
    data.append('action', 'get_tokencache');
    data.append('resource', request.resource);
    data.append('nonce', options.nonce);

    let response: any

    try {
      response = await Axios.post(options.wpAjaxAdminUrl, data);
    }
    catch (error) {
      const axiosError = new TokenRequestError(error.message);
      axiosError.data = {
        status: 'NOK',
        error_codes: '-1',
        message: error.message,
        result: null
      };
      return axiosError;
    }

    console.info(response);

    if (response.status == 200) {
      if (response.data.status == 'OK') {
        const result = JSON.parse(response.data.result);
        const token = {
          name: request.name,
          expires: parseInt(result.expiry) * 1000,
          bearer: result.accessToken,
        };
        for (let i = TokenCache.tokens.length - 1; i >= 0; i--) {
          if (TokenCache.tokens[i].name == request.name) {
            TokenCache.tokens.splice(i, 1);
          }
        }
        TokenCache.tokens.push(token);
        localStorage.setItem(
          'pintraTokenCache',
          JSON.stringify(TokenCache.tokens)
        );
        return token;
      }
      else {
        const responseError = new TokenRequestError(response.data.message);
        responseError.data = response.data;
        return responseError;
      }
    }

    const error = new TokenRequestError('Response status: ' + response.status);
    error.data = {
      status: 'NOK',
      error_codes: '-1',
      message: 'Unknown error occurred',
      result: null
    };

    return error;
  }

  /**
   *
   * @param request TokenRequest          The TokenRequest object
   * @param options ITokenRequestOptions  Optional ITokenRequestOptions
   */
  public static async getTokenV2(
    request: TokenRequestV2,
    options?: ITokenRequestOptions
  ): Promise<IToken | TokenRequestError> {

    if (TokenCache.instance == null) {
      TokenCache.instance = new TokenCache();
    }

    for (let token of TokenCache.tokens) {
      if (token.name == request.name) {
        if (token.expires > Date.now()) {
          console.info('INFO: Getting cached token');
          return token;
        }
      }
    }

    const data = new FormData();
    data.append('action', 'get_tokencache');
    data.append('scope', request.scope);
    data.append('nonce', options.nonce);

    let response: any

    try {
      response = await Axios.post(options.wpAjaxAdminUrl, data);
    }
    catch (error) {
      const axiosError = new TokenRequestError(error.message);
      axiosError.data = {
        status: 'NOK',
        error_codes: '-1',
        message: error.message,
        result: null
      };
      return axiosError;
    }

    console.info(response);

    if (response.status == 200) {
      if (response.data.status == 'OK') {
        const result = JSON.parse(response.data.result);
        const token = {
          name: request.name,
          expires: parseInt(result.expiry) * 1000,
          bearer: result.accessToken,
        };
        for (let i = TokenCache.tokens.length - 1; i >= 0; i--) {
          if (TokenCache.tokens[i].name == request.name) {
            TokenCache.tokens.splice(i, 1);
          }
        }
        TokenCache.tokens.push(token);
        localStorage.setItem(
          'pintraTokenCache',
          JSON.stringify(TokenCache.tokens)
        );
        return token;
      }
      else {
        const responseError = new TokenRequestError(response.data.message);
        responseError.data = response.data;
        return responseError;
      }
    }

    const error = new TokenRequestError('Response status: ' + response.status);
    error.data = {
      status: 'NOK',
      error_codes: '-1',
      message: 'Unknown error occurred',
      result: null
    };

    return error;
  }
}

export interface ITokenRequestOptions {
  nonce: string;
  wpAjaxAdminUrl: string;
}

export interface IToken {
  name: string;
  expires: number;
  bearer: string;
}

export class TokenRequestError extends Error {
  public data: ITokenResponse;
  constructor(message: string) {
    super(message);
    (<any>Object).setPrototypeOf(this, TokenRequestError.prototype);
  }
}

export interface ITokenResponse {
  status: string;
  error_codes: string;
  message: string;
  result: string;
}

export class TokenRequest {
  public name: string;
  public resource: string;
  public constructor(name: string, resource: string) {
    this.name = name;
    this.resource = resource;
  }
  toString(): string {
    return this.name + ',' + this.resource;
  }
}
export class TokenRequestV2 {
  public name: string;
  public scope: string;
  public constructor(name: string, scope: string) {
    this.name = name;
    this.scope = scope;
  }
  toString(): string {
    return this.name + ',' + this.scope;
  }
}
