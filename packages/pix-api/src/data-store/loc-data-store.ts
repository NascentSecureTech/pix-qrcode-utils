import { Location, CobType } from '../schemas/mod.ts';

import { DBContext } from './db.ts';
import { APIClient } from './api-client.ts';

//
export interface LocIdentifier extends APIClient {
  id: number;
  cobType: CobType;
}

//
export interface ILocDataStore {
  //
  newID( context: DBContext, client: APIClient, cobType: CobType ): Promise<number>;
  //
  //list( context: DBContext, id: CobListIdentifier, params: ListCobParams, paginacao?: Paginacao ): Promise<Paginado<Cobranca>>;
  //
  read( context: DBContext, id: LocIdentifier ): Promise<Location>;
  //
  insert( context: DBContext, id: LocIdentifier, cob: Location ): Promise<void>;
  //
  update( context: DBContext, id: LocIdentifier, cob: Location ): Promise<void>;
  //
  delete( context: DBContext, id: LocIdentifier ): Promise<void>;
}
