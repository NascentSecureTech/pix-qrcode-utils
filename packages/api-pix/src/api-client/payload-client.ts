import { Fetcher } from './mod.ts';
import { base64 } from '../deps.ts';

//import { Cobranca, PartialCobranca, CobType, PagedListCobParams } from '../deps.ts';
import { compactVerify } from "https://deno.land/x/jose@v3.16.1/jws/compact/verify.ts";
import { createRemoteJWKSet } from 'https://deno.land/x/jose@v3.16.1/jwks/remote.ts'
import { decodeProtectedHeader } from 'https://deno.land/x/jose@v3.17.0/util/decode_protected_header.ts';

export class PayloadClient {
  constructor() {
    //
  }

  async fetchPayload( url: string ) {
    const resp = await Fetcher.fetchRequest(
      url,
      Fetcher.buildFetchRequest(
        "GET", {
          headers: { "accept": "application/jose" }
        }),
     );

    const jws = await resp.text();

/*    const protectedHeader = decodeProtectedHeader(jws);

    //console.log( protectedHeader );


    const JWKS = createRemoteJWKSet(new URL(protectedHeader.jku!));
    console.log( JWKS );
    //'https://apidev.banrisul.com.br/pix/data/bqq-jwks-qrcode-h-92702067-v20210903.json'))

    const { payload } = await compactVerify( jws, JWKS );
*/
    const payloadB64 = jws.split('.')[1];
    const payload = base64.toUint8Array( payloadB64 );

    return new TextDecoder().decode(payload);
  };

  async fetchPayloadFromQR( qrString: string ) {

  }
}
