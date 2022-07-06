import { IJSONFetcher, JSONFetcher } from "./mod.ts";
import { base64 } from "../deps.ts";

//
export interface OAuth2ClientConfig {
  //
  clientId: string;

  //
  clientSecret?: string;

  //
  tokenUri: string;

  //
  scopes?: string[];

  //
  debug?: boolean;
}

//
export interface OAuth2Token {
  //
  accessToken: string;

  //
  tokenType: string;

  //
  expiresIn?: number;

  //
  scopes?: string[];
}

//
export class ClientCredentialsFlowClient {
  //
  private readonly fetcher: IJSONFetcher;

  //
  private token?: OAuth2Token;
  private tokenCreated?: Date;

  //
  constructor(public config: Readonly<OAuth2ClientConfig>, fetcher?: IJSONFetcher ) {
    this.fetcher = fetcher ?? new JSONFetcher( {
      debug: this.config.debug ?? false
    });
  }

  //
  private calcBasicAuth(): string {
    const auth = this.config.clientId + ":" + (this.config.clientSecret ?? "");

    const authString = base64.fromUint8Array(new TextEncoder().encode(auth));

    return authString;
  }

  //
  async getAccessToken( scopes = "" ): Promise<OAuth2Token> {
    //if (this.token && this.tokenCreated) {
    //  return this.token;
    //}

    const postBody = new URLSearchParams({
      grant_type: "client_credentials",
      scope: scopes,
    });

    // deno-lint-ignore no-explicit-any
    const json = await this.fetcher.fetchJSON<URLSearchParams, any>(
      "POST",
      this.config.tokenUri,
      postBody,
      {
        Authorization: "Basic " + this.calcBasicAuth(),
      }
    );

    this.token = {
      accessToken: json.access_token,
      tokenType: json.token_type,
      expiresIn: json.expires_in,
      scopes: (json.scope ?? scopes).split(" "),
    };
    this.tokenCreated = new Date();

    return this.token;
  }
}
