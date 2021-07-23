import { Router } from "https://deno.land/x/oak/mod.ts";
import {
  Cobranca, CobType, Status,
  CobIdentifier, CobListIdentifier,
  PixApiCobService,
  ListCobPagedParams, Paginacao,
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
  const cobService = new PixApiCobService(new MemoryCobStore(), new MemoryLocStore(), cobType);

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

      const pagedListParams: ListCobPagedParams = {
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

      let pagedList = await cobService.listCobs( pagedListParams, id );
      let cobs = pagedList.items;
      delete pagedList.items

      //console.log( JSON.stringify( pagedListParams ) );

      context.response.body = { cobs, paginacao: pagedList };
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
    });
}

export function apiRouter(): Router {
  let router = new Router();

  cobRouter(router, "cob", "/api");
  cobRouter(router, "cobv", "/api");

  return router;
}
