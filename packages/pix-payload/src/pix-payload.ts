export * from './fetch-payload.ts';
import { PIXPayload_v1 } from './pix-payload-v1.ts';

export type PIXPayload = PIXPayload_v1;

const ex: PIXPayload_v1 = {
  $version: "v1",
  txId: "fc9a4366-ff3d-4964-b5db-c6c91a8722d3",
  revisao: 3,
  calendario: {
    criacao: "2020-09-15T19:39:54.013Z",
    apresentacao: "2020-04-01T18:00:00Z",
    expiracao: 3600
  },
  status: "ATIVA",

  valor: {
    original: "500.00",
    final: "500.00"
  },

  chave: "7407c9c8-f78b-11ea-adc1-0242ac120002",

  solicitacaoPagador: "Informar cartão fidelidade",

  infoAdicionais: [
    { nome: "quantidade",
      valor: "2"
    }
  ]
}

export namespace PIXPayload {
  export function fromJSON_v1( obj: {} ): PIXPayload_v1 {
    let payload = {
      $version: "v1",
      ...obj
    };

    // TODO: Convert

    return payload as PIXPayload_v1;
  }


  export function fromJSON( obj: {}, version: number = 1 ) {
    switch( version ) {
      default:
      case 1:
        return fromJSON_v1( obj );
    }
  }

  export function validatePayload( _payload: PIXPayload_v1 ) {
    //
  }
}
