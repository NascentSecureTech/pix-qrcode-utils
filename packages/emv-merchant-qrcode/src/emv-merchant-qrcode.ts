import { QRCodeNode, TAG_CRC } from './qrcode-node.ts';
import { QRCodeValidator } from './qrcode-validator.ts';
import { computeCRC } from './crc.ts';
export { QRCodeError, QRErrorCode } from './qrcode-validator.ts';
import { QRSchemeElement, rootScheme } from './element-scheme.ts';

export interface EMVMerchantQRParams {
  encoding?: 'utf8' |'base64';
  validate?: boolean;
}

const defaultParams: EMVMerchantQRParams = {
  encoding: 'utf8',
  validate: false,
}

function convertCode( qrCode?: string, _encoding?: string ): string {
  return qrCode ?? '';
}

export class EMVMerchantQRCode extends QRCodeNode {
  type: "root" = "root";

  protected constructor(
    qrCode?: string,
    params: EMVMerchantQRParams = defaultParams ) {

    // Create root
    super( 'root', convertCode( qrCode, params.encoding ) );
  }

  static parseCode( qrCode: string,
                    params: EMVMerchantQRParams = defaultParams ): EMVMerchantQRCode {

    params = {
      ...defaultParams,
      ...params
    };

    let root = new EMVMerchantQRCode( qrCode, params );

    function toContainer( node: QRCodeNode, isIdentified: boolean, tag: number, lastTag?: number ) {
      for( let index = tag; index <= (lastTag ?? tag); ++index ) {
        if ( node.hasElement( index ) )
          node.getElement( index ).parseAsTemplate( isIdentified );
      }
    }

    // process MAI 26..51
    toContainer( root, true, 26, 51 );

    // EL62 Additional Data Field Template
    if ( root.hasElement( 62 ) ) {
      toContainer( root, false, 62 );

      // Payment system specific
      toContainer( root.getElement( 62 ), true, 50, 99 );
    }

    // EL64 = Language stuff
    toContainer( root, false, 64 );

    toContainer( root, true, 80, 99 );

    if ( params.validate )
      QRCodeValidator.validateRoot( root );

    return root;
  }

  validateCode( ) {
    QRCodeValidator.validateRoot( this );
  }


  buildQRString(): string {
    let content = this.content;

    // "00" - first element in QR string
    content = this.ensureElement( 0, "01" ).buildQRString();

    // build rest (-00,-63) .. passing correct offset
    content += super.buildQRString( content.length );

    // Recalculate CRC - tag "63" - last element in QR string

    // reset CRC with correct length and concat tag+length
    content += this.newElement( TAG_CRC, "0000" ).buildQRString( content.length ).slice( 0, -4 );

    // Recalculate CRC .. upto to and including tag+length of "63"
    const crc = computeCRC( content );
    this.getElement( TAG_CRC ).content = crc;

    // reset content
    this.baseOffset = 0;
    this.content = content = content + crc;

    return content;
  }

  dumpCode() {
    function dumpNode( node: QRCodeNode, scheme: QRSchemeElement, indent: string ): string {
      let result = "";

      if ( node.isType( 'element') ) {
        result += indent + ("00"+node.tag).slice(-2)+ ' (' + scheme.name + ')' + "\n";
        result += indent + '  '+node.content + "\n";
      }
      else {
        if ( !node.isType( 'root' ) )  {
          result += indent + '('+ ("00"+node.tag).slice(-2)+ '): ' + scheme.name + "\n";

          indent += "  ";
        }

        node.elements.forEach( (element: QRCodeNode ) => {
          let nodeScheme: QRSchemeElement = scheme?.elementMap?.[ element.tag! ] ?? { name: 'unknown', elementMap: {} };

          result += dumpNode( element, nodeScheme, indent );
        })
      }

      return result;
    }

    return dumpNode( this, rootScheme, "" );
  }
}
