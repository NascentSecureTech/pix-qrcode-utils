import { Cobranca } from "../../pix-data-schemas/src/mod.ts";
import { CobClient, Fetcher, JSONFetcher, PayloadClient } from "../src/mod.ts";
import { authenticate, getFetcher, generateTXID } from "./api-test-helper.ts";
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

      debug: false,
    };
    const token = await authenticate(config);

    const fetcher = getFetcher(config, token);
    console.log("\n");

    // BB requires a non-standard query-param
    let gwAppKey = (config as any)["gw-dev-app-key"];

    let client = new CobClient(
      fetcher,
      "cobv",
      gwAppKey ? { "gw-dev-app-key": gwAppKey } : undefined
    );

    for (let i = 0; i < 1; ++i) {
      let txid = generateTXID();

      let cobIn = await client.putCob(txid, testCobV_Nascent ); // testCobVIn )//minCob );

      let payloadClient = new PayloadClient();

      const pl = await payloadClient.fetchPayload("https://" + cobIn.loc!.location);

      console.log( "PAYLOAD:", pl );

      /*let cobOut = *//*await client.getCob(txid);*/
    }
  },
});
