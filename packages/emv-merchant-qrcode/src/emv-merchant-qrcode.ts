import * as base64 from "https://deno.land/x/base64/mod.ts";
import { ValidationObserver } from './deps.ts';
import * as EMVQR from './emv-qrcode-tags.ts';
import { QRCodeNode } from './qrcode-node.ts';
import { getRuleValidator } from './qrcode-validator.ts';
import { computeCRC } from './crc.ts';
import { QRCodeError, QRErrorCode } from './qrcode-validator.ts';
import { QRElementSchema, rootEMVSchema } from './element-schema.ts';

export interface EMVMerchantQRParams {
  encoding?: 'utf8'|'base64';
}

const defaultParams: EMVMerchantQRParams = {
  encoding: 'utf8',
}

/*
  Minimum set of data elements (mandatory) for an EMV QR Code
*/
export interface EMVQRCodeMandatoryElements {
  merchantCategoryCode: string;   // EL52

  transactionCurrency: number;    // EL53

  countryCode: string;            // EL58

  merchantName: string;           // EL59

  merchantCity: string;           // EL60
}

export interface EMVQRCodeBasicElements extends EMVQRCodeMandatoryElements {
  oneTime?: boolean;              // EL02

  transactionAmount?: number;     // EL54
}

function convertCode( qrCode: string = '', encoding?: 'utf8' |'base64' ): string {
  switch( encoding ?? 'utf8' ) {
    case 'utf8':
      return qrCode;

    case 'base64': {
      const u8 = base64.toUint8Array(qrCode);

      return new TextDecoder().decode( u8 );
    }

    default:
      throw new QRCodeError( QRErrorCode.INVALID_PARAM, "encoding must be 'utf8' or 'base64'" );
  }
}

export class EMVMerchantQRCode extends QRCodeNode {
  type: "root" = "root";

  protected constructor(
    qrCode?: string,
    params: EMVMerchantQRParams = defaultParams ) {

    // Create root
    super( 'root', convertCode( qrCode, params.encoding ) );
  }

  static createCode( basicElements?: EMVQRCodeBasicElements ): EMVMerchantQRCode {
    let root = new EMVMerchantQRCode( );

    if ( basicElements ) {
      root.newDataElement( EMVQR.TAG_MCC, basicElements.merchantCategoryCode );

      root.newDataElement( EMVQR.TAG_TRANSACTION_CURRENCY, ("000" + basicElements.transactionCurrency).slice(-3) );

      root.newDataElement( EMVQR.TAG_COUNTRY_CODE, basicElements.countryCode );

      root.newDataElement( EMVQR.TAG_MERCHANT_NAME, basicElements.merchantName );

      root.newDataElement( EMVQR.TAG_MERCHANT_CITY, basicElements.merchantCity );

      if ( basicElements.oneTime )
        root.newDataElement( EMVQR.TAG_POI_METHOD, "12" );

      if ( basicElements.transactionAmount )
        root.newDataElement( EMVQR.TAG_TRANSACTION_AMOUNT, basicElements.transactionAmount.toFixed(2) );
    }

    return root;
  }

  static parseCode( qrCode: string,
                    params?: EMVMerchantQRParams ): EMVMerchantQRCode {

    params = {
      ...defaultParams,
      ...params
    };

    let root = new EMVMerchantQRCode( qrCode, params );

    function toTemplate( node: QRCodeNode, isIdentified: boolean, tag: number, lastTag?: number ) {
      for( let index = tag; index <= (lastTag ?? tag); ++index ) {
        if ( node.hasElement( index ) )
          node.getElement( index ).parseAsTemplate( isIdentified );
      }
    }

    // process MAI 26..51
    toTemplate( root, true, EMVQR.MAI_TEMPLATE_FIRST, EMVQR.MAI_TEMPLATE_LAST );

    // EL62 Additional Data Field Template
    if ( root.hasElement( EMVQR.TAG_ADDITIONAL_DATA ) ) {
      toTemplate( root, false, EMVQR.TAG_ADDITIONAL_DATA );

      // Payment system specific .. child 50.99
      toTemplate( root.getElement( EMVQR.TAG_ADDITIONAL_DATA ), true, 50, 99 );
    }

    // EL64 = Language stuff
    toTemplate( root, false, 64 );

    // EL80-99 =
    toTemplate( root, true, 80, 99 );

    return root;
  }

  extractElements(): EMVQRCodeBasicElements {
    let emvQR = this;
    function getDataElement( tag: number ): string {
      if ( emvQR.hasElement( tag ) ) {
        return emvQR.getElement( tag ).content;
      }

      return "";
    }

    let basicElements: EMVQRCodeBasicElements = {
      merchantCategoryCode: getDataElement( EMVQR.TAG_MCC ),
      transactionCurrency: parseInt(getDataElement( EMVQR.TAG_TRANSACTION_CURRENCY ) ),
      countryCode: getDataElement( EMVQR.TAG_COUNTRY_CODE ),
      merchantName: getDataElement( EMVQR.TAG_MERCHANT_NAME ),
      merchantCity: getDataElement( EMVQR.TAG_MERCHANT_CITY ),

      transactionAmount: parseFloat( getDataElement( EMVQR.TAG_TRANSACTION_AMOUNT ) ),
      oneTime: getDataElement( EMVQR.TAG_POI_METHOD ) == '12'
    }

    return basicElements;
  }

  /*
   * Validate QR code by EMV Rules
   */
  async validateCode( observer?: ValidationObserver ) {
    return getRuleValidator().validate( this, observer );
  }

  /*
   * Rebuild string from QR Node structure, calculating correct CRC
   */
  buildQRString(): string {
    let content = this.content;

    // "00" - first element in QR string
    content = this.ensureDataElement( 0, "01" ).buildQRString();

    // build rest (-00,-63) .. passing correct offset
    content += super.buildQRString( content.length );

    // Recalculate CRC - tag "63" - last element in QR string

    // reset CRC with correct length and concat tag+length
    content += this.newDataElement( EMVQR.TAG_CRC, "0000" ).buildQRString( content.length ).slice( 0, -4 );

    // Recalculate CRC .. upto to and including tag+length of "63"
    const crc = computeCRC( content );
    this.getElement( EMVQR.TAG_CRC ).content = crc;

    // reset content
    this.baseOffset = 0;
    this.content = content = content + crc;

    return content;
  }

  dumpCode() {
    function dumpNode( node: QRCodeNode, schema: QRElementSchema, indent: string ): string {
      let result = "";

      if ( node.isType( 'data' ) ) {
        result += indent + ("00"+node.tag).slice(-2)+ ' (' + schema.name + ')' + "\n";
        result += indent + '  '+node.content + "\n";
      }
      else {
        if ( !node.isType( 'root' ) )  {
          result += indent + '('+ ("00"+node.tag).slice(-2)+ '): ' + schema.name + "\n";

          indent += "  ";
        }

        node.elements.forEach( (element: QRCodeNode ) => {
          let nodeSchema = schema?.elementMap?.[ element.tag! ] ?? { name: 'unknown', elementMap: {} };

          result += dumpNode( element, nodeSchema, indent );
        })
      }

      return result;
    }

    return dumpNode( this, rootEMVSchema, "" );
  }
}
