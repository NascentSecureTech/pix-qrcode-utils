import { Cobranca, Status } from '../../cobranca/mod.ts';
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
  loteCobvId?: number;
}

export interface ResultPaginacao extends Paginacao {
  quantidadeDePaginas: number;
  quantidadeTotalDeItens: number;
}

export interface PagedListCobParams extends ListCobParams {
  //
  paginacao?: Paginacao;
}

export interface CobsList {
  parametros: {
    paginacao: ResultPaginacao;
  },
  cobs: Cobranca[];
}