import { Calendario } from './calendario.ts';
import { Pessoa, Endereco } from './pessoa.ts';
import { Valor, ValorDesconto } from './valor.ts';
import { Location } from './location.ts';
import { InfoAdicional } from './info-adicional.ts';
import { Status } from './status.ts';

export interface Cobranca {
  /** Os campos aninhados sob o identificador calendário organizam informações a respeito de controle de tempo da cobrança. */
  calendario?: Calendario;

  /** O campo chave determina a chave Pix registrada no DICT que será utilizada para a cobrança. */
  chave: string;

  //
  devedor?: Pessoa & Endereco;

  /** Cada respectiva informação adicional contida na lista (nome e valor) deve ser apresentada ao pagador. */
  infoAdicionais?: InfoAdicional[];

  //
  loc?: Location;

  //
  location?: string;

  //
  recebedor?: Pessoa & Endereco;

  //
  revisao?: number;

  /** O campo solicitacaoPagador, opcional, determina um texto a ser apresentado ao pagador para que ele possa digitar uma informação correlata, em formato livre, a ser enviad
a ao recebedor. */
  solicitacaoPagador?: string;

  //
  status?: Status;

  //
  txid?: string;

  //
  valor: Valor;
}

export interface PartialValor extends Partial<Omit<Valor,"desconto">> {
  desconto?: Partial<ValorDesconto>;
}

export interface PartialCobranca  {
  //
  calendario?: Partial<Calendario>;

  //
  chave?: string;

  //
  devedor?: Partial<Pessoa & Endereco>;

  //
  infoAdicionais?: InfoAdicional[];

  //
  loc?: Location;

  //
  recebedor?: Partial<Pessoa & Endereco>;

  //
  solicitacaoPagador?: string;

  //
  valor?: PartialValor;
}
