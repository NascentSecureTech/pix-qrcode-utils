import { Cobranca, CobType } from '../schemas/mod.ts';
import { ListCobParams } from '../schemas/mod.ts';
import { Paginacao, Paginado } from '../schemas/mod.ts';

import { DBContext } from './db.ts';
import { APIClient } from './api-client.ts';

//
export interface CobIdentifier extends APIClient {
  txid: string;
  cobType: CobType;
}

export interface CobListIdentifier extends APIClient {
  cobType: CobType;
}

//
export interface ICobDataStore {
  //
  list( context: DBContext, id: CobListIdentifier, params: ListCobParams, paginacao?: Paginacao ): Promise<Paginado<Cobranca>>;
  //
  read( context: DBContext, id: CobIdentifier ): Promise<Cobranca>;
  //
  insert( context: DBContext, id: CobIdentifier, cob: Cobranca ): Promise<void>;
  //
  update( context: DBContext, id: CobIdentifier, cob: Cobranca ): Promise<void>;
  //
  delete( context: DBContext, id: CobIdentifier ): Promise<void>;
}
