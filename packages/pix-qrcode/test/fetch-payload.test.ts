import {PIXPayloadRetriever} from '../src/mod.ts';

let url = "api-pix.bancobs2.com.br/spi/v2/28028081-7c87-48fe-94f5-7e6d3096ded0";

url="pix.nascent.com.br/codes/k7nXuhpOMeHbkbNw6UUEoXwdkdM";
let payload = new PIXPayloadRetriever().fetchPayload( url );

let json = await payload;

console.log( json.payload );


//new PIXPayloadRetriever().fetchPayload( url );

let qrs = [
  //"00020101021226850014BR.GOV.BCB.PIX2563PIX-HOM.HOMOLOGACAO.COM.BR/API/BRCODE/ZSX3020382321603660337879520400005303986540544.225802BR5911IRVING KUHN6008BRASILIA62290525ZSX302038232160366033787963049224",
  "00020101021226740014br.gov.bcb.pix2552pix.nascent.com.br/codes/k7nXuhpOMeHbkbNw6UUEoXwdkdM5204752153039865802BR5915Testes Banrisul6012Porto Alegre61089000000062070503***6304802C",
  "00020101021226840014br.gov.bcb.pix2562qrcodepix-h.bb.com.br/pix/766b3e9c-7d5b-4a2c-b912-6f34cb4b0f4c52040000530398654046.545802BR5920EPITACIO NEVES BRAGA6012RONDONOPOLIS62070503***6304B43B",
  "00020101021126950014BR.GOV.BCB.PIX2573spi.hom.cloud.itau.com.br/documentos/ae40f1f9-daa1-41ea-83c7-62fe15efa0a25204000053039865802BR5917TESTE PIX PORTAB 6009SAO PAULO623450300017BR.GOV.BCB.BRCODE01051.0.0630410C4",
  "00020101021226760014BR.GOV.BCB.PIX2554pix-h.safra.com.br/gi/8985c9ad21494cb4bf0bdf2d9928ad48520400005303986540513.135802BR5921COM E IMP SERTIC LTDA6009SAO PAULO62230519202010251755fd714176304CED5",
  "00020101021226760014BR.GOV.BCB.PIX2554pix-h.safra.com.br/gi/972769006bcf4c5ea3d12cb07ee16479520400005303986540413.05802BR5921COM E IMP SERTIC LTDA6009SAO PAULO62230519202010251755fcbd3e56304F64C",
  /*safra_3*/"00020101021226760014BR.GOV.BCB.PIX2554pix-h.safra.com.br/gi/cc39d712fc0646bfaf01348c89ecabe052040000530398654049.455802BR5921COM E IMP SERTIC LTDA6009SAO PAULO62230519202010251755fc725ae63048F33",
  "00020101021226850014BR.GOV.BCB.PIX2563PIX-HOM.HOMOLOGACAO.COM.BR/API/BRCODE/ZSX3020382321603660337879520400005303986540544.225802BR5911IRVING KUHN6008BRASILIA62290525ZSX302038232160366033787963049224"
]

/*async function test() {
  for( let qr of qrs ) {
    let code = PIXQRCode.parseCode( qr );

    console.log( qr );
    code.validateCode();

    //console.log( code.emvQRCode );

    //console.log( code.emvQRCode.findIdentifiedTemplate( GUI_PIX) );

    let tmpl = code.emvQRCode.findIdentifiedTemplate( GUI_PIX, 26, 51 )[ 0 ];

    //tmpl.newElement(25, "pix.nascent.com.br/codes/1.jws" );

    //console.log( code.emvQRCode.buildQRString() );

    let url = tmpl.getElement(25).content;
    console.log( url );

    let payload = new PIXPayloadRetriever().fetchPayload( url );

    let json = await payload;

    console.log( json );
    console.log();
    break;
  }
}*/

//test();


//26840014br.gov.bcb.pix2562qrcodepix-h.bb.com.br/pix/766b3e9c-7d5b-4a2c-b912-6f34cb4b0f4c
//52040000530398654046.545802BR5920EPITACIO NEVES BRAGA6012RONDONOPOLIS62070503***6304B43B",
