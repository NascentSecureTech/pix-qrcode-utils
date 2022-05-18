import { RuleValidator, ValidationError } from './deps.ts';
import { PIXQRCode, PIX } from './pix-qrcode.ts';

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

export class PIXQRCodeError extends ValidationError<PIXQRErrorCode> {
  constructor( public errorCode: PIXQRErrorCode, message?: string ) {
    super( errorCode, message );

    this.errorName = "PIXQR-" + PIXQRErrorCode[ errorCode ];
  }
}

function addStaticRules( v: RuleValidator<PIXQRCode> ) {
  v.addRule( {
    id: "pix-static-txid",
    when: ( pix ) => pix.isPIX( "static"),
    description: "Contains a PIX Merchant Account Information",
    rule: ( _pix ) => {
    }
  })

}

function addDynamicRules( v: RuleValidator<PIXQRCode> ) {
  v.addRule( {
    id: "pix-dynamic-txid",
    when: ( pix ) => pix.isPIX( "dynamic" ),
    description: "Correct URL coded in dynamic PIX",
    rule: ( pix ) => {
      const url = pix.getMAI().getElement( PIX.TAG_MAI_URL );

      if ( url && url.content.startsWith( "http") )
        throw new PIXQRCodeError( PIXQRErrorCode.PIX_MAI_INVALID, "URL must not contain protocol (https://)" );
    }
  })

}

export function getPIXRuleValidator( ): RuleValidator<PIXQRCode> {
  const v = RuleValidator.get<PIXQRCode>( { id: "PIXQR" } )
    .addRule( {
      id: "pix-mai",
      description: "Contains a PIX Merchant Account Information",
      rule: ( pix ) => {
        const maiList = pix.emvQRCode.findIdentifiedTemplate( PIX.GUI, 26, 51 );

        if ( maiList.length == 0 ) {
          throw new PIXQRCodeError( PIXQRErrorCode.MISSING_PIX_MAI, "PIX MAI not found")
        }

        if ( maiList.length > 1 ) {
          throw new PIXQRCodeError( PIXQRErrorCode.DUPLICATE_PIX_MAI, "PIX MAI duplicated")
        }
      }
    })
    .addRule( {
      id: "pix-static-or-dynamic",
      description: "Contains a PIX Merchant Account Information",
      rule: ( pix ) => {
        const pixMAI = pix.getMAI();

        // 3. PIX-MAI contents must indicate CHAVE or URL
        const pixStatic = pixMAI.hasElement( PIX.TAG_MAI_CHAVE );

        if( pixStatic ) {
          if ( pixMAI.hasElement( PIX.TAG_MAI_URL ) ) {
            throw new PIXQRCodeError( PIXQRErrorCode.PIX_MAI_INVALID, "PIX MAI contains both CHAVE and URL elements")
          }
        }
        else { // must be dynamic
          if ( !pixMAI.hasElement( PIX.TAG_MAI_URL ) ) {
            throw new PIXQRCodeError( PIXQRErrorCode.PIX_MAI_INVALID, "PIX MAI contains neither static or dynamic elements")
          }
        }
      }
    });

  addStaticRules( v );
  addDynamicRules( v );

  return v;
}
