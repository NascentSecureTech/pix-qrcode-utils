export interface PIXPayload_v2 {
  $version: "v2";

  //
  revisao: number;

  calendario: {
    //
    criacao: string;
    //
    apresentacao: string;
    //
    expiracao?: number;
    //
    vencimento?: string;
    //
    diasAposVencimento?: number;
  }

  devedor?: {
    cpf?: string;
    cnpj?: string;
    nome?: string;
  }

  valor: {
    //
    original?: string;
    //
    final?: string;
    //
    juros?: string;
    //
    multa?: string;
    //
    desconto?: string;
    //
    abatimento?: string;
  }

  //
  chave: string;

  //
  txId: string;

  //
  solicitacaoPagador?: string;

  //
  infoAdicionais: [
    {
      nome: string,
      valor: string
    }
  ];

  //
  status: string;
};
