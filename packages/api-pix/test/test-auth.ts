import { Cobranca } from "../../pix-data-schemas/src/mod.ts";
import { CobClient, Fetcher, JSONFetcher, PayloadClient } from "../src/mod.ts";
import { authenticate, getFetcher, generateTXID, timedExec } from "./api-test-helper.ts";
import { testCobV_Nascent } from './cobv-test-data.ts';

Deno.test({
  name: "AUTH test",
  fn: async () => {
    const config = {
      /********** paste test credentials here ..
      clientId: "CLIENT_ID",
      clientSecret: "CLIENT_SECRET",
      tokenUri: "TOKEN_URI",
      baseUrl: "BASE_URL",
      mtlsProxyHost: "PROXY_URL", // se for rotear pelo mtlsProxy do pix-server
      */

      // these are mine ..
      ...(await import("./test-credentials.ts")).banrisulHomolNascent, //siCoob, // bancoDoBrasil, //gerenciaNet, //banrisulDev, //

      //debug: true,
    };
    const token = await authenticate(config);
    const fetcher = getFetcher(config, token);

    // BB requires a non-standard query-param
    let gwAppKey = (config as any)["gw-dev-app-key"];

    let client = new CobClient(
      fetcher,
      "cobv",
      gwAppKey ? { "gw-dev-app-key": gwAppKey } : undefined
    );

    const txid = "992efc8888f14a4983aa674d816d3f97";
    await timedExec<void>( {
      init: async () => {
      },
      exec: async ( ) => {
        const cobOut = await client.getCob(txid);
      },
      cleanup: async( ) => {
      },
      count: 1 } );
  },
});
