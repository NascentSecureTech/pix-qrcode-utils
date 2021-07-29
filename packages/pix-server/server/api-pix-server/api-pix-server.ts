import { Router } from "https://deno.land/x/oak/mod.ts";
import {
  Cobranca, CobType, Status,
  CobIdentifier, CobListIdentifier,
  PixApiCobService,
  PagedListCobParams, Paginacao,
} from "../../../pix-api/src/mod.ts";
import { MemoryCobStore } from "./memory-cob-data-store.ts";
import { MemoryLocStore } from "./memory-loc-data-store.ts";

import { getBodyJSON, getRouteParams, getQueryParams } from "./helpers.ts";

function convertDate(s: string): Date {
  return new Date(s);
}

function convertInteger(s: string): number {
  return Number.parseInt(s,10);
}

function isPresent( b: any ) {
  return (b != undefined);
}

export function cobRouter(
  router: Router,
  cobType: CobType,
  path: string = ""
): void {
  const locStore = new MemoryLocStore("localhost:9666/pix/qr/");
  const cobStore = new MemoryCobStore();

  const cobService = new PixApiCobService(cobStore, locStore, cobType);

  router
    .get(path + "/" + cobType, async (context) => {
      let rawParams = getQueryParams(context);
      let pag = {
        paginaAtual: rawParams["paginacao.paginaAtual"],
        itensPorPagina: rawParams["paginacao.itensPorPagina"],
      }
      const paginacao: Paginacao = {
        paginaAtual: isPresent(pag.paginaAtual) ? convertInteger(pag.paginaAtual) : 0,
        itensPorPagina: isPresent(pag.itensPorPagina) ? convertInteger(pag.itensPorPagina) : 100,
      };

      const pagedListParams: PagedListCobParams = {
        inicio: convertDate(rawParams.inicio ?? ""),
        fim: convertDate(rawParams.fim ?? ""),
        cpf: rawParams.cpf,
        cnpj: rawParams.cnpj,
        locationPresente:
          rawParams.locationPresente !== undefined
            ? rawParams.locationPresente == "true"
              ? true
              : false
            : undefined,
        status: rawParams.status as Status,
        paginacao
      };

      const id: CobListIdentifier = {
        cobType,
        client_id: "0",
      };

      let pagedList = await cobService.getCobs( pagedListParams, id );
      let cobs = pagedList.items;
      delete pagedList.items

      //console.log( JSON.stringify( pagedListParams ) );

      context.response.body = {
        parameters: {
          inicio: rawParams.inicio,
          fim: rawParams.fim,
          paginacao: pagedList
        },

        cobs: cobs
    };
      //      context.response.body = "Hello world!";
    })
    .get(path + "/" + cobType + "/:txid", async (context) => {
      const { txid } = getRouteParams(context);

      try {
        const id: CobIdentifier = {
          txid,
          cobType,
          client_id: "0",
        };

        const cobOut = await cobService.getCob(id);

        context.response.body = cobOut;
      } catch (e) {
        context.response.status = 404;
      }
    })
    .post(path + "/" + cobType + "/:txid", async (context) => {
      const body = context.request.body();

      console.log( context.request.headers );
      console.log( body.type );
      console.log( await (body.value) );
      context.response.body = "OK";
    })
    .put(path + "/" + cobType + "/:txid", async (context) => {
      const { txid } = getRouteParams(context);
      console.log(txid);

      const cobIn = await getBodyJSON<Cobranca>(context);
      try {
        const id: CobIdentifier = {
          txid,
          cobType,
          client_id: "0",
        };

        console.log("writing to cobService");
        const cobOut = await cobService.putCob(id, cobIn);

        context.response.body = cobOut;
      } catch (e) {
        context.response.status = 404;
      }
    })
    .patch(path + "/" + cobType + "/:txid", async (context) => {
      const { txid } = getRouteParams(context);
      console.log(txid);

      const cobIn = await getBodyJSON<Cobranca>(context);
      try {
        const id: CobIdentifier = {
          txid,
          cobType,
          client_id: "0",
        };

        console.log("writing to cobService");
        const cobOut = await cobService.patchCob(id, cobIn);

        context.response.body = cobOut;
      } catch (e) {
        context.response.status = 404;
      }
    });
}

export function apiRouter(): Router {
  let router = new Router();

  cobRouter(router, "cob", "/api");
  cobRouter(router, "cobv", "/api");

  return router;
}
