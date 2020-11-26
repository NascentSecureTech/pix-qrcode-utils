import { PIXPayload } from './pix-payload.ts';
import * as base64 from "https://deno.land/x/base64/mod.ts";

export interface PIXFetchResults {
  jwsString: string;

  jws: {
    hdr: Uint8Array;
    payload: Uint8Array;
    signature: Uint8Array;
  };

  header: any;
  payload: PIXPayload;
}

export class PIXPayloadRetriever {
  constructor( ) {

  }

  async fetchPayload( url: string ): Promise<PIXFetchResults> {
    const opts: RequestInit|any = {
      //mode: 'cors',
      //Accept: 'text/html,application/text,text/plain,application/jose,*/*',
      accept: 'x/y',
      mode: 'no-cors'
    };

    console.log( "options", opts)
    /**
     * Output: JSON Data
     */
    let pl = await fetch( "https://" + url, opts )
      .then( (response) => {
      //  console.log("Response", response);
        if ( !response.ok )
          throw new Error( "HTTP " + response.status)

        return response.text();
      })
      .then( (jws:string ) => {
        let parts = jws.split('.')
          .map( (b64) => base64.toUint8Array( b64 ) );

        let jsons = parts.map( (u8) => new TextDecoder().decode( u8 ) );

        let pixFetch: PIXFetchResults = {
          jwsString: jws,

          jws: {
             hdr: parts[0],
             payload: parts[1],
             signature: parts[2]
          },

          header: JSON.parse( jsons[0] ),

          payload: ( JSON.parse( jsons[1] ) as any) as PIXPayload
        };

        return pixFetch;;
      })
      .catch( (error) => {
        console.log(error);
        throw error;
      } );

    return pl;
  }
}
