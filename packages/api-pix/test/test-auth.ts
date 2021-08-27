import { ClientCredentialsFlowClient, JSONFetcher, FetchOptions, OAuth2ClientConfig, OAuth2Token } from '../src/mod.ts';
import { Cobranca } from '../../pix-data-schemas/src/mod.ts';
import { CobClient } from '../src/mod.ts';
//import * as CREDS from './test-credentials.ts';


//const proxy = new ProxyFetcher( "http://localhost:8080", { debug: true } );
async function authenticate( config: OAuth2ClientConfig & { mtlsProxyUrl?: string }) {
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
    //"X-Developer-Application-Key": "d27bd77900ffab401367e17db0050156b9b1a5ba",
    clientID: config.clientId
  };

  const fetchOptions: FetchOptions = {
    baseUrl: config.baseUrl,
    headers: hdrs,
    privateKey: config.privateKey,
    clientCert: config.clientCert,
    debug: true
  }

  //console.log( fetchOptions )
/*  if ( config.mtlsProxyUrl ) {
    return new ProxyFetcher( config.mtlsProxyUrl, fetchOptions );
  }
  else*/ {
    return new JSONFetcher( fetchOptions );
  }
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
      ...(await import('./test-credentials.ts')).banrisulDev, //gerenciaNet, //banrisulDev, //

      debug: true
    }
    const token = await authenticate( config );

    const fetcher = getFetcher( config, token );

    console.log( "\n" );
/*    await fetcher.fetchJSON( "GET", "PP4yNbdYwXuIZJalg9fG7OQLVHk").then( (v) => {
      console.log( "COB:", v );
    })*/

    let client = new CobClient( fetcher, "cobv" ); //, { "gw-dev-app-key": "d27bd77900ffab401367e17db0050156b9b1a5ba"} );

    for( let i = 0; i < 1; ++i ) {
      let txid: string = crypto.randomUUID();
      txid = txid.replaceAll("-","");
      console.log( txid );

      let cobIn = await client.putCob( txid, testCobVIn );

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
