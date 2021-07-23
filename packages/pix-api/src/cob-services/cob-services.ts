import { Cobranca, ListCobParams, Status, Paginacao, Paginado } from "../schemas/mod.ts";
import { ICobDataStore, CobIdentifier, DBContext } from "../data-store/mod.ts";

export class PixApiCobService {
  #context: DBContext = {};

  constructor( private dataStore: ICobDataStore ) {

  }

  async getCob(id: CobIdentifier): Promise<Cobranca> {
    const cobOut = await this.dataStore.read( this.#context, id );

    if ( cobOut == null ) {
      return Promise.reject();
    }

    return cobOut;
  }

  async putCob(id: CobIdentifier, newCob: Cobranca): Promise<Cobranca> {
    const cob: Cobranca = {
      ...newCob,
      revisao: 1,
      calendario: {
        ...newCob.calendario,
        criacao: "",
        expiracao: newCob.calendario?.expiracao ?? 60,
      },
      txid: id.txid,
      status: "ATIVA",
    };

    this.dataStore.insert( this.#context, id, cob );

    return cob;
  }

  async patchCob(id: CobIdentifier, newCob: Cobranca): Promise<Cobranca> {
    const existingCob = await this.dataStore.read( this.#context, id );

    if ( !existingCob ) {
      return Promise.reject();
    }

    const cob: Cobranca = {
      ...existingCob,
      ...newCob,
      revisao: existingCob.revisao! + 1,
    };

    this.dataStore.insert( this.#context, id, cob );

    return cob;
  }

  async listCobs(params: ListCobParams & { paginacao: Paginacao } ): Promise<Paginado<Cobranca>> {
    const list = this.dataStore.list( params );

    return list;
  }
}
