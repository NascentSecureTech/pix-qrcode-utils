import { PIXQRCode, PIXQRErrorCode, PIXQRCodeError, PIXPayloadRetriever, PIXQRCodeElements, PIX, EMVQR, rootEMVSchema, lookupNodeSchema } from "./deps.ts";

export { PIX, EMVQR, PIXQRCode, PIXQRErrorCode, PIXQRCodeError, PIXPayloadRetriever, rootEMVSchema, lookupNodeSchema };

const document = (window as any).document, QRious = (window as any).QRious; // , prompt = (window as any).prompt;

function handleQRError( E: Error ) {
  let result = "ERROR";

  if ( E instanceof PIXQRCodeError ) {
    result = PIXQRErrorCode[ E.errorCode ] + " - " + E.message;
  }
  else if ( E instanceof Error ) {
    result = "ERROR - " + E.message;
  }

  return result;
}

function showResult( success?: string | null, error?: string ) {
  const elOutput = document.getElementById('decoded');
  const elDecoded = document.getElementById('decoded');
  const elStatus = document.getElementById('qr-status');

  elStatus.classList.remove("has-background-danger");
  elStatus.classList.remove('has-text-secondary');
  elStatus.classList.remove("has-background-info");
  elOutput.classList.remove( 'is-hidden' );

  if ( error && error.length > 0 ) {
    elStatus.value = error;
    elStatus.classList.add("has-background-danger");
    elStatus.classList.add('has-text-secondary');
  }
  else if ( success && success.length > 0 ) {
    elStatus.classList.add("has-background-info");
    elStatus.value = 'SUCCESS';
    elDecoded.value = success;
  }
  else {
    elStatus.value = '';
    elOutput.classList.add( 'is-hidden' );
  }
}

export function fixCRC( value: string ) {
  const $qr = document.getElementById('qr-string');

  try {
    const qr = PIXQRCode.parseCode( value );

    value = qr.emvQRCode.buildQRString();

    $qr.value = value;

    (window as any).decodeCode( value );
  }
  catch( E ) {
    showResult( null, handleQRError( E ) );
  }
}

export function createCode( qrInfo: PIXQRCodeElements ) {

  const qr = PIXQRCode.createCode( qrInfo );

  const $qr = document.getElementById('qr-string');

  const value = qr.emvQRCode.buildQRString();

  $qr.value = value;

  (window as any).decodeCode( value );
}

let $qrImage: any;

export async function decodeCode( value: string ) {
  let qr;

  if ( value.length ) {
    const encoding = ( value[0] == 'M') ? 'base64' : 'utf8';

    try {
      showResult( );

      qr = PIXQRCode.parseCode( value, { encoding } );

      //showResult( JSON.stringify( qr.toJSON(), null, 2 ) );
      showResult( qr.emvQRCode.dumpCode() );

      const r = await Promise.all( [ qr.emvQRCode.validateCode(), qr.validateCode() ] );
      for( const res of r ) {
        if ( res.status == 'fail' ) {
          throw res.error;
        }
      }

      //let emv = qr.emvQRCode;

      const $fetch = document.getElementById('btn-fetch-dynamic');

      $fetch.disabled = !( qr.isPIX('dynamic' ) );

      $qrImage = document.getElementById('qr-bitmap');

      new QRious({
        element: $qrImage,
        value: value,
        size: 200
      });
    }
    catch( E ) {
      showResult( null, handleQRError( E ) );
      if ( $qrImage ) $qrImage.src = '#';
    }
  }
  else {
    showResult();
    if ( $qrImage ) $qrImage.src = '#';
  }
}

export function extractCode( value: string ): PIXQRCodeElements | null {
  let qr;

  if ( value.length ) {
    try {
      showResult( );

      qr = PIXQRCode.parseCode( value );

      const info: PIXQRCodeElements = qr.extractElements();

      showResult( JSON.stringify( info, null, 2 ) );

      return info;
    }
    catch( E ) {
      showResult( null, handleQRError( E ) );
    }
  }
  else {
    showResult();
  }

  return null;
}

export async function fetchDynamic( value: string ) {
  try {
    const pix = PIXQRCode.parseCode( value );

    console.log( pix );
    await pix.validateCode();

    const tmpl = pix.emvQRCode.findIdentifiedTemplate( PIX.GUI, EMVQR.MAI_TEMPLATE_FIRST, EMVQR.MAI_TEMPLATE_LAST )[ 0 ];

    let url = tmpl.getElement(PIX.TAG_MAI_URL).content;
    console.log( url );

    url = "pix.nascent.com.br/proxy?url=" + encodeURI( "https://" + url );

    const payload = new PIXPayloadRetriever().fetchPayload( url );

    const json = await payload.then( results => {
      return {
       "$hdr": results.header,
       ...results.payload
       }
     } );

     showResult( JSON.stringify( json, null, 2 ) );
     return true;
  }
  catch( e ) {
    showResult( null, e );
    console.log( "Fetch failed: " + e.message );
    return false;
  }
}
