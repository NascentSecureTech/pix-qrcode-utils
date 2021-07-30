import { ClientCredentialsFlowClient, JSONFetcher, ProxyFetcher, CobClient } from '../src/mod.ts';

const proxy = new ProxyFetcher( "http://localhost:8080", { debug: true } );

const ccf = new ClientCredentialsFlowClient( {
  clientId: 'eyJpZCI6ImMyMTUwYjEtYWQ0My00Y2QwLTkwNjgtNiIsImNvZGlnb1B1YmxpY2Fkb3IiOjAsImNvZGlnb1NvZnR3YXJlIjoxOTcxMCwic2VxdWVuY2lhbEluc3RhbGFjYW8iOjF9',
  clientSecret: 'eyJpZCI6IjljIiwiY29kaWdvUHVibGljYWRvciI6MCwiY29kaWdvU29mdHdhcmUiOjE5NzEwLCJzZXF1ZW5jaWFsSW5zdGFsYWNhbyI6MSwic2VxdWVuY2lhbENyZWRlbmNpYWwiOjEsImFtYmllbnRlIjoiaG9tb2xvZ2FjYW8iLCJpYXQiOjE2Mjc0ODE2ODcyODR9',
  //tokenUri: 'http://localhost:9666/api/cob/1111'
  tokenUri: 'https://oauth.hm.bb.com.br/oauth/token',
  debug: true
}, proxy);

let token = await ccf.getAccessToken();
console.log( token );

const hdrs = {
  authorization: token.tokenType + " " + token.accessToken,
  "X-Developer-Application-Key": "d27bd77900ffab401367e17db0050156b9b1a5ba",
  //"accept": "application/json"
};

const fetcher = new ProxyFetcher( "http://localhost:8080", {
  baseUrl: "https://api.hm.bb.com.br/pix/v1/",
  headers: hdrs,
  debug: true
} );

let client = new CobClient( fetcher, "cob" ); //, { "gw-dev-app-key": "d27bd77900ffab401367e17db0050156b9b1a5ba"} );

let cob = await client.putCob( undefined, {
  chave: "7f6844d0-de89-47e5-9ef7-e0a35a681615",
  valor: { original: 100 }
} )

console.log( cob );
