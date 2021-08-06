import { Location, CobType } from "../../../pix-data-schemas/src/mod.ts";

import {
  DBContext,
  APIClientID,
  ILocDataStore,
  LocIdentifier,
} from "../../../api-pix/src/mod.ts";

export class MemoryLocStore implements ILocDataStore {
  #lastID = 0;

  #locStore = new Map<string, Location>();

  #idToString(id: LocIdentifier) {
    let ids = id.client_id + "/" + id.id;

    console.log(ids);

    return ids;
  }

  //
  constructor( public readonly baseUrl: string ) {
  }

  //
  async newID(
    _context: DBContext,
    id: APIClientID,
    locType: CobType
  ): Promise<number> {

    const nextID = ++this.#lastID;

    const loc: Location = {
      id: nextID,
      tipoLoc: locType,
      criacao: new Date(),
      location: `${this.baseUrl}/${nextID.toString()}`
    }

    const idx: LocIdentifier = {
      ...id,
      id: loc.id,
      cobType: locType,
    }
    const locID = this.#idToString(idx);

    this.#locStore.set(locID, loc);

    return nextID;
  }

  //
  async read(_context: DBContext, id: LocIdentifier): Promise<Location> {
    const locID = this.#idToString(id);

    if (this.#locStore.has(locID)) return this.#locStore.get(locID)!;

    return (null as unknown) as Location;
  }

  //
  async insert(
    _context: DBContext,
    id: LocIdentifier,
    loc: Location
  ): Promise<void> {
    const locID = this.#idToString(id);

    this.#locStore.set(locID, loc);
  }

  //
  async update(
    _context: DBContext,
    id: LocIdentifier,
    loc: Location
  ): Promise<void> {
    const locID = this.#idToString(id);

    if (this.#locStore.has(locID)) this.#locStore.set(locID, loc);
  }

  //
  async delete(_context: DBContext, id: LocIdentifier): Promise<void> {
    const locID = this.#idToString(id);

    if (this.#locStore.has(locID)) this.#locStore.delete(locID);
  }
}
