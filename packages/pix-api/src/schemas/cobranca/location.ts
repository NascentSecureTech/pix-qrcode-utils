//
export type CobType = 'cob'|'cobv';

//
export interface Location {
  id: number;
  txid?: string;
  location: string;
  tipoLoc: CobType;
  criacao?: Date;
}
