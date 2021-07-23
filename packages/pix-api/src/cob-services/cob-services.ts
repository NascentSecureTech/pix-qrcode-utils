import {
  Cobranca,
  ListCobParams,
  /*Status, */Paginacao, Paginado,
} from "../schemas/mod.ts";
import { CobType } from "../schemas/mod.ts";
import { ICobDataStore, ILocDataStore, CobListIdentifier, CobIdentifier, DBContext } from "../data-store/mod.ts";

export class PixApiCobService {
  #context: DBContext = {};

  constructor(
    private dataStore: ICobDataStore,
    private locStore: ILocDataStore,
    private cobType: CobType = "cob"
  ) {}

  async getCob(id: CobIdentifier): Promise<Cobranca> {

    if ( id.cobType != this.cobType ) {
      return Promise.reject();
    }

    const cobOut = await this.dataStore.read(this.#context, id);

    if (cobOut == null) {
      return Promise.reject();
    }

    return cobOut;
  }

  async putCob(id: CobIdentifier, newCob: Cobranca): Promise<Cobranca> {
    if ( id.cobType != this.cobType ) {
      return Promise.reject();
    }

    let locID = newCob?.loc?.id;

    if ( !locID ) {
      // alloc new id
      locID = await this.locStore.newID(this.#context, id, this.cobType);
    }
    else {
      // dissassociate e reassociate locID
    }

    const locIdentifier = {
      client_id: id.client_id,
      cobType: this.cobType,
      id: locID
    }

    // get Location
    let loc = await this.locStore.read( this.#context, locIdentifier )

    loc.txid = id.txid;

    await this.locStore.update( this.#context, locIdentifier, loc )

    const cob: Cobranca = {
      ...newCob,
      revisao: 1,
      calendario: {
        ...newCob.calendario,
        criacao: new Date( Date.now() ).toISOString(),
        expiracao: newCob.calendario?.expiracao ?? 60,
      },
      loc,
      txid: id.txid,
      status: "ATIVA",
    };

    this.dataStore.insert(this.#context, id, cob);

    return cob;
  }

  async patchCob(id: CobIdentifier, newCob: Cobranca): Promise<Cobranca> {
    const existingCob = await this.dataStore.read(this.#context, id);

    if (!existingCob) {
      return Promise.reject();
    }

    const cob: Cobranca = {
      ...existingCob,
      ...newCob,
      revisao: existingCob.revisao! + 1,
    };

    this.dataStore.update(this.#context, id, cob);

    return cob;
  }

  async listCobs(
    params: ListCobParams & { paginacao: Paginacao },
    id: CobListIdentifier
  ): Promise<Paginado<Cobranca>> {
    const list = this.dataStore.list(this.#context, id, params);

    return list;
  }
}
