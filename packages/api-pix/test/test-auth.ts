import { ClientCredentialsFlowClient, JSONFetcher, ProxyFetcher, OAuth2ClientConfig, OAuth2Token } from '../src/mod.ts';
//import * as CREDS from './test-credentials.ts';

//const proxy = new ProxyFetcher( "http://localhost:8080", { debug: true } );
async function authenticate( config: OAuth2ClientConfig ) {
  const ccf = new ClientCredentialsFlowClient( config );

  let token = await ccf.getAccessToken( )// cob.read cob.write pix.read pix.write");
  console.log( "TOKEN:", token );

  return token;
}

function getFetcher( token: OAuth2Token, config: any ) {
  const hdrs = {
    authorization: token.tokenType + " " + token.accessToken,
    //"X-Developer-Application-Key": "d27bd77900ffab401367e17db0050156b9b1a5ba",
  };

  const fetchOptions = {
    baseUrl: config.baseUrl,
    headers: hdrs,
    debug: true
  }

  if ( config.mtlsProxyUrl ) {
    return new ProxyFetcher( config.mtlsProxyUrl, fetchOptions );
  }
  else {
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
      ...(await import('./test-credentials.ts')).banrisulDev,

      debug: true
    }

    const token = await authenticate( config );

    const fetcher = getFetcher( token, config );

    console.log( "\n" );
    await fetcher.fetchJSON( "GET", "PP4yNbdYwXuIZJalg9fG7OQLVHk").then( (v) => {
      console.log( "COB:", v );
    })
  }
});


/*let client = new CobClient( fetcher, "cob" ); //, { "gw-dev-app-key": "d27bd77900ffab401367e17db0050156b9b1a5ba"} );

let cob = await client.putCob( "fc9a4366ff3d4964b5dbc6c91a8722d7", {
  calendario: {

  },
  chave: "7f6844d0-de89-47e5-9ef7-e0a35a681615",
  valor: { original: "100.00" }
} )

console.log( cob );*/
