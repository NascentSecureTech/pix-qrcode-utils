import { readFileSync } from 'fs';
import { readPkcs12 } from 'pem';
import { JWK, JWS, ProduceKeyInput as Key } from 'jose';

const { asKey } = JWK;
const { sign/*, verify*/ } = JWS;

export class JSONSigner {
  key: Key;

  constructor( key: Key ) {
    this.key = key;
  }

  static async readPFX( filePath: string, passphrase: string ) {
    const result = new Promise<Key>( (resolve, reject) => {
      readPkcs12(
        readFileSync( filePath ),
        { p12Password: passphrase },
        (err,pfx) => {
          if ( err ) {
            reject( err );
          }

          let k: Key = asKey( pfx.key )

          resolve( k );
        }
      );
    });

    return result;
  }

  sign( data: Buffer| string, hdrs?: Object, fmt?: 'base64'|'hex' ) {
    let buff: Buffer;

    if ( data instanceof Uint8Array ) {
      buff = data;
    } else {
      if ( fmt ) {
        buff = Buffer.from( data, fmt );
      }
    }

    if ( buff )
      data = buff.toString('ascii');


    let s = sign( data, this.key, hdrs );

    return s;
  }
}
