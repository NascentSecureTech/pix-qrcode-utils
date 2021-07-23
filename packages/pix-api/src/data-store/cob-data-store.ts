import { Cobranca, CobType } from '../schemas/mod.ts';
import { ListCobParams } from '../schemas/mod.ts';
import { Paginacao, Paginado } from '../schemas/mod.ts';

import { DBContext } from './db.ts';
import { APIClientID } from './api-client-id.ts';

//
export interface CobIdentifier extends APIClientID {
  txid: string;
  cobType: CobType;
}

export interface CobListIdentifier extends APIClientID {
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
