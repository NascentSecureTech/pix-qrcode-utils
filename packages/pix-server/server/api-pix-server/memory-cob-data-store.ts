import { Cobranca } from '../../../pix-api/src/mod.ts';
import { DBContext, ICobDataStore, CobListIdentifier, CobIdentifier } from '../../../pix-api/src/mod.ts';
import { ListCobParams, Paginacao, Paginado } from '../../../pix-api/src/mod.ts';

export class MemoryCobStore implements ICobDataStore {
  #cobStore = new Map<string, Cobranca>() ;

  #idToString( id: CobIdentifier ) {
    let ids = id.client_id + '/' + id.txid;

    console.log( ids );

    return ids;
  }

  //
  async list( _context: DBContext, _id: CobListIdentifier, _params: ListCobParams, paginacao?: Paginacao ): Promise<Paginado<Cobranca>> {
    const pageInfo = {
      paginaAtual: (paginacao?.paginaAtual) ?? 0,
      itensPorPagina: (paginacao?.itensPorPagina) ?? 100,
    }
    const firstItem = pageInfo.paginaAtual * pageInfo.itensPorPagina;

    const items = Array.from( this.#cobStore.values() );

    return {
      ...pageInfo,
      itensPorPagina: paginacao?.itensPorPagina ?? 100,
      quantidadeDePaginas: Math.round( items.length / pageInfo.itensPorPagina ),
      quantidadeTotalDeItens: items.length,
      items: items.slice( firstItem, firstItem + pageInfo.itensPorPagina )
    }
  }

  //
  async read( _context: DBContext, id: CobIdentifier ): Promise<Cobranca> {
    const cobID = this.#idToString( id );

    if ( this.#cobStore.has( cobID ) )
      return this.#cobStore.get( cobID )!;

    return null as unknown as Cobranca;
  }

  //
  async insert( _context: DBContext, id: CobIdentifier, cob: Cobranca ): Promise<void> {
    const cobID = this.#idToString( id );

    this.#cobStore.set( cobID, cob );
  }

  //
  async update( _context: DBContext, id: CobIdentifier, cob: Cobranca ): Promise<void> {
    const cobID = this.#idToString( id );

    if ( this.#cobStore.has( cobID ) )
      this.#cobStore.set( cobID, cob );
  }

  //
  async delete( _context: DBContext, id: CobIdentifier ): Promise<void> {
    const cobID = this.#idToString( id );

    if ( this.#cobStore.has( cobID ) )
      this.#cobStore.delete( cobID );
  }
}
