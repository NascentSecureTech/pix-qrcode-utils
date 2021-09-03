import { ClientCredentialsFlowClient, Fetcher, JSONFetcher, FetchOptions, OAuth2ClientConfig, OAuth2Token } from '../src/mod.ts';
import { Cobranca } from '../../pix-data-schemas/src/mod.ts';
import { CobClient } from '../src/mod.ts';
import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts";

async function authenticate( config: OAuth2ClientConfig ) {
  let fetcher;

  fetcher = getFetcher( config );

  const ccf = new ClientCredentialsFlowClient( config, fetcher );

  let token = await ccf.getAccessToken( "cob.read cob.write pix.read" );
  console.log( "TOKEN:", token );

  return token;
}

function getFetcher( config: any, token?: OAuth2Token ) {
  const hdrs = token && {
    authorization: token.tokenType + " " + token.accessToken,
  };

  const fetchOptions: FetchOptions = {
    baseUrl: config.baseUrl,
    headers: hdrs,
    privateKey: config.privateKey,
    clientCert: config.clientCert,
    //debug: true
  }

  //console.log( fetchOptions )
  return new JSONFetcher( fetchOptions );
}

Deno.test( {
  name: "AUTH test",
  fn: async () => {

    const config =
    {
      /********** paste test credentials here ..
      clientId: "CLIENT_ID",
      clientSecret: "CLIENT_SECRET",
      tokenUri: "TOKEN_URI",
      baseUrl: "BASE_URL",
      mtlsProxyHost: "PROXY_URL", // se for rotear pelo mtlsProxy do pix-server
      */

      // these are mine ..
      ...(await import('./test-credentials.ts')).banrisulDev,  //siCoob, // bancoDoBrasil, //gerenciaNet, //banrisulDev, //

      debug: true
    }
    const token = await authenticate( config );

    const fetcher = getFetcher( config, token );

    console.log( "\n" );

    // BB requires a non-standard query-param
    let gwAppKey = (config as any)["gw-dev-app-key"];

    let client = new CobClient( fetcher, "cobv", gwAppKey ? { "gw-dev-app-key": gwAppKey} : undefined );

    for( let i = 0; i < 1; ++i ) {
      let txid: string = crypto.randomUUID();
      txid = txid.replaceAll("-","");
      //console.log( txid );

      let cobIn = await client.putCob( txid, testCobVIn )//minCob );

      let qreq = Fetcher.buildFetchRequest( {}, "GET" );
      let qr = await Fetcher.fetchRequest( "https://" + cobIn.location, qreq );

      let jws = await qr.text();
      let pl = jws.split('.')[1];
      //console.log(pl);

      const pls = new TextDecoder().decode(base64.toUint8Array(pl));
      console.log( "PAYLOAD: " + "https://" + cobIn.location);
      console.log( JSON.parse( pls ) );

      let cobOut = await client.getCob( txid );

      console.log( cobOut );
    }

  }
});

const minCob={
  calendario: {

  },
  chave: "7f6844d0-de89-47e5-9ef7-e0a35a681615",
  valor: { original: "100.00" }
};

const testCobVIn: Cobranca = {
  "chave": "pix.sefaz@sefaz.rs.gov.br",
  "valor": {
     "original": "4000.00"
  },
  "calendario": {
//     "expiracao": 86400,
    "dataDeVencimento": "2022-01-01",
    "validadeAposVencimento": 0
  },
  "devedor": {
     "nome": "João da Silva",
     "cpf": "19917885250",
//     "cnpj": "19917885250123"
  },
  "infoAdicionais": [
    {
       "nome": "tipo",
       "valor": "ITDC"
    },
    {
       "nome": "codigo_de_barras",
       "valor": "85890000040000000212118103873092100000238401"
    }
  ]
};
