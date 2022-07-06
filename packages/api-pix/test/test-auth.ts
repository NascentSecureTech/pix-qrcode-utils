import { CobClient } from "../src/mod.ts";
import { authenticate, getFetcher, timedExec } from "./api-test-helper.ts";

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

      debug: true,

      // these are mine ..
      ...(await import("./test-credentials.ts")).banrisulHomolNascentMTLS // banrisulHomolSeanTLS//  Nascent,// DevSean, //siCoob, // bancoDoBrasil, //gerenciaNet, //banrisulDev, //
    };
    const token = await authenticate(config);
    const fetcher = getFetcher(config, token);

    // BB requires a non-standard query-param
    const gwAppKey = (config as {["gw-dev-app-key"]?: string})["gw-dev-app-key"];

    const client = new CobClient(
      fetcher,
      "cobv",
      gwAppKey ? { "gw-dev-app-key": gwAppKey } : undefined
    );

    const txid = "992efc8888f14a4983aa674d816d3f97";
    await timedExec<void>( {
      init: async () => {
      },
      exec: async ( ) => {
        const _cobOut = await client.getCob(txid);
      },
      cleanup: async( ) => {
      },
      count: 1 } );
  },
});
