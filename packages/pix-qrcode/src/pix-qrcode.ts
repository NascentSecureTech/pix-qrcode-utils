import { EMVMerchantQRCode, QRCodeNode, EMVMerchantQRParams, EMVQRCodeBasicElements, EMVQR } from "./deps.ts";
import { ValidationObserver } from "./deps.ts";
import { getRuleValidator } from './pix-qrcode-validator.ts';
export { PIXQRCodeError, PIXQRErrorCode } from './pix-qrcode-validator.ts';
export * from './payload/pix-payload.ts';

export namespace PIX {
  export const GUI = 'br.gov.bcb.pix';

  export const TAG_MAI_CHAVE = 1;
  export const TAG_MAI_INFOS = 2;
  export const TAG_MAI_URL   = 25
}

export interface PIXDynamicElements extends EMVQRCodeBasicElements {
  type: "dynamic";

  //
  url: string;
}

export interface PIXStaticElements extends EMVQRCodeBasicElements {
  type: "static";

  //
  chave: string;

  //
  txid?: string;

  //
  infoAdicional?: string;
}

export type PIXQRCodeElements = PIXStaticElements | PIXDynamicElements;

const defaultParams: EMVMerchantQRParams = {
  encoding: 'utf8',
}

export class PIXQRCode {
  protected _emvQRCode: EMVMerchantQRCode;

  get emvQRCode() { return this._emvQRCode }

  getMAI( ): QRCodeNode {
    let maiList = this.emvQRCode.findIdentifiedTemplate( PIX.GUI, EMVQR.MAI_TEMPLATE_FIRST, EMVQR.MAI_TEMPLATE_LAST );

    return  maiList[ 0 ];
  }

  protected constructor( emvQRCode: EMVMerchantQRCode ) {
    this._emvQRCode = emvQRCode;
  }

  static createCode( elements: PIXQRCodeElements ): PIXQRCode {
    let pixQRCode = new PIXQRCode( EMVMerchantQRCode.createCode( elements ) );
    let emvQRCode = pixQRCode.emvQRCode;

    let guiNode = new QRCodeNode( 'data', PIX.GUI, EMVQR.TAG_TEMPLATE_GUI );

    const maiPIX = emvQRCode.newTemplateElement( EMVQR.MAI_TEMPLATE_FIRST, EMVQR.MAI_TEMPLATE_LAST, true, [ guiNode ] );

    if ( elements.type == "static" ) {
      if ( elements.chave )
        maiPIX.newDataElement( PIX.TAG_MAI_CHAVE, elements.chave );

      if ( elements.infoAdicional )
        maiPIX.newDataElement( PIX.TAG_MAI_INFOS, elements.infoAdicional );

      if ( elements.txid ) {
        let el62 = emvQRCode.newTemplateElement( EMVQR.TAG_ADDITIONAL_DATA );

        el62.newDataElement( EMVQR.TAG_AD_REF_LABEL, elements.txid );
      }
    } else {
      if ( elements.url )
        maiPIX.newDataElement( PIX.TAG_MAI_URL, elements.url );
    }

    return pixQRCode;
  }

  static parseCode( qrCode: string,
                    params?: EMVMerchantQRParams ): PIXQRCode {

    params = {
      ...defaultParams,
      ...params
    };

    let pixQRCode = new PIXQRCode( EMVMerchantQRCode.parseCode( qrCode, params ) );

    return pixQRCode;
  }

  public async validateCode( observer?: ValidationObserver ) {
    await getRuleValidator( ).validate( this, observer );
  }

  isPIX( test: "pix"|"valid"|"static"|"dynamic"): boolean {
    let maiList = this.emvQRCode.findIdentifiedTemplate( PIX.GUI, EMVQR.MAI_TEMPLATE_FIRST, EMVQR.MAI_TEMPLATE_LAST );

    let hasPIX = ( maiList.length == 1 );
    if ( !hasPIX )
      return false;

    let pixMAI = maiList[ 0 ];

    let isStatic = pixMAI.hasElement( PIX.TAG_MAI_CHAVE );
    let isDynamic = pixMAI.hasElement( PIX.TAG_MAI_URL );

    switch( test ) {
      case "pix": return true;
      case "valid": return isStatic || isDynamic;
      case "static": return isStatic;
      case "dynamic": return isDynamic;
    }
  }
}
