import { Cobranca } from "../../pix-data-schemas/src/mod.ts";

export const testCobV_Nascent: Cobranca = {
  chave: "04363802000117",
  valor: {

    original: "21.98",
  },
  calendario: {
    dataDeVencimento: "2021-12-31",
    validadeAposVencimento: 1,
  },
  devedor: {
    nome: "João Tondão",
    cpf: "47515902000",
    //     "cnpj": "19917885250123"
  },
  infoAdicionais: [
    {
      nome: "tipo",
      valor: "ITDC",
    },
    {
      nome: "codigo_de_barras",
      valor: "85800000000219812342129401022272100002842506",
    },
  ],
};

export const testCobV_BanrisulProduction: Cobranca = {
  chave: "c5cdeff9-a438-41ed-b7f2-bffba325ea0f",
  valor: {
    original: "1.23",
  },
  calendario: {
    dataDeVencimento: "2021-12-30",
    validadeAposVencimento: 1,
  },
  devedor: {
    nome: "E. Melhor Jair Pagando",
    cpf: "12345678909",
  },
  infoAdicionais: [
    {
      nome: "tipo",
      valor: "ITDC",
    },
    {
      nome: "codigo_de_barras",
      valor: "86880000000012320672129401022272100002842506",
    },
  ],
};
