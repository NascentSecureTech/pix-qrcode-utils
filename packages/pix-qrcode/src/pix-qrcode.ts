import { ValidationObserver } from "./deps.ts";
import { EMVMerchantQRCode, QRCodeNode, EMVMerchantQRParams, EMVQRCodeBasicElements, EMVQR } from "./deps.ts";
import { getRuleValidator, PIXQRCodeError, PIXQRErrorCode } from './pix-qrcode-validator.ts';

export class PIX {
  static GUI = 'br.gov.bcb.pix';

  static TAG_MAI_CHAVE = 1;
  static TAG_MAI_INFO_ADD = 2;
  static TAG_MAI_URL   = 25
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
        maiPIX.newDataElement( PIX.TAG_MAI_INFO_ADD, elements.infoAdicional );

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
    return await getRuleValidator( ).validate( this, observer );
  }

   isPIX( test: "pix"|"valid"|"static"|"dynamic"): boolean {
    let pixMAI = this.getMAI();
    if ( !pixMAI )
      return false;

    let isStatic = pixMAI.hasElement( PIX.TAG_MAI_CHAVE );
    let isDynamic = pixMAI.hasElement( PIX.TAG_MAI_URL );

    switch( test ) {
      case "pix": return true;
      case "valid": return isStatic || isDynamic;
      case "static": return isStatic;
      case "dynamic": return isDynamic;
    }
  }

  extractElements(): PIXQRCodeElements {
    let emvQR = this.emvQRCode
    let basicElements = emvQR.extractElements();

/*    function getDataElement( tag: number ): string {
      if ( emvQR.hasElement( tag ) ) {
        return emvQR.getElement( tag ).content;
      }

      return "";
    }


    let basicElements: EMVQRCodeBasicElements = {
      merchantCategoryCode: getDataElement( EMVQR.TAG_MCC ),
      transactionCurrency: parseInt(getDataElement( EMVQR.TAG_TRANSACTION_CURRENCY ) ),
      transactionAmount: parseFloat( getDataElement( EMVQR.TAG_TRANSACTION_AMOUNT ) ),
      countryCode: getDataElement( EMVQR.TAG_COUNTRY_CODE ),
      merchantName: getDataElement( EMVQR.TAG_MERCHANT_NAME ),
      merchantCity: getDataElement( EMVQR.TAG_MERCHANT_CITY ),
    }*/

    if ( this.isPIX( 'static') ) {
      return {
        type: 'static',
        ...basicElements,
        chave: this.getMAI()?.getElement( PIX.TAG_MAI_CHAVE ).content,
        infoAdicional: this.getMAI()?.getElement( PIX.TAG_MAI_INFO_ADD ).content,
        txid: emvQR.getElement(EMVQR.TAG_ADDITIONAL_DATA)?.getElement(EMVQR.TAG_AD_REF_LABEL)?.content,
      }
    }
    else if( this.isPIX( 'dynamic') ) {
      return {
        type: 'dynamic',
        ...basicElements,
        url: this.getMAI()?.getElement( PIX.TAG_MAI_URL ).content
      }
    }

    throw new PIXQRCodeError( PIXQRErrorCode.INVALID_QRCODE, "Unable to extract static/dynamic elements" )
  }
}
