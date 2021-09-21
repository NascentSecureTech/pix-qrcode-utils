import {
  ClientCredentialsFlowClient,
  FetchError,
  JSONFetcher,
  FetchOptions,
  OAuth2ClientConfig,
  OAuth2Token,
} from "../src/mod.ts";
import { CobClient } from "../src/mod.ts";

const config = {
  ...(await import("./test-credentials.ts")).banrisulHomolNascent, //siCoob, // bancoDoBrasil, //gerenciaNet, //banrisulDev, //

  debug: false,
};

let clientCache: Record<string, CobClient> = {};

export async function initCobClient( cobType: "cob"|"cobv" = "cobv") {
  if ( clientCache[ cobType ] ) {
    return clientCache[ cobType ];
  }

  const token = await authenticate(config);
  const fetcher = getFetcher(config, token);

  // BB requires a non-standard query-param
  let gwAppKey = (config as any)["gw-dev-app-key"];

  let client = new CobClient(
    fetcher,
    cobType,
    gwAppKey ? { "gw-dev-app-key": gwAppKey } : undefined
  );

  clientCache[ cobType ] = client;

  return client;
}

export async function authenticate(config: OAuth2ClientConfig) {
  let fetcher;

  fetcher = getFetcher(config);

  const ccf = new ClientCredentialsFlowClient(config, fetcher);

  let token = await ccf.getAccessToken("cob.read cob.write pix.read");
  //console.log("TOKEN:", token);

  return token;
}

export function getFetcher(config: any, token?: OAuth2Token) {
  const hdrs = token && {
    authorization: token.tokenType + " " + token.accessToken,
  };

  const fetchOptions: FetchOptions = {
    baseUrl: config.baseUrl,
    headers: hdrs,
    privateKey: config.privateKey,
    clientCert: config.clientCert,
    //debug: true
  };

  //console.log( fetchOptions )
  return new JSONFetcher(fetchOptions);
}

export async function mustFail( testName: string, testFn:  ()=>Promise<any>, status: number[] ): Promise<{status: number, json: any}> {
  console.log(`Test: ${testName}`);

  try {
    await testFn();

    throw new Error("Should have failed");
  }
  catch( e ) {
    if ( e instanceof FetchError ) {
      if ( status.indexOf(e.status) >= 0 ) {
        console.log( `PASS: ${e.status} - ${JSON.stringify(e.json)}`)

        return {
          status: e.status,
          json: e.json
        }
      }
    }

    throw e;
  }
}

export function generateTXID() {
  let txid: string = crypto.randomUUID();

  return txid.replaceAll("-", "");
}
