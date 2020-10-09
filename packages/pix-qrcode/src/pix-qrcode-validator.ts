export enum PIXQRErrorCode {
  // ...QRErrorCode
  OK,
  INVALID_QRCODE,
  CRC_MISMATCH,
  MISSING_MANDATORY_ELEMENT,
  // end ...

  MISSING_PIX_MAI,
  PIX_MAI_INVALID,
  DUPLICATE_PIX_MAI,
}

export class PIXQRCodeError extends Error {
  constructor( public errorCode: PIXQRErrorCode, message: string ) {
    super( message )
  }
}
