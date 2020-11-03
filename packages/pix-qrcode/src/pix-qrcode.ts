import { EMVMerchantQRCode, EMVMerchantQRParams } from "./deps.ts";
import { PIXQRErrorCode, PIXQRCodeError } from './pix-qrcode-validator.ts';
export { PIXQRErrorCode, PIXQRCodeError };

const PIX_MAI_DICT = 1;
const PIX_MAI_URL  = 25

export interface PIXQRCodeParams extends EMVMerchantQRParams {
}

const defaultParams: PIXQRCodeParams = {
  encoding: 'utf8',
  validate: false,
}

export let GUI_PIX = 'br.gov.bcb.pix';

export class PIXQRCode {
  protected _emvQRCode: EMVMerchantQRCode;

  get emvQRCode() { return this._emvQRCode }

  protected constructor(
    qrCode: string,
    params: PIXQRCodeParams = defaultParams ) {

    this._emvQRCode = EMVMerchantQRCode.parseCode( qrCode, params );
  }

  static parseCode( qrCode: string,
                    params: PIXQRCodeParams = defaultParams ): PIXQRCode {

    params = {
      ...defaultParams,
      ...params
    };

    let pixQRCode = new PIXQRCode( qrCode, params );

    if ( params.validate )
      pixQRCode.validateCode();

    return pixQRCode;
  }

  public validateCode() {
    let emv = this.emvQRCode;

    // 1. EMV QR Code must be OK
    emv.validateCode();

    // 2. Must have (single) MAI with PIX GUI
    let maiList = emv.findIdentifiedTemplate( GUI_PIX, 26, 51 );
    if ( maiList.length == 0 ) {
      throw new PIXQRCodeError( PIXQRErrorCode.MISSING_PIX_MAI, "PIX MAI not found")
    }

    if ( maiList.length > 1 ) {
      throw new PIXQRCodeError( PIXQRErrorCode.DUPLICATE_PIX_MAI, "PIX MAI duplicated")
    }

    let pixMAI = maiList[ 0 ];

    // 3. PIX-MAI contents must indicate DICT or URL
    let pixStatic = pixMAI.hasElement( PIX_MAI_DICT ); // DICT KEY

    if( pixStatic ) {
      if ( pixMAI.hasElement( PIX_MAI_URL ) ) {
        throw new PIXQRCodeError( PIXQRErrorCode.PIX_MAI_INVALID, "PIX MAI contains both DICT and URL elements")
      }
    }
    else { // must be dynamic
      if ( !pixMAI.hasElement( PIX_MAI_URL ) ) {
        throw new PIXQRCodeError( PIXQRErrorCode.PIX_MAI_INVALID, "PIX MAI contains neither static ou dynamic elements")
      }
    }

    //
  }

  isPIX( test: "pix"|"valid"|"static"|"dynamic"): boolean {
    let maiList = this.emvQRCode.findIdentifiedTemplate( GUI_PIX, 26, 51 );

    let hasPIX = ( maiList.length == 1 );
    if ( !hasPIX )
      return false;

    let pixMAI = maiList[ 0 ];

    let isStatic = pixMAI.hasElement( PIX_MAI_DICT );
    let isDynamic = pixMAI.hasElement( PIX_MAI_URL );

    switch( test ) {
      case "pix": return true;
      case "valid": return isStatic || isDynamic;
      case "static": return isStatic;
      case "dynamic": return isDynamic;
    }
  }
}
