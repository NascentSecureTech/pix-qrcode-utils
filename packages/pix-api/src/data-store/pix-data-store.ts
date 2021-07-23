import { Cobranca } from '../schemas/mod.ts';
import { ListCobParams } from '../schemas/mod.ts';
import { Paginacao, Paginado } from '../schemas/mod.ts';

import { DBContext } from './db.ts';
import { APIClient } from './api-client.ts';

export interface CobIdentifier extends APIClient {
  txid: string;
}

//
export interface ICobDataStore {
  //
  list( params: ListCobParams, paginacao?: Paginacao ): Promise<Paginado<Cobranca>>;
  //
  read( context: DBContext, id: CobIdentifier ): Promise<Cobranca>;
  //
  insert( context: DBContext, id: CobIdentifier, cob: Cobranca ): Promise<void>;
  //
  update( context: DBContext, id: CobIdentifier, cob: Cobranca ): Promise<void>;
  //
  delete( context: DBContext, id: CobIdentifier ): Promise<void>;
}
