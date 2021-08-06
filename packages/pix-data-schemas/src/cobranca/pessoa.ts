//
export interface Pessoa {
  //
  cpf?: string;
  //
  cnpj?: string;
  //
  nome?: string;
}

//
export interface PessoaJuridica {
  nomeFantasia?: string;
}

//
export interface Endereco {
  //
  logradouro?: string;
  //
  cidade?:     string;
  //
  uf?:         string;
  //
  cep?:        string;
}
