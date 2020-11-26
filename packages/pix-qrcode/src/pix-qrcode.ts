import { EMVMerchantQRCode, QRCodeNode, EMVMerchantQRParams, ValidationObserver } from "./deps.ts";
import { getRuleValidator } from './pix-qrcode-validator.ts';
export { PIXQRCodeError, PIXQRErrorCode } from './pix-qrcode-validator.ts';
export * from './payload/pix-payload.ts';

export const GUI_PIX = 'br.gov.bcb.pix';

export const PIX_MAI_DICT = 1;
export const PIX_MAI_URL  = 25

export interface PIXDynamicQRCodeParams extends EMVMerchantQRParams {
  type: "dynamic";

  url?: string;
}

export interface PIXStaticQRCodeParams extends EMVMerchantQRParams {
  type: "static";

  chave?: string;

  value?: string;
  name?: string;
  countryCode?: string;
  postalCode?: string;
  txid?: string;
}

export type PIXQRCodeParams = PIXStaticQRCodeParams | PIXDynamicQRCodeParams;

const defaultParams: EMVMerchantQRParams = {
  encoding: 'utf8',
}

export class PIXQRCode {
  protected _emvQRCode: EMVMerchantQRCode;

  get emvQRCode() { return this._emvQRCode }

  getMAI( ): QRCodeNode {
    let maiList = this.emvQRCode.findIdentifiedTemplate( GUI_PIX, 26, 51 );

    return  maiList[ 0 ];
  }

  protected constructor(
    qrCode: string,
    params?: EMVMerchantQRParams ) {

    this._emvQRCode = EMVMerchantQRCode.parseCode( qrCode, params );
  }

  static createCode( ): PIXQRCodeParams {
    return { type: "static" };
  }

  static parseCode( qrCode: string,
                    params?: EMVMerchantQRParams ): PIXQRCode {

    params = {
      ...defaultParams,
      ...params
    };

    let pixQRCode = new PIXQRCode( qrCode, params );

    return pixQRCode;
  }

  public async validateCode( observer?: ValidationObserver ) {
    await getRuleValidator( ).validate( this, observer );
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
