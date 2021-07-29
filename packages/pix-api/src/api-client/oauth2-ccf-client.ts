import { W3CFetchClient } from "./w3c-fetch-client.ts";
import { base64 } from "../deps.ts";

interface OAuth2ClientConfig {
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

interface OAuth2Token {
  //
  accessToken: string;

  //
  tokenType: string;

  //
  expiresIn?: number;

  //
  scopes?: string[];
}

export class ClientCredentialsFlowClient {
  private token?: OAuth2Token;
  //
  constructor(public config: Readonly<OAuth2ClientConfig>) {}

  private calcBasicAuth(): string {
    const auth = this.config.clientId + ":" + (this.config.clientSecret ?? "");

    const authString = base64.fromUint8Array(new TextEncoder().encode(auth));

    //console.log(authString);

    //return "ZXlKcFpDSTZJbU15TVRVd1lqRXRZV1EwTXkwMFkyUXdMVGt3TmpndE5pSXNJbU52WkdsbmIxQjFZbXhwWTJGa2IzSWlPakFzSW1OdlpHbG5iMU52Wm5SM1lYSmxJam94T1RjeE1Dd2ljMlZ4ZFdWdVkybGhiRWx1YzNSaGJHRmpZVzhpT2pGOTpleUpwWkNJNklqbGpJaXdpWTI5a2FXZHZVSFZpYkdsallXUnZjaUk2TUN3aVkyOWthV2R2VTI5bWRIZGhjbVVpT2pFNU56RXdMQ0p6WlhGMVpXNWphV0ZzU1c1emRHRnNZV05oYnlJNk1Td2ljMlZ4ZFdWdVkybGhiRU55WldSbGJtTnBZV3dpT2pFc0ltRnRZbWxsYm5SbElqb2lhRzl0YjJ4dloyRmpZVzhpTENKcFlYUWlPakUyTWpjME9ERTJPRGN5T0RSOQ";
    return authString;
  }

  //
  async getAccessToken(): Promise<OAuth2Token> {
    if (this.token) return this.token;

    const scopes = "cob.read cob.write pix.read pix.write";

    const postBody = new URLSearchParams({
      grant_type: "client_credentials",
//      scope: scopes,
    });

    const client = new W3CFetchClient( undefined, { debug: this.config.debug ?? false });

    let json = await client.fetchJSON<URLSearchParams, any>(
      "POST",
      this.config.tokenUri,
      postBody,
      {
        Authorization: "Basic " + this.calcBasicAuth(),
      }
    );

    return {
      accessToken: json.access_token,
      tokenType: json.token_type,
      expiresIn: json.expires_in,
      scopes: scopes.split(" "),
    };
  }
}

/*
const agent = new https.Agent({
			pfx: this.certificate,
			passphrase: "",
		});

		var postParams = {
			method: 'POST',
			url: this.baseUrl + this.constants.ENDPOINTS.PIX.authorize.route,
			headers: {
				'Authorization': "Basic " + auth,
				'Content-Type': "application/json",
				'api-sdk': 'node-' + sdkPackage.version,
			},
			httpsAgent: agent,
			data: {
				grant_type: 'client_credentials'
			}
		};*/
