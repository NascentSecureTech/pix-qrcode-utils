import { RuleValidator, ValidationError, ElementSchema, ElementValidator } from '../deps.ts';
import { Cobranca } from '../cobranca/cobranca.ts';

function addStaticRules( v: RuleValidator<Cobranca> ) {
  v.addRule( {
    id: "cobranca-txid",
    //when: ( pix ) => pix.isPIX( "static"),
    rule: ( _cob ) => {

    }
  })

}
