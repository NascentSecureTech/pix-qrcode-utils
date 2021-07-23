//
export type TipoCob = 'cob'|'cobv';

//
export interface Location {
  id: Number;
  txid?: string;
  location: string;
  tipoLoc: TipoCob;
  criacao?: Date;
}
