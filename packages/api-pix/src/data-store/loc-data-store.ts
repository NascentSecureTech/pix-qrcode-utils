import { Location, CobType } from '../deps.ts';

import { DBContext } from './db.ts';
import { APIClientID } from './api-client-id.ts';

//
export interface LocIdentifier extends APIClientID {
  id: number;
  cobType: CobType;
}

//
export interface ILocDataStore {
  //
  newID( context: DBContext, client: APIClientID, cobType: CobType ): Promise<number>;
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
