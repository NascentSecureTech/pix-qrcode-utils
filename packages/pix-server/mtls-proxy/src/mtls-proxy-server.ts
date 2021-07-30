//import axios from 'axios';
import * as http from 'http';
import RequestListener = http.RequestListener;

import * as util from 'util';
import TextDecoder = util.TextDecoder;

//const fs = require('fs');
import fetch from 'node-fetch';
import * as nodeFetch from 'node-fetch';
import Headers = nodeFetch.Headers;

export type FetchMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type FetchHeaders = Headers | Record<string,string>;

export interface ProxyRequest {
  method: FetchMethod,
  url: string;
  headers: string;
  body?: string;
}

export interface ProxyResponse {
  status: number,
  headers: string,
  body?: string;
}

/*const options = {
  pathCert: "../data/"
}

const certificate = fs.readFileSync(options.pathCert);

const agent = new https.Agent({
			pfx: certificate,
			passphrase: "",
		});*/

let hdrs = {
  Authorization: "Basic ZXlKcFpDSTZJbU15TVRVd1lqRXRZV1EwTXkwMFkyUXdMVGt3TmpndE5pSXNJbU52WkdsbmIxQjFZbXhwWTJGa2IzSWlPakFzSW1OdlpHbG5iMU52Wm5SM1lYSmxJam94T1RjeE1Dd2ljMlZ4ZFdWdVkybGhiRWx1YzNSaGJHRmpZVzhpT2pGOTpleUpwWkNJNklqbGpJaXdpWTI5a2FXZHZVSFZpYkdsallXUnZjaUk2TUN3aVkyOWthV2R2VTI5bWRIZGhjbVVpT2pFNU56RXdMQ0p6WlhGMVpXNWphV0ZzU1c1emRHRnNZV05oYnlJNk1Td2ljMlZ4ZFdWdVkybGhiRU55WldSbGJtTnBZV3dpT2pFc0ltRnRZbWxsYm5SbElqb2lhRzl0YjJ4dloyRmpZVzhpTENKcFlYUWlPakUyTWpjME9ERTJPRGN5T0RSOQ==",
  "content-type": "application/x-www-form-urlencoded"
}

let req: ProxyRequest = {
  method: "POST",
  url: "https://oauth.hm.bb.com.br/oauth/token",
  body: "grant_type=client_credentials",
  headers: JSON.stringify( hdrs )
}

let p = new URLSearchParams();
p.append("grant_type","client_credentials");

var postParams = {
		method: 'POST',
		headers: new Headers( JSON.parse( req.headers ) ),
//		httpsAgent: agent,
		body: p
	};


/*axios.post(req.url, p, { headers: {
  Authorization: "Basic ZXlKcFpDSTZJbU15TVRVd1lqRXRZV1EwTXkwMFkyUXdMVGt3TmpndE5pSXNJbU52WkdsbmIxQjFZbXhwWTJGa2IzSWlPakFzSW1OdlpHbG5iMU52Wm5SM1lYSmxJam94T1RjeE1Dd2ljMlZ4ZFdWdVkybGhiRWx1YzNSaGJHRmpZVzhpT2pGOTpleUpwWkNJNklqbGpJaXdpWTI5a2FXZHZVSFZpYkdsallXUnZjaUk2TUN3aVkyOWthV2R2VTI5bWRIZGhjbVVpT2pFNU56RXdMQ0p6WlhGMVpXNWphV0ZzU1c1emRHRnNZV05oYnlJNk1Td2ljMlZ4ZFdWdVkybGhiRU55WldSbGJtTnBZV3dpT2pFc0ltRnRZbWxsYm5SbElqb2lhRzl0YjJ4dloyRmpZVzhpTENKcFlYUWlPakUyTWpjME9ERTJPRGN5T0RSOQ==",
  "content-type": "application/x-www-form-urlencoded",
  "accepts": "application/json",
} } ).then( (r) => {
  console.log( r.status == 200 );
  console.log( r.data )
})*/

async function handleRequest( req: ProxyRequest ): Promise<ProxyResponse> {
  return fetch( req.url, {
    method: req.method,
    headers: new Headers( JSON.parse( req.headers ) ),
    body: req.body
    } )
    .then( async (resp) => {
      console.log( resp.status );
      console.log(resp.headers.raw() )
      console.log( JSON.stringify( resp.headers.keys() ) ) //get('content-type')

      return resp.text().then( (t) => {
        console.log(t )

        const proxyResp: ProxyResponse = {
          status: resp.status,
          headers: JSON.stringify(resp.headers),
          body: t
        }

        return proxyResp;
      })
    });

}

const requestListener: RequestListener = function (req, res) {
  req.resume();
  const chunks = [];
  req.on('data', chunk => chunks.push(chunk));

  req.on('end', () => {
    if ( req.aborted ) {
      console.error(
        'The connection was terminated while the message was still being sent');
    } else {
      const proxyReq: ProxyRequest = JSON.parse( new TextDecoder().decode( Buffer.concat(chunks) ) );

      console.log( "PROXY", proxyReq )

      handleRequest( proxyReq ).then( (pr) => {
        res.setHeader("content-type","application/json");
        res.writeHead(200);
        res.end(JSON.stringify(pr));
      })
    }
  })

  //console.log( req.headers );
  //console.log( );
  //console.log( req.url );

}

const server = http.createServer(requestListener);
console.log( "listening ...")
server.listen(8080);
