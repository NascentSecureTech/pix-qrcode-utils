//import axios from 'axios';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import RequestListener = http.RequestListener;

import * as util from 'util';
import TextDecoder = util.TextDecoder;

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
  pathCert: "./data/gn-311972-api-pix-h.p12"
}

const certificate = fs.readFileSync(options.pathCert);

const agent = new https.Agent({
			pfx: certificate,
			passphrase: "",
		});*/


async function handleRequest( req: ProxyRequest ): Promise<ProxyResponse> {
  let agent;

  if ( false && req.url.indexOf("token") != 0 ) {
    agent = new https.Agent({
      key: fs.readFileSync('./data/gn-311972-api-pix-h.key.pem'),
      cert: fs.readFileSync('./data/gn-311972-api-pix-h.crt.pem'),
  	});
    console.log( "Cert 1")
  }
  else {
    agent = new https.Agent({
      key: fs.readFileSync('./data/gn-311972-api-pix2-h.key.pem'),
      cert: fs.readFileSync('./data/gn-311972-api-pix2-h.crt.pem'),
  	});
    console.log( "Cert 2")
  }

  try {

  return fetch( req.url, {
    method: req.method,
    headers: new Headers( JSON.parse( req.headers ) ),
    body: req.body,
    agent: agent
    } )
    .then( async (resp) => {
//      console.log( resp.status );
//      console.log(resp.headers.raw() )
//      console.log( JSON.stringify( resp.headers.keys() ) ) //get('content-type')

      return resp.text().then( (t) => {
        const proxyResp: ProxyResponse = {
          status: resp.status,
          headers: JSON.stringify(new Object( resp.headers.raw() )),
          body: t
        }

        return proxyResp;
      })
    });
  }
  catch( e ) {
    console.log( e );
  }

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

      console.log( "REQUEST" ); console.log( proxyReq )

      handleRequest( proxyReq ).then( (proxyResp) => {
        console.log( "RESPONSE" ); console.log( proxyResp )

        res.setHeader("content-type","application/json");
        res.writeHead(200);
        res.end(JSON.stringify(proxyResp));
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
