import { PIXQRCode, PIXQRErrorCode, PIXQRCodeError, PIXPayloadRetriever, PIX, EMVQR } from "./deps.ts";

export { PIX, PIXQRCode, PIXQRErrorCode, PIXQRCodeError, PIXPayloadRetriever };

var document = (window as any).document, QRious = (window as any).QRious;

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
  let el = document.getElementById('decoded');

  el.classList.remove("has-background-danger");
  el.classList.remove('has-text-secondary');
  el.classList.remove( 'is-hidden' );

  if ( error && error.length > 0 ) {
    el.value = error;
    el.classList.add("has-background-danger");
    el.classList.add('has-text-secondary');
  }
  else if ( success && success.length > 0 ) {
    el.value = success;
  }
  else {
    el.classList.add( 'is-hidden' );
  }
}

export function fixCRC( value: string ) {
  let $qr = document.getElementById('qr-string');

  try {
    let qr = PIXQRCode.parseCode( value );

    value = qr.emvQRCode.buildQRString();

    $qr.value = value;

    decodeCode( value );
  }
  catch( E ) {
    showResult( null, handleQRError( E ) );
  }
}

let $qrImage: any;

export async function decodeCode( value: string ) {
  let qr;

  if ( value.length ) {
    try {
      qr = PIXQRCode.parseCode( value );

      let r = await Promise.all( [ qr.emvQRCode.validateCode(), qr.validateCode() ] );
      for( const res of r ) {
        if ( res.status == 'fail' ) {
          throw res.error;
        }
      }

      //showResult( JSON.stringify( qr.toJSON(), null, 2 ) );
      showResult( qr.emvQRCode.dumpCode() );

      //let emv = qr.emvQRCode;

      let $fetch = document.getElementById('btn-fetch-dynamic');

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

export async function fetchDynamic( value: string ) {
  let pix = PIXQRCode.parseCode( value );

  console.log( pix );
  await pix.validateCode();

  let tmpl = pix.emvQRCode.findIdentifiedTemplate( PIX.GUI, EMVQR.MAI_TEMPLATE_FIRST, EMVQR.MAI_TEMPLATE_LAST )[ 0 ];

  let url = tmpl.getElement(PIX.TAG_MAI_URL).content;
  console.log( url );

  url = "pix.nascent.com.br/proxy?url=" + encodeURI( "https://" + url );

  let payload = new PIXPayloadRetriever().fetchPayload( url );

  payload.then( results => {
    let json = {
     "$hdr": results.header,
     ...results.payload
    };

    showResult( JSON.stringify( json, null, 2 ) );
  } )
  .catch( (e) => {
    console.log( "Fetch failed: " + e.message );
  } );
}
