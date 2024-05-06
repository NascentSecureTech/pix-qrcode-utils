import { CobClient } from "../src/mod.ts";
import {
  ClientCredentialsFlowClient,
  Fetcher,
  JSONFetcher,
  FetchOptions,
  OAuth2ClientConfig,
  OAuth2Token,
} from "../src/mod.ts";
import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts";

import { authenticate, getFetcher, timedExec } from "./api-test-helper.ts";
import { Cobranca } from "../src/deps.ts";
import {testCobV_Nascent, testCob_Nascent} from './cobv-test-data.ts';

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
      ...(await import("./test-credentials.ts")).banrisulProduction
        //.banrisulHomolJairoMTLS
        // banrisulHomolNascentMTLS//banrisulHomolNascentORG// banrisulHomolNascentMTLS  // NascentMTLS // banrisulHomolSeanTLS//  Nascent,// DevSean, //siCoob, // bancoDoBrasil, //gerenciaNet, //banrisulDev, //
    };
    const token = await authenticate(config);
    const fetcher = getFetcher(config, token);

    console.log( "token", token.accessToken );
    const url = "https://api-h.banrisul.com.br/pix/status";

    const resp = await Fetcher.fetchRequest(
      url,
      Fetcher.buildFetchRequest("GET", {
        headers: { accept: "application/json" },
      })
    );

    console.log("Status=", await resp.text() );

    // BB requires a non-standard query-param
    const gwAppKey = (config as {["gw-dev-app-key"]?: string})["gw-dev-app-key"];

    const client = new CobClient(
      fetcher,
      "cob",
      gwAppKey ? { "gw-dev-app-key": gwAppKey } : undefined
    );

    let items = 0;
    const itensPorPagina = 1000;
    let paginaAtual = Math.trunc(0 / itensPorPagina);
    let totalItems = -1;

    paginaAtual = 1;
    while( totalItems == -1 || items <= totalItems ) {
      const t = new Date();

      //if (paginaAtual == 4) break;

      const cobsIn = await client.getCobs( {
        inicio: new Date("Thu, 1 Jan 2024 00:00:00 GMT"),
        fim: new Date(),
        paginacao: {
          itensPorPagina,
          paginaAtual,
        }
      });

      const pag = cobsIn.parametros.paginacao?.paginaAtual ?? 0;
      totalItems = cobsIn.parametros.paginacao?.quantidadeTotalDeItens;

      if ( pag != paginaAtual )
        break;
      if (cobsIn.cobs.length == 0)
        break;
      items += cobsIn.cobs.length;

      paginaAtual = pag + 1;
      console.log( "Page: " + paginaAtual, " = " + (new Date().getTime() - t.getTime() ) + "ms");

//      break;
    }

    console.log( "Total: ", items);

    for (let i = 0; i < 0; ++i) {
      let txid: string = crypto.randomUUID();
      txid = txid.replaceAll("-", "");
      //console.log( txid );
      //txid = '44858987833e4015b3447e6bbc057a1a' //'8cd912d5293d417fbf4ec3702df20ea9'
      //txid = 'd62083b450ed4d0a9efe8f983c145ff4';

      ///*
      const cobIn = await client.putCob(txid, { 
        ...testCob_Nascent,
        chave: "9e25c9c1-27f9-4cc6-9263-03080110dc83",
        infoAdicionais: undefined
      }
      ); // testCobVIn )//minCob );

      let qreq = Fetcher.buildFetchRequest("GET", {});
      let qr = await Fetcher.fetchRequest("https://" + cobIn.loc!.location, qreq);

      let jws = await qr.text();
      let pl = jws.split(".")[1];
      //console.log(pl);

      const pls = new TextDecoder().decode(base64.toUint8Array(pl));
      console.log("PAYLOAD: " + "https://" + cobIn.loc!.location);
      console.log(JSON.parse(pls));
      //* /

      let cobOut = await client.getCob(txid);

      console.log(cobOut);
    }

    const txid = "ab8163772e31415abe6fac3ec4b9f72f"; //"9e25c9c1-27f9-4cc6-9263-03080110dc83"
    await timedExec<void>( {
      init: async () => {
      },
      exec: async ( ) => {
        //const _cobOut = await client.getCob(txid);
      },
      cleanup: async( ) => {
      },
      count: 1 } );
  },
});

