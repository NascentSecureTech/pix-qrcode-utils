import { PIXQRCode, PIXQRErrorCode, PIXQRCodeError, PIXPayloadRetriever, PIXQRCodeElements, PIX, EMVQR } from "./deps.ts";

export { PIX, PIXQRCode, PIXQRErrorCode, PIXQRCodeError, PIXPayloadRetriever };

var document = (window as any).document, QRious = (window as any).QRious, prompt = (window as any).prompt;

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
  let elDecoded = document.getElementById('decoded');
  let elStatus = document.getElementById('qr-status');

  elStatus.classList.remove("has-background-danger");
  elStatus.classList.remove('has-text-secondary');
  elDecoded.classList.remove( 'is-hidden' );

  if ( error && error.length > 0 ) {
    elStatus.value = error;
    elStatus.classList.add("has-background-danger");
    elStatus.classList.add('has-text-secondary');
  }
  else if ( success && success.length > 0 ) {
    elDecoded.value = success;
  }
  else {
    elDecoded.classList.add( 'is-hidden' );
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

export function createCode( isDynamic: boolean = true ) {
  const defs = {
    merchantCategoryCode: "0000",
    transactionCurrency: 986,
    countryCode: "BR",
    merchantCity: "Porto Alegre",
    merchantName: "PIX"
  }

  let elements: PIXQRCodeElements;

  if ( isDynamic ) {
    let url = prompt("Colar URL");

    elements = { ...defs, type: "dynamic", url: url, };
  } else {
    let chave = prompt("Digitar chave")
    elements = { ...defs, type: "static", chave: chave, };
  }

  let qr = PIXQRCode.createCode( elements );

  let $qr = document.getElementById('qr-string');

  let value = qr.emvQRCode.buildQRString();

  $qr.value = value;

  decodeCode( value );
}

let $qrImage: any;

export async function decodeCode( value: string ) {
  let qr;

  if ( value.length ) {
    try {
      qr = PIXQRCode.parseCode( value );

      //showResult( JSON.stringify( qr.toJSON(), null, 2 ) );
      showResult( qr.emvQRCode.dumpCode() );

      let r = await Promise.all( [ qr.emvQRCode.validateCode(), qr.validateCode() ] );
      for( const res of r ) {
        if ( res.status == 'fail' ) {
          throw res.error;
        }
      }

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
