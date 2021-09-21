import { Cobranca } from "../../pix-data-schemas/src/mod.ts";

export const testCobV_Nascent: Cobranca = {
  chave: "04363802000117",
  valor: {
    original: "1.23",
  },
  calendario: {
    dataDeVencimento: "2021-09-30",
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
      valor: "85830000018229700212123701997132103643245706",
    },
  ],
};
