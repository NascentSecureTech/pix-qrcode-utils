//import { Cobranca } from "../../pix-data-schemas/src/mod.ts";
import { initCobClient, mustFail, generateTXID } from "./api-test-helper.ts";
import { testCobV_Nascent } from './cobv-test-data.ts';

Deno.test({
  name: "COBV failures - TXID",
  fn: async () => {
    let client = await initCobClient();
    let txid = generateTXID();

    await mustFail( "GET TXID inexistente", () => {
      return client.getCob( txid );
    }, [404] );

    await mustFail( "PUT: TXID present in JSON", () => {
      return client.putCob(txid, {
        ...testCobV_Nascent,
        txid: "TXID5678901234567890123456"        }
    )}, [400] );

    await mustFail( "PUT: TXID smaller than 26", () => {
      return client.putCob("TXID567890123456789012345", {
        ...testCobV_Nascent,
      }
    )}, [400] );

    await mustFail( "PUT: TXID invalid characters", () => {
      return client.putCob("TXID567890123456789012345-$%ˆ&!@#", {
        ...testCobV_Nascent,
      }
    )}, [400] );

    /*const newCob = */await client.putCob(txid, testCobV_Nascent );

    await mustFail( "TXID duplicate", () => {
      return client.putCob(txid, {
        ...testCobV_Nascent,
      }
    )}, [400] );
  },
});

Deno.test({
  name: "COBV failures - Calendario",
  fn: async () => {
    let client = await initCobClient();
    let txid = generateTXID();

    await mustFail( "Invalid characters in no dataDeVencimento", () => {
      return client.putCob(txid, {
        ...testCobV_Nascent,
        calendario: { dataDeVencimento: "xxxxxx" }
      }
    )}, [400] );

    await mustFail( "PUT: calendario.criacao present", () => {
      return client.putCob(txid, {
        ...testCobV_Nascent,
        calendario: { criacao: "2021-09-17T18:46:03.61Z" }
      }
    )}, [400] );

    await mustFail( "PUT: COBV já vencida", () => {
      return client.putCob(txid, {
        ...testCobV_Nascent,
        calendario: {
          ...testCobV_Nascent.calendario,
          dataDeVencimento: "2021-01-01"
        },
      }
    )}, [400] );

  },
});

Deno.test({
  name: "COBV failures - Chave",
  fn: async () => {
    let client = await initCobClient();
    let txid = generateTXID();

    await mustFail( "PUT: Chave não cadastrada", () => {
      return client.putCob(txid, {
        ...testCobV_Nascent,
        chave: "00000000000"
      }
    )}, [400] );

    await mustFail( "PUT: Incorrect chave for client", () => {
      return client.putCob(txid, {
        ...testCobV_Nascent,
        chave: "0f0a3329-c503-4ab6-b497-94e71c060761"
      }
    )}, [400] );

  },
});
