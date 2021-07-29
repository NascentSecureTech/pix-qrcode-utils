import { IClientTransport, buildPath } from './client-transport.ts';
import { Cobranca, PartialCobranca, CobType, PagedListCobParams } from '../schemas/mod.ts';

export class CobClient {
  constructor( private transport: IClientTransport, public readonly cobType: CobType, public additionalQuery?: Record<string,string> ) {
    //
  }

  async getCobs( params: PagedListCobParams ): Promise<Cobranca[]> {
    const pag = params.paginacao ?? {};

    //Object.keys(params).forEach(key => obj[key] === undefined ? delete obj[key] : {});

    const query: Record<string,string|undefined> = {
      inicio: params?.inicio.toISOString().slice(0,-5)+"Z",
      fim: params?.fim.toISOString().slice(0,-5)+"Z",
      cpf: params.cpf,
      cnpj: params.cnpj,
      locationPresente: (params.locationPresente != undefined) ? (params.locationPresente ? "true":"false"):undefined,
      status: params.status,
      "paginacao.paginaAtual": (pag.paginaAtual !== undefined) ? ""+pag.paginaAtual : undefined,
      "paginacao.itensPorPagina": (pag.itensPorPagina !== undefined) ? ""+pag.itensPorPagina : undefined,
    };

    // remove null entries
    let q2 = Object.fromEntries(Object.entries(query).filter(([_, v]) => v != undefined)) as Record<string,string>;

    const path = buildPath( `${this.cobType}`, q2 );

    const cobs = await this.transport.client.fetchJSON<Cobranca[]>( "GET", path );

    return cobs;
  }

  async getCob( txid: string ): Promise<Cobranca> {
    const path = buildPath( `${this.cobType}/${txid}`, this.additionalQuery );

    const cob = await this.transport.client.fetchJSON<Cobranca>( "GET", path );

    return cob;
  }

  async putCob( txid: string = '', cobIn: Cobranca ): Promise<Cobranca> {
    const path = buildPath( `${this.cobType}/${txid}`, this.additionalQuery );

    const cobOut = await this.transport.client.fetchJSON<Cobranca,Cobranca>( "PUT", path, cobIn );

    return cobOut;
  }

  async patchCob( txid: string, cobIn: PartialCobranca ): Promise<Cobranca> {
    const path = buildPath( `${this.cobType}/${txid}`, this.additionalQuery);

    const cobOut = await this.transport.client.fetchJSON<PartialCobranca,Cobranca>( "PATCH", path, cobIn );

    return cobOut;
  }
}