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


async function handleRequest( req: ProxyRequest ): Promise<ProxyResponse> {

  return fetch( req.url, {
    method: req.method,
    headers: new Headers( JSON.parse( req.headers ) ),
    body: req.body
    } )
    .then( async (resp) => {
//      console.log( resp.status );
//      console.log(resp.headers.raw() )
//      console.log( JSON.stringify( resp.headers.keys() ) ) //get('content-type')

      return resp.text().then( (t) => {
//        console.log(t )

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
