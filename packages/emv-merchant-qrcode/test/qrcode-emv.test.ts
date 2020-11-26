import { EMVMerchantQRCode, EMVMerchantQRParams, QRCodeError, QRErrorCode } from '../src/mod.ts';

let testCodes:Record<string,{ qr:string, status:string }> = {
  "itau": {
    qr: "00020101021126590014BR.GOV.BCB.PIX0111168021888300222Teste QR Code Estatico5204000053039865802BR5925PMD Marcws Odriano Mi Sil6009SAO PAULO62600522jTdCUfBqTfOAFjuB9GnnLQ50300017BR.GOV.BCB.BRCODE01051.0.063048E06",
    status: "OK"
  },
  "vero:B64": {
    qr: "MDAwMjAxMDEwMjExMjY0NDAwMTVici5jb20uc2VqYXZlcm85OTIxQUFBa2dBQW1RQUhFb1lBR2dzY0xUNTIwNDUxOTI1MzAzOTg2NTQwNDcuNTA1ODAyQlI1OTE3QmFuY2EgZGFzIFBpcG9jYXM2MDEyUG9ydG8gQWxlZ3JlNjMwNGE0ZTQ=",
    status: "OK"
  },
  "vero-impresso": {
    qr: "00020101021126370015br.com.sejavero0103***0207Texto 1520475215303986540512.505802BR5912Lojista Ltda6012Porto Alegre61089400000062200516BOK-00000000011563040EAE",
    status: "OK"
  },
  "vero-pos": {
    qr: "00020101021226840015br.com.sejavero2561apidev.banrisul.com.br/pix/qrcode/1pjcsYDycZeZ03rGqxHIYpsr0WM5204752153039865802BR5912Lojista Ltda6012Porto Alegre61089400000062070503***63046393",
    status: "OK"
  },

  "brs-static:B64": {
    qr: "MDAwMjAxMDEwMjExMjY3NDAwMTRCUi5HT1YuQkNCLlBJWDAxMjZGVUxBTk8yMDIwIEJBTlJJU1VMLkNPTS5CUjAyMjJJTkZPUk1BQ09FUyBBRElDSU9OQUlTNTIwNDc1MjE1MzAzOTg2NTgwMkJSNTkxNkNBU0EgREFTIFBJUE9DQVM2MDEyUE9SVE8gQUxFR1JFNjI1NTA1MTdCQUUtMTIzNDU2NzgtMjAyMDUwMzAwMDE3QlIuR09WLkJDQi5CUkNPREUwMTA1MS4wLjA2MzA0OEE1RQ==",
    status: "OK"
  },
  "brs-static-url:B64": {
    qr: "MDAwMjAxMDEwMjExMjY3NDAwMTRCUi5HT1YuQkNCLlBJWDAxMjZGVUxBTk8yMDIwIEJBTlJJU1VMLkNPTS5CUjAyMjJJTkZPUk1BQ09FUyBBRElDSU9OQUlTNTIwNDc1MjE1MzAzOTg2NTgwMkJSNTkxNkNBU0EgREFTIFBJUE9DQVM2MDEyUE9SVE8gQUxFR1JFNjI1NTA1MTdCUVEtMTIzNDU2NzgtMjAxOTUwMzAwMDE3QlIuR09WLkJDQi5CUkNPREUwMTA1MS4wLjA2MzA0OUM2Qg",
    status: "OK"
  },

  "brs-dynamic": {
    qr: "00020101021226880014br.gov.bcb.pix2566ww4.banrisul.com.br/bqq/api/pix/qrcode/QxgfFfpI8QzfEEedoZJNLf4bor85204752153039865802BR5921Casa das Pipocas Ltda6012Porto Alegre61089400000062070503***63042DA6",
    status: "OK"
  },

  "Erro:CRC": {
    qr: "00020101021226960014br.gov.bcb.pix2574ww4.banrisul.com.br/bqq/api/pix/qrcode/nightly/hiPxAvkKJJhHdJ8Qp2P4aU3Yb2g5204000053039865802BR5908Banrisul6012Porto Alegre61089001026062070503***6304DAA6",
    status: "CRC"
  },

  "HelloWorld": {
    qr: "00020101021229300012D156000000000510A93FO3230Q31280012D15600000001030812345678520441115802CN5914BEST TRANSPORT6007BEIJING64200002ZH0104最佳运输0202北京540523.7253031565502016233030412340603***0708A60086670902ME91320016A0112233449988770708123456786304A13A",
    status: "OK"
  },
  "PromptPay1": {
    qr: "00020101021229370016A000000677010111011300668711111115802TH53037645406500.006304ABAC",
    status: "CRC"
  },
  "PromptPay2": {
    qr: "00020101021229370016A000000677010111021311111111111115802TH53037645406500.0063043865",
    status: "CRC"
  },
  "PromptPay3": {
    qr: "00020101021229370016A000000677010111011300668711111115802TH53037645406500.006304F230",
    status: "MISSING"
  },
  "PromptPay3:CRC": {
    qr: "00020101021229370016A000000677010111011300668712111115802TH53037645406500.006304F230",
    status: "CRC"
  },
};

const T1NAME = "vero-pos";

Deno.test( {
  name: "T1: Parse basic QR: " + T1NAME,
  fn: async () => {
    let qrs = testCodes[ T1NAME ].qr;

    let qr = EMVMerchantQRCode.parseCode( qrs );
    //console.log( JSON.stringify( qr.toJSON(), null, 2 ) );

    await qr.validateCode();

    if ( qrs != qr.buildQRString() ) {
      throw new Error(  "FAIL: Rebuild is different")
    }

    await qr.validateCode();

    qr.getElement( 63 ).content = "0000";
    if ( qrs != qr.buildQRString() ) {
      throw new Error( "FAIL: Rebuild after reset of CRC is different" );
    }

    qr.newDataElement( 1, "11");

    if ( qrs == qr.buildQRString() ) {
      throw new Error( "FAIL: Recalc CRC after mod is the same")
    }

    let res = await qr.validateCode();
    console.log( res );

    console.log( qr.dumpCode() )
  }})

  if ( 1 ) Object.keys( testCodes ).forEach( key => {
    let test = testCodes[key];
    let qrs = test.qr;

    if ( qrs[0] != "M" ) Deno.test( {
      name: "Parse and validate '" + key + "'",
      fn: async () => {
        let test = testCodes[key];
        let qrs = test.qr;
        let options: EMVMerchantQRParams = {
          //encoding: (key.indexOf( ':B64' ) >= 0) ? "base64" : "utf8"
        }

          let qr = EMVMerchantQRCode.parseCode( qrs, options );

          let result = "OK";

          let res = await qr.validateCode( (_v,_res) => {
            //console.log( v.ruleInfo.id, res.status );
          });

          if ( res.status != "pass" ) {
            result = "ERROR";
            let E = res.error;

            if ( E instanceof QRCodeError ) {
              switch( E.errorCode ) {
                case QRErrorCode.CRC_MISMATCH: result = "CRC"; break;
                case QRErrorCode.MISSING_MANDATORY_ELEMENT: result = "MISSING"; break;
                case QRErrorCode.INVALID_QRCODE: result = "INVALID"; break;
                default: result = "QRCODEERROR"; break;
              }
            }
          }

          if ( result != test.status ) {
            throw new Error( "Unexpected Test Result: " + result + " (should be " + test.status + ")");
          }
        }
  } );
} );
