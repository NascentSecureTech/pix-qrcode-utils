import { Status } from '../../cobranca/mod.ts';
import { Paginacao } from '../paginacao.ts';

export interface ListCobParams {
  //
  inicio: Date;
  //
  fim: Date;
  //
  cpf?: string;
  //
  cnpj?: string;
  //
  locationPresente?: boolean;
  //
  status?: Status;
  //
  loteCobvId?: Number;
}

export interface PagedListCobParams extends ListCobParams {
  //
  paginacao?: Paginacao;
}
