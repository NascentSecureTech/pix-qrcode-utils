//
export interface ValorDesconto {
  //
  modalidade:       string;
  //
  descontoDataFixa: DescontoDataFixa[];
}

//
export interface DescontoDataFixa {
  //
  data:      Date;
  /** Desconto em valor absoluto ou percentual por dia, útil ou corrido, conforme valor.desconto.modalidade */
  valorPerc: string;
}

//
export interface ModalidadeValorPerc {
  //
  modalidade: string;
  //
  valorPerc:  string;
}

//
export interface Valor {
  /** Valor original da cobrança. */
  original: string;

  /** Campo determina se o valor final do documento pode ser alterado pelo pagador. Na ausência desse campo, assume-se que não se pode alterar o valor do do
  cumento de cobrança, ou seja, assume-se o valor 0. Se o campo estiver presente e com valor 1, então está determinado que o valor final da cobrança pode ter seu valor alterado pelo
   pagador. */
  modalidadeAlteracao?: number;

  /** Juro aplicado à cobrança */
  juros?: ModalidadeValorPerc;

  /** Multa aplicada à cobrança */
  multa?: ModalidadeValorPerc;

  /** Abatimento aplicado à cobrança */
  abatimento?: ModalidadeValorPerc;

  /** Descontos absolutos aplicados à cobrança. */
  desconto?: ValorDesconto;
}

//
export interface ValorFinal {
  /** Valor original da cobrança. */
  original?: string;

  /** Multa aplicada à cobrança */
  multa?: string;

  /** Juro aplicado à cobrança */
  juros?: string;

  /** Abatimento aplicado à cobrança */
  abatimento?: string;

  /** Descontos aplicados à cobrança */
  desconto?: string;

  /** Valor final da cobrança. */
  final: string;
}
