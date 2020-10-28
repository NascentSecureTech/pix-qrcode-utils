export interface PIXPayload_v1 {
  $version: "v1";

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
    recebivelAposVencimento?: boolean;
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
    final: string;
    //
    juros?: string;
    //
    multa?: string;
    //
    desconto?: string;
    //
    permiteAlteracao?: boolean;
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
