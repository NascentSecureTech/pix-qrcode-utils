import { QRCodeNode } from './qrcode-node.ts';
import { computeCRC } from './crc.ts';

export enum QRErrorCode {
  OK,
  INVALID_QRCODE,
  CRC_MISMATCH,
  MISSING_MANDATORY_ELEMENT,
}

export class QRCodeError extends Error {
  constructor( public errorCode: QRErrorCode, message?: string ) {
    super( message );
  }
}

const mandatoryElements: number[] = [
  0,    // Start
  52,
  53,
  58,
  59,
  60,
  63    // CRC
];

export namespace QRCodeValidator {
  export function validateRoot( root: QRCodeNode ) {
    // Validation order:

    // 1. Start Element "00"
    if ( root.getElement( 0 ).baseOffset != 0 ) {
      throw new QRCodeError( QRErrorCode.INVALID_QRCODE, "Missing start element (00)" );
    }

    // 2. Final Element "63"
    let crcEl = root.getElement( 63 );

    if ( ( crcEl.baseOffset != root.content.length - 8 ) || ( root.content.slice(-8,-4) != '6304') ) {
      throw new QRCodeError( QRErrorCode.INVALID_QRCODE, "CRC must be final element (63)" );
    }

    // 3. CRC Correct
    let calculatedCRC = computeCRC( root.content.slice( 0, -4 ) );
    if ( calculatedCRC != crcEl.content ) {
      throw new QRCodeError( QRErrorCode.CRC_MISMATCH, "Invalid CRC" );
    }

    // 4. At least one MAI
    let maiList = Array.from( root.elements.keys() ).filter( (v) => ( v >=2 ) && ( v <= 51 ) );
    if ( maiList.length == 0 ) {
      throw new QRCodeError( QRErrorCode.MISSING_MANDATORY_ELEMENT, "Must have at least one Merchant Account Information" );
    }

    // 5. Mandatory Elements
    mandatoryElements.forEach( (tag) => {
      if ( !root.hasElement( tag ) )
        throw new QRCodeError( QRErrorCode.MISSING_MANDATORY_ELEMENT, "Missing mandatory tag (" + tag + ")" );
    })


  }
}
