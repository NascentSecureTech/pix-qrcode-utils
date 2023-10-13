import { Cobranca } from "../../pix-data-schemas/src/mod.ts";

// 5ae6701e4dbb40a4a2bf2c299f3ca3d9
// 65ce4a3d0a9949a5bd4c55d6adec7518
// 2506b2343c0c4d93aee722ce9b9ff217
// bb14bb6cf5fa44d796dad336643a6f12
export const testCobV_Nascent: Cobranca = {
  chave: "04363802000117",
  valor: {
    original: "1.23",
  },
  calendario: {
    dataDeVencimento: "2023-12-31",
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
      valor: "85880000000012312347357300000000000000000010",
    },
  ],
};

export const testCob_Nascent: Cobranca = {
  chave: "04363802000117",
  valor: {
    original: "1.23",
  },
  calendario: {
    //dataDeVencimento: "2023-12-31",
    //validadeAposVencimento: 1,
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
      valor: "85880000000012312347357300000000000000000010",
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
